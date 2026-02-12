import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import type { OrderStatus } from '@/types/database';
import { 
  getOrderShippedMessage, 
  getReadyToInvoiceMessage,
  type NotificationContext 
} from '@/lib/notifications';

// Verify admin authentication
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  
  return token && secret && token === secret;
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
    const { error: updateError } = await (supabaseAdmin as any)
      .from('orders')
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
      .select('*')
      .eq('id', id)
      .single();
    
    // Auto-send notifications on status changes
    if (body.status && updatedOrder) {
      await sendStatusNotification(updatedOrder, body.status);
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
    await (supabaseAdmin as any)
      .from('order_logs')
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

// Helper to send notifications on status change
async function sendStatusNotification(order: Record<string, unknown>, newStatus: string) {
  try {
    const ctx: NotificationContext = { order: order as any };
    let message = '';
    
    switch (newStatus) {
      case 'shipped':
        message = getOrderShippedMessage(ctx);
        break;
      case 'ready_to_invoice':
        message = getReadyToInvoiceMessage(ctx);
        break;
      default:
        return; // No notification for other statuses
    }
    
    // Log notification attempt
    console.log(`[Notification] Order ${order.id} -> ${newStatus}`);
    console.log(`[Notification] Customer: ${order.customer_email || order.customer_phone}`);
    console.log(`[Notification] Message preview: ${message.substring(0, 100)}...`);
    
    // Store notification for manual sending via WhatsApp
    await (supabaseAdmin as unknown as any)
      .from('order_logs')
      .insert({
        order_id: order.id,
        action: 'notification_generated',
        details: {
          status: newStatus,
          channel: 'whatsapp',
          message,
          customer_phone: order.customer_phone,
          customer_email: order.customer_email,
        },
        created_by: 'system',
      });
      
  } catch (error) {
    console.error('Failed to generate notification:', error);
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
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    
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
