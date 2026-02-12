import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyMPSignature, getMPPayment } from '@/lib/mercadopago';
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';

// 🔒 SECURE MERCADOPAGO WEBHOOK - MVP ORDER FLOW
// Payment → Reserve Stock → paid_pending_verification → Admin Review → Invoice

const STOCK_RESERVATION_HOURS = 24; // How long to hold stock

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 🔐 VERIFY WEBHOOK SIGNATURE (only in production)
    if (process.env.NODE_ENV === 'production') {
      const signature = request.headers.get('x-signature');
      const requestId = request.headers.get('x-request-id');
      
      if (!signature || !requestId) {
        console.error('Missing signature headers');
        return NextResponse.json({ received: false }, { status: 401 });
      }
      
      if (!verifyMPSignature(signature, requestId, body)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ received: false }, { status: 401 });
      }
    }
    
    // 1️⃣ EXTRACT PAYMENT ID
    const paymentId = body.data?.id;
    
    if (!paymentId) {
      console.log('No payment ID in webhook');
      return NextResponse.json({ received: true });
    }
    
    console.log('📥 Processing webhook for payment:', paymentId);
    
    // 2️⃣ FETCH PAYMENT INFO FROM MERCADOPAGO
    const payment = await getMPPayment(paymentId);
    
    if (!payment) {
      console.error('Failed to fetch payment from MercadoPago');
      return NextResponse.json({ received: true }, { status: 200 });
    }
    
    const orderId = payment.external_reference;
    
    if (!orderId) {
      console.error('No external_reference in payment');
      return NextResponse.json({ received: true });
    }
    
    // 3️⃣ FETCH ORDER FROM DATABASE
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('Order not found:', orderId);
      return NextResponse.json({ received: true });
    }
    
    const orderData: any = order;
    
    // 4️⃣ IDEMPOTENCY CHECK - Don't process same payment twice
    const processedStatuses = ['paid', 'invoiced', 'shipped', 'delivered'];
    if (orderData.mp_payment_id === paymentId && processedStatuses.includes(orderData.status)) {
      console.log('✅ Payment already processed, skipping');
      return NextResponse.json({ received: true });
    }
    
    // 5️⃣ VERIFY PAYMENT AMOUNT (CRITICAL ANTI-FRAUD)
    const expectedAmount = Number(orderData.total);
    const paidAmount = Number(payment.transaction_amount);
    
    if (Math.abs(expectedAmount - paidAmount) > 0.01) {
      console.error('⚠️ PAYMENT AMOUNT MISMATCH!', {
        orderId: orderData.id,
        orderNumber: orderData.order_number,
        expected: expectedAmount,
        paid: paidAmount,
        difference: paidAmount - expectedAmount,
        paymentId: paymentId,
      });
      
      // Mark as cancelled and log event
      await supabaseAdmin
        .from('orders')
        // @ts-expect-error - Supabase type inference issue
        .update({
          status: 'cancelled',
          notes: `⚠️ FRAUDE POTENCIAL: Monto esperado ${expectedAmount}, pagado ${paidAmount}`,
          mp_payment_id: paymentId,
          meta: payment,
        })
        .eq('id', orderData.id);
      
      // Log the fraud attempt
      await logOrderEvent(orderData.id, 'payment_fraud_detected', orderData.status, 'cancelled', {
        expected: expectedAmount,
        paid: paidAmount,
        payment_id: paymentId,
      });
      
      return NextResponse.json({ received: true });
    }
    
    // 6️⃣ PREPARE BASE UPDATE DATA
    const updateData: any = {
      mp_payment_id: paymentId,
      payment_method: payment.payment_type_id,
      meta: payment,
    };
    
    // 7️⃣ PROCESS BASED ON PAYMENT STATUS
    if (payment.status === 'approved') {
      updateData.paid_at = new Date().toISOString();
      
      // 🔒 ATOMIC STOCK RESERVATION using RPC function
      const { data: reservationResult, error: reserveError } = await supabaseAdmin
        .rpc('reserve_stock_for_order', {
          p_order_id: orderData.id,
          p_reservation_hours: STOCK_RESERVATION_HOURS,
        });
      
      if (reserveError) {
        console.error('Stock reservation RPC error:', reserveError);
        // Fallback: mark as out_of_stock for manual review
        updateData.status = 'out_of_stock';
        updateData.notes = `Error al reservar stock: ${reserveError.message}. Revisar manualmente.`;
        
        await logOrderEvent(orderData.id, 'stock_reservation_error', orderData.status, 'out_of_stock', {
          error: reserveError.message,
        });
      } else if (reservationResult?.success) {
        // ✅ Stock reserved successfully - mark as PAID (ready for invoice)
        updateData.status = 'paid';
        updateData.stock_reserved = true;
        updateData.reserved_until = reservationResult.expires_at;
        
        console.log(`✅ Order ${orderData.order_number} - Paid & stock reserved until ${reservationResult.expires_at}`);
        
        await logOrderEvent(orderData.id, 'payment_approved_stock_reserved', orderData.status, 'paid', {
          payment_id: paymentId,
          expires_at: reservationResult.expires_at,
        });
      } else {
        // ❌ Stock insufficient
        updateData.status = 'out_of_stock';
        updateData.stock_reserved = false;
        
        const failedProducts = reservationResult?.failed_products || [];
        const failedNames = failedProducts.map((p: any) => p.name).join(', ');
        updateData.notes = `Sin stock suficiente: ${failedNames}. Contactar cliente.`;
        
        console.log(`⚠️ Order ${orderData.order_number} - Insufficient stock:`, failedProducts);
        
        await logOrderEvent(orderData.id, 'payment_approved_no_stock', orderData.status, 'out_of_stock', {
          payment_id: paymentId,
          failed_products: failedProducts,
        });
        
        // TODO: Send notification to customer about stock issue
      }
      
      // Increment coupon usage if used
      if (orderData.coupon_code) {
        const { data: coupon } = await supabaseAdmin
          .from('discount_coupons')
          .select('current_uses')
          .eq('code', orderData.coupon_code)
          .single();
        
        if (coupon) {
          const couponData: any = coupon;
          await supabaseAdmin
            .from('discount_coupons')
            // @ts-expect-error - Supabase type inference issue
            .update({ 
              current_uses: (couponData.current_uses || 0) + 1 
            })
            .eq('code', orderData.coupon_code);
        }
      }
      
      // 📧 SEND EMAIL CONFIRMATIONS (async, don't block webhook)
      try {
        // Fetch order items for email
        const { data: orderItems } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .eq('order_id', orderData.id);
        
        if (orderItems && orderItems.length > 0) {
          const emailTimestamps: Record<string, string> = {};
          
          // Send to customer
          try {
            await sendOrderConfirmation({ order: orderData, items: orderItems });
            emailTimestamps.confirmation_email_sent_at = new Date().toISOString();
          } catch (err) {
            console.error('Failed to send customer email:', err);
          }
          
          // Send to admin
          try {
            await sendAdminOrderNotification({ order: orderData, items: orderItems });
            emailTimestamps.admin_notified_at = new Date().toISOString();
          } catch (err) {
            console.error('Failed to send admin email:', err);
          }
          
          // Update order with email timestamps
          if (Object.keys(emailTimestamps).length > 0) {
            // @ts-expect-error - Supabase type inference issue
            await supabaseAdmin
              .from('orders')
              .update(emailTimestamps)
              .eq('id', orderData.id);
          }
        }
      } catch (emailError) {
        console.error('Email sending error (non-blocking):', emailError);
      }
      
      console.log(`✅ Order ${orderData.order_number} payment processed`);
      
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      updateData.status = 'cancelled';
      
      await logOrderEvent(orderData.id, 'payment_rejected', orderData.status, 'cancelled', {
        payment_id: paymentId,
        payment_status: payment.status,
        status_detail: payment.status_detail,
      });
      
      console.log(`❌ Order ${orderData.order_number} cancelled/rejected`);
      
    } else {
      // pending, in_process, etc.
      updateData.status = 'pending';
      console.log(`⏳ Order ${orderData.order_number} status: ${payment.status}`);
    }
    
    // 8️⃣ UPDATE ORDER
    await supabaseAdmin
      .from('orders')
      // @ts-expect-error - Supabase type inference issue
      .update(updateData)
      .eq('id', orderData.id);
    
    // ALWAYS return 200 so MP doesn't retry
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    // ALWAYS return 200 so MP doesn't retry on errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

// Helper function to log order events
async function logOrderEvent(
  orderId: string,
  action: string,
  oldStatus: string,
  newStatus: string,
  details?: Record<string, unknown>
) {
  try {
    await supabaseAdmin
      .from('order_logs')
      .insert({
        order_id: orderId,
        action,
        old_status: oldStatus,
        new_status: newStatus,
        details,
        created_by: 'webhook',
      });
  } catch (error) {
    console.error('Failed to log order event:', error);
    // Don't throw - logging failures shouldn't break the webhook
  }
}
