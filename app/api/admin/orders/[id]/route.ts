import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { OrderStatus } from '@/types/database';
import { inngest } from '@/lib/inngest';

type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total: number;
  subtotal: number;
  discount_amount: number;
  coupon_code: string | null;
  currency: string | null;
  payment_method: string | null;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_department: string | null;
  shipping_type: string | null;
  shipping_cost: number | null;
  notes: string | null;
  stock_reserved: boolean | null;
  invoice_number: string | null;
  invoice_type: string | null;
  invoice_tax_id: string | null;
  invoice_business_name: string | null;
  invoiced_at: string | null;
  invoice_file_url: string | null;
  created_at: string;
  updated_at: string;
};

type AdminOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  currency: string;
  unit_price_converted: number | null;
  subtotal: number;
  created_at: string;
};

type AdminOrderWithItems = AdminOrder & {
  order_items: AdminOrderItem[];
};

const ORDER_SELECT_FIELDS = 'id, order_number, status, customer_name, customer_email, customer_phone, total, subtotal, discount_amount, coupon_code, currency, payment_method, mp_payment_id, mp_preference_id, shipping_address, shipping_city, shipping_department, shipping_type, shipping_cost, notes, stock_reserved, invoice_number, invoice_type, invoice_tax_id, invoice_business_name, invoiced_at, invoice_file_url, created_at, updated_at';
const ORDER_ITEM_SELECT_FIELDS = 'id, order_id, product_id, product_name, quantity, unit_price, currency, unit_price_converted, subtotal, created_at';

const ordersWriteTable = supabaseAdmin.from('orders') as unknown as {
  update: (values: Record<string, unknown>) => {
    eq: (column: 'id', value: string) => Promise<{ error: unknown }>;
  };
};

const orderLogsWriteTable = supabaseAdmin.from('order_logs') as unknown as {
  insert: (values: {
    order_id: string;
    action: string;
    old_status: string | undefined;
    new_status: unknown;
    details: Record<string, unknown>;
    created_by: string;
  }) => Promise<{ error?: unknown }>;
};

// Verify admin authentication via Clerk
async function verifyAdmin() {
  const { userId } = await auth();
  return !!userId;
}

export async function PATCH(
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
  
  const { id } = await params;

  try {
    const body = await request.json();

    // Fetch current order for old status comparison
    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('status, customer_name, order_number, payment_method')
      .eq('id', id)
      .single() as { data: { status: string; customer_name: string; order_number: string; payment_method: string | null } | null };

    const oldStatus = currentOrder?.status;

    // Build update data - accept multiple fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    // Status update
    if (body.status) {
      const validStatuses: OrderStatus[] = [
        'pending', 'paid', 'paid_pending_verification', 'awaiting_stock',
        'ready_to_invoice', 'invoiced', 'processing', 'shipped', 
        'delivered', 'cancelled', 'refunded'
      ];
      if (!validStatuses.includes(body.status as OrderStatus)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }
    
    // Invoice fields
    if (body.invoice_number !== undefined) {
      updateData.invoice_number = body.invoice_number;
    }
    if (body.invoice_type !== undefined) {
      updateData.invoice_type = body.invoice_type;
    }
    if (body.invoice_tax_id !== undefined) {
      updateData.invoice_tax_id = body.invoice_tax_id;
    }
    if (body.invoice_business_name !== undefined) {
      updateData.invoice_business_name = body.invoice_business_name;
    }
    if (body.invoiced_at !== undefined) {
      updateData.invoiced_at = body.invoiced_at;
    }
    if (body.invoice_file_url !== undefined) {
      updateData.invoice_file_url = body.invoice_file_url;
    }
    
    // Notes
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }
    
    // Direct update with type assertion
    const { error: updateError } = await ordersWriteTable
      .update(updateData)
      .eq('id', id);
    
    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      );
    }
    
    // Log the event
    await logOrderEvent(id, 'order_updated', body.status, updateData);
    
    // Fetch updated order
    const { data: updatedOrder } = await supabaseAdmin
      .from('orders')
      .select(ORDER_SELECT_FIELDS)
      .eq('id', id)
      .single() as { data: AdminOrder | null };
    
    // Fire Inngest event for background notifications
    if (body.status && updatedOrder && oldStatus !== body.status) {
      const isTransferPaid = body.status === 'paid' && currentOrder?.payment_method === 'transfer';

      if (isTransferPaid) {
        // For bank transfer orders marked paid, fire the same event as the MP webhook.
        // This sends the full OrderConfirmation email with item list instead of the minimal StatusUpdate.
        inngest.send({
          name: 'order/payment.approved',
          data: {
            orderId: id,
            orderNumber: updatedOrder.order_number || id,
            customerName: updatedOrder.customer_name || '',
            customerEmail: updatedOrder.customer_email || null,
            customerPhone: updatedOrder.customer_phone || null,
            total: Number(updatedOrder.total || 0),
            currency: updatedOrder.currency || 'UYU',
            paymentId: `transfer-${id}`,
            status: 'paid',
            stockReserved: updatedOrder.stock_reserved ?? false,
          },
        }).catch((err) => {
          console.error('[Inngest] Failed to send order/payment.approved for transfer:', err);
        });
      } else {
        inngest.send({
          name: 'order/status.changed',
          data: {
            orderId: id,
            orderNumber: updatedOrder.order_number || id,
            oldStatus: oldStatus || '',
            newStatus: body.status,
            customerName: updatedOrder.customer_name || '',
            customerEmail: updatedOrder.customer_email || null,
            customerPhone: updatedOrder.customer_phone || null,
            total: Number(updatedOrder.total || 0),
            currency: updatedOrder.currency || 'UYU',
          },
        }).catch((err) => {
          console.error('[Inngest] Failed to send order/status.changed:', err);
        });
      }
    }
    
    return NextResponse.json({ success: true, order: updatedOrder });
    
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to log order events
async function logOrderEvent(orderId: string, action: string, oldStatus: string | undefined, details: Record<string, unknown>) {
  try {
    await orderLogsWriteTable
      .insert({
        order_id: orderId,
        action,
        old_status: oldStatus,
        new_status: details.status || null,
        details,
        created_by: 'admin',
      });
  } catch (error) {
    console.error('Failed to log order event:', error);
  }
}

export async function GET(
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
  
  const { id } = await params;
  
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`${ORDER_SELECT_FIELDS}, order_items(${ORDER_ITEM_SELECT_FIELDS})`)
      .eq('id', id)
      .single() as { data: AdminOrderWithItems | null; error: unknown };
    
    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, order });
    
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
