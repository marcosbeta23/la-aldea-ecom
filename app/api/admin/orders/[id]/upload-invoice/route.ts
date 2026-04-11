import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendInvoiceEmail } from '@/lib/email';
import type { Order, OrderItem } from '@/types/database';

type InvoiceOrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_department: string | null;
  shipping_type: string;
  shipping_cost: number;
  subtotal: number;
  discount_amount: number;
  coupon_code: string | null;
  total: number;
  currency: string;
  payment_method: string | null;
  status: string;
  notes: string | null;
  invoice_type: string;
  invoice_tax_id: string | null;
  invoice_business_name: string | null;
  invoice_number: string | null;
  invoice_file_url: string | null;
  invoiced_at: string | null;
  created_at: string;
  updated_at: string;
};

type InvoiceOrderItemRow = {
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

const ORDER_SELECT_FIELDS = 'id, order_number, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_department, shipping_type, shipping_cost, subtotal, discount_amount, coupon_code, total, currency, payment_method, status, notes, invoice_type, invoice_tax_id, invoice_business_name, invoice_number, invoice_file_url, invoiced_at, created_at, updated_at';
const ORDER_ITEM_SELECT_FIELDS = 'id, order_id, product_id, product_name, quantity, unit_price, currency, unit_price_converted, subtotal, created_at';

const orderLogsWriteTable = supabaseAdmin.from('order_logs') as unknown as {
  insert: (values: {
    order_id: string;
    action: string;
    details: string;
    created_by: string;
  }) => Promise<{ error?: unknown }>;
};

const ordersWriteTable = supabaseAdmin.from('orders') as unknown as {
  update: (values: Record<string, unknown>) => {
    eq: (column: 'id', value: string) => Promise<{ error: unknown }>;
  };
};

// Verify admin authentication via Clerk
async function verifyAdmin() {
  const { userId } = await auth();
  return !!userId;
}

// Log order events
async function logOrderEvent(
  orderId: string, 
  action: string, 
  details: Record<string, unknown>
) {
  try {
    await orderLogsWriteTable.insert({
      order_id: orderId,
      action,
      details: JSON.stringify(details),
      created_by: 'admin',
    });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
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
    // Get form data with file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const invoiceNumber = formData.get('invoice_number') as string | null;
    const invoiceType = formData.get('invoice_type') as string | null;
    const invoiceTaxId = formData.get('invoice_tax_id') as string | null;
    const invoiceBusinessName = formData.get('invoice_business_name') as string | null;
    const sendEmail = formData.get('send_email') === 'true';
    
    // Validate required fields
    if (!invoiceNumber?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Invoice number is required' },
        { status: 400 }
      );
    }
    
    // Fetch the order first
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(ORDER_SELECT_FIELDS)
      .eq('id', orderId)
      .single() as { data: InvoiceOrderRow | null; error: unknown };
    
    if (orderError || !orderData) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    const order = orderData as unknown as Order;
    
    let invoiceFileUrl: string | null = null;
    
    // Upload file to Supabase Storage if provided
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { success: false, error: 'Only PDF files are allowed' },
          { status: 400 }
        );
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'File size must be under 5MB' },
          { status: 400 }
        );
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `invoices/${order.order_number}_${timestamp}.pdf`;
      
      // Convert File to ArrayBuffer then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin
        .storage
        .from('invoices')
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload file: ' + uploadError.message },
          { status: 500 }
        );
      }
      
      // Get public URL
      const { data: urlData } = supabaseAdmin
        .storage
        .from('invoices')
        .getPublicUrl(fileName);
      
      invoiceFileUrl = urlData.publicUrl;
    }
    
    // Update order with invoice data
    const updateData: Record<string, unknown> = {
      invoice_number: invoiceNumber,
      invoice_type: invoiceType || 'consumer_final',
      invoice_tax_id: invoiceTaxId || null,
      invoice_business_name: invoiceBusinessName || null,
      invoiced_at: new Date().toISOString(),
      status: 'invoiced',
      updated_at: new Date().toISOString(),
    };
    
    if (invoiceFileUrl) {
      updateData.invoice_file_url = invoiceFileUrl;
    }
    
    const { error: updateError } = await ordersWriteTable
      .update(updateData)
      .eq('id', orderId);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      );
    }
    
    // Log the event
    await logOrderEvent(orderId, 'invoice_uploaded', {
      invoice_number: invoiceNumber,
      invoice_type: invoiceType,
      has_file: !!invoiceFileUrl,
      file_url: invoiceFileUrl,
    });
    
    // Send email to customer if requested
    let emailSent = false;
    if (sendEmail && order.customer_email) {
      // Fetch order items for email
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select(ORDER_ITEM_SELECT_FIELDS)
        .eq('order_id', orderId) as { data: InvoiceOrderItemRow[] | null };
      
      emailSent = await sendInvoiceEmail({
        order: { ...order, ...updateData } as Order,
        items: (orderItems || []) as OrderItem[],
        invoiceFileUrl: invoiceFileUrl || undefined,
      });
      
      if (emailSent) {
        // Update order with email sent timestamp
        await ordersWriteTable
          .update({ invoice_email_sent_at: new Date().toISOString() })
          .eq('id', orderId);
        
        await logOrderEvent(orderId, 'invoice_email_sent', {
          to: order.customer_email,
          invoice_number: invoiceNumber,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      invoice_file_url: invoiceFileUrl,
      email_sent: emailSent,
    });
    
  } catch (error) {
    console.error('Upload invoice error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
