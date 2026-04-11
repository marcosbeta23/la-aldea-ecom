import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { inngest } from '@/lib/inngest';
import { alertRefundProcessed } from '@/lib/telegram';

type RefundOrder = {
  id: string;
  order_number: string;
  status: string;
  mp_payment_id: string | null;
  total: number;
  notes: string | null;
  stock_reserved: boolean | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  currency: string | null;
};

const ordersWriteTable = supabaseAdmin.from('orders') as unknown as {
  update: (values: Record<string, unknown>) => {
    eq: (column: 'id', value: string) => Promise<{ error: unknown }>;
  };
};

const orderLogsWriteTable = supabaseAdmin.from('order_logs') as unknown as {
  insert: (values: {
    order_id: string;
    action: string;
    old_status: string;
    new_status: string;
    details: Record<string, unknown>;
    created_by: string;
  }) => Promise<{ error?: unknown }>;
};

const rpcClient = supabaseAdmin as unknown as {
  rpc: (
    fn: 'restore_stock_for_order',
    args: { p_order_id: string }
  ) => Promise<{ error?: unknown }>;
};

// Verify admin authentication via Clerk
async function verifyAdmin() {
  const { userId } = await auth();
  return !!userId;
}

// MercadoPago Refund API
async function createMPRefund(paymentId: string, amount?: number) {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('MP_ACCESS_TOKEN not configured');
  }

  const refundBody: Record<string, unknown> = {};
  if (amount) {
    refundBody.amount = amount;
  }

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundBody),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('MercadoPago refund error:', error);
    throw new Error(error.message || 'Failed to process refund with MercadoPago');
  }

  return response.json();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin
  if (!(await verifyAdmin())) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id: orderId } = await params;

  try {
    const body = await request.json();
    const { amount, reason, restoreStock = true } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Refund reason is required' },
        { status: 400 }
      );
    }

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status, mp_payment_id, total, notes, stock_reserved, customer_name, customer_email, customer_phone, currency')
      .eq('id', orderId)
      .single() as { data: RefundOrder | null; error: unknown };

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = order;

    // Validate order can be refunded
    if (orderData.status === 'refunded') {
      return NextResponse.json(
        { success: false, error: 'Order already refunded' },
        { status: 400 }
      );
    }

    if (!orderData.mp_payment_id) {
      return NextResponse.json(
        { success: false, error: 'Order has no MercadoPago payment ID' },
        { status: 400 }
      );
    }

    // Validate amount
    const refundAmount = amount ? Number(amount) : orderData.total;
    if (refundAmount <= 0 || refundAmount > orderData.total) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund amount' },
        { status: 400 }
      );
    }

    let mpRefund;
    let refundStatus = 'pending';

    // Process refund with MercadoPago
    try {
      mpRefund = await createMPRefund(
        orderData.mp_payment_id,
        refundAmount < orderData.total ? refundAmount : undefined // Partial refund
      );
      refundStatus = 'completed';
      console.log('MercadoPago refund processed:', mpRefund);
    } catch (mpError: unknown) {
      const mpMessage = mpError instanceof Error ? mpError.message : 'Unknown MercadoPago refund error';
      console.error('MercadoPago refund failed:', mpError);
      refundStatus = 'failed';

      // Still update order with failed refund status so admin can retry
      await ordersWriteTable
        .update({
          refund_status: 'failed',
          refund_amount: refundAmount,
          refund_reason: reason,
          notes: `${orderData.notes || ''}\n\n⚠️ Refund failed: ${mpMessage}`.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Telegram alert for failed refund
      alertRefundProcessed(orderData.order_number, refundAmount, false, orderData.customer_name || '', orderData.currency || 'UYU').catch(() => { });

      return NextResponse.json(
        { success: false, error: `MercadoPago refund failed: ${mpMessage}` },
        { status: 500 }
      );
    }

    // Restore stock if requested
    if (restoreStock && orderData.stock_reserved) {
      try {
        await rpcClient.rpc('restore_stock_for_order', {
          p_order_id: orderId,
        });
        console.log('Stock restored for order:', orderId);
      } catch (stockError) {
        console.error('Failed to restore stock:', stockError);
        // Don't fail the refund, just log it
      }
    }

    // Update order
    const { error: updateError } = await ordersWriteTable
      .update({
        status: 'refunded',
        refund_id: mpRefund?.id?.toString() || null,
        refund_amount: refundAmount,
        refund_reason: reason,
        refund_status: refundStatus,
        refunded_at: new Date().toISOString(),
        stock_reserved: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order after refund:', updateError);
      // Refund already processed with MP, so return partial success
    }

    // Log the event
    await orderLogsWriteTable
      .insert({
        order_id: orderId,
        action: 'refund_processed',
        old_status: orderData.status,
        new_status: 'refunded',
        details: {
          refund_amount: refundAmount,
          refund_reason: reason,
          mp_refund_id: mpRefund?.id,
          restore_stock: restoreStock,
        },
        created_by: 'admin',
      });

    // Telegram alert for successful refund
    alertRefundProcessed(orderData.order_number, refundAmount, true, orderData.customer_name || '', orderData.currency || 'UYU').catch(() => { });

    inngest.send({
      name: 'order/status.changed',
      data: {
        orderId,
        orderNumber: orderData.order_number,
        oldStatus: orderData.status,
        newStatus: 'refunded',
        customerName: orderData.customer_name || '',
        customerEmail: orderData.customer_email || null,
        customerPhone: orderData.customer_phone || null,
        total: refundAmount,
        currency: orderData.currency || 'UYU',
      },
    }).catch(() => { });

    return NextResponse.json({
      success: true,
      refund: {
        id: mpRefund?.id,
        amount: refundAmount,
        status: refundStatus,
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Refund error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
