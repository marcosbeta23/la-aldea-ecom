import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Order, OrderItem } from '@/types/database';

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LA-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_department,
      shipping_method,
      shipping_cost,
      notes,
      coupon_code,
      discount_amount,
      subtotal,
      total,
      items,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone) {
      return NextResponse.json(
        { error: 'Datos de cliente incompletos' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El pedido debe tener al menos un producto' },
        { status: 400 }
      );
    }

    // Generate unique order number
    const order_number = generateOrderNumber();

    // Create order
    const { data, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_city,
        shipping_department,
        shipping_method,
        shipping_cost,
        notes,
        coupon_code,
        discount_amount: discount_amount || 0,
        subtotal,
        total,
        status: 'pending',
        payment_status: 'pending',
      } as any)
      .select()
      .single();

    if (orderError || !data) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Error al crear el pedido' },
        { status: 500 }
      );
    }

    const order = data as Order;

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems as any);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // Don't fail the whole order, items can be recovered
    }

    // Update coupon usage if used
    if (coupon_code) {
      try {
        const { data: couponData } = await supabaseAdmin
          .from('coupons')
          .select('used_count')
          .eq('code', coupon_code)
          .single();
        
        if (couponData) {
          const newCount = ((couponData as Record<string, number>).used_count || 0) + 1;
          await (supabaseAdmin
            .from('coupons') as any)
            .update({ used_count: newCount })
            .eq('code', coupon_code);
        }
      } catch (e) {
        console.error('Coupon update error:', e);
      }
    }

    // Update product stock
    for (const item of items) {
      try {
        const { data: productData } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();
        
        if (productData) {
          const currentStock = (productData as Record<string, number>).stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await (supabaseAdmin
            .from('products') as any)
            .update({ stock: newStock })
            .eq('id', item.product_id);
        }
      } catch (e) {
        console.error('Stock update error:', e);
      }
    }

    // TODO: Create MercadoPago preference in Week 3
    // For now, return order info without payment URL
    // In Week 3, we'll add MP integration here

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      order_id: order.id,
      // payment_url will be added in Week 3
    });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pedido' },
      { status: 500 }
    );
  }
}

// Get order by order number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('order_number');

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Número de orden requerido' },
        { status: 400 }
      );
    }

    // Fetch order with items
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Error al obtener el pedido' },
      { status: 500 }
    );
  }
}
