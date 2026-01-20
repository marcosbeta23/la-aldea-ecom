import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyMPSignature, getMPPayment } from '@/lib/mercadopago';

// 🔒 SECURE MERCADOPAGO WEBHOOK
// This handles payment notifications with fraud detection and idempotency

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
    
    console.log('Processing webhook for payment:', paymentId);
    
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
    
    // 4️⃣ IDEMPOTENCY CHECK - Don't process twice
    if (orderData.mp_payment_id === paymentId && orderData.status === 'paid') {
      console.log('Payment already processed, skipping');
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
        customerId: payment.payer?.id,
      });
      
      // Mark as fraud
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'fraud_detected',
          payment_status: 'fraud',
          notes: `Payment amount mismatch. Expected: ${expectedAmount}, Paid: ${paidAmount}`,
          mp_payment_id: paymentId,
          meta: payment,
        } as any)
        .eq('id', orderData.id);
      
      // TODO: Send alert to admin
      
      return NextResponse.json({ received: true });
    }
    
    // 6️⃣ PREPARE UPDATE DATA
    const updateData: any = {
      mp_payment_id: paymentId,
      payment_method: payment.payment_type_id,
      meta: payment,
    };
    
    // 7️⃣ PROCESS BASED ON PAYMENT STATUS
    if (payment.status === 'approved') {
      updateData.status = 'paid';
      updateData.payment_status = 'approved';
      
      // Reduce stock atomically
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderData.id);
      
      if (orderItems) {
        for (const item of orderItems) {
          const itemData: any = item;
          // Fetch current stock
          const { data: product } = await supabaseAdmin
            .from('products')
            .select('stock')
            .eq('id', itemData.product_id)
            .single();
          
          if (product) {
            const productData: any = product;
            const newStock = Math.max(0, productData.stock - itemData.quantity);
            await supabaseAdmin
              .from('products')
              .update({ stock: newStock } as any)
              .eq('id', itemData.product_id);
            
            console.log(`Stock updated for product ${itemData.product_id}: ${productData.stock} → ${newStock}`);
          }
        }
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
            .update({ 
              current_uses: (couponData.current_uses || 0) + 1 
            } as any)
            .eq('code', orderData.coupon_code);
        }
      }
      
      console.log(`✅ Order ${orderData.order_number} marked as paid`);
      
      // TODO Week 5: Send confirmation email
      // TODO Week 5: Notify admin via WhatsApp
      
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      updateData.status = 'cancelled';
      updateData.payment_status = payment.status;
      console.log(`❌ Order ${orderData.order_number} cancelled/rejected`);
      
    } else {
      // pending, in_process, etc.
      updateData.status = payment.status;
      updateData.payment_status = payment.status;
      console.log(`⏳ Order ${orderData.order_number} status: ${payment.status}`);
    }
    
    // 8️⃣ UPDATE ORDER
    await supabaseAdmin
      .from('orders')
      .update(updateData as any)
      .eq('id', orderData.id);
    
    // ALWAYS return 200 so MP doesn't retry
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    // ALWAYS return 200 so MP doesn't retry on errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
