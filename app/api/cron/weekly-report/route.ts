import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramAlert } from '@/lib/telegram';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@laaldeatala.com.uy';
const FROM_NAME = process.env.FROM_NAME || 'La Aldea';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@laaldeatala.com.uy';
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify cron authentication
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'invoiced', 'ready_to_invoice', 'paid_pending_verification'];

    // Fetch this week's orders
    const { data: thisWeekOrders } = await (supabaseAdmin as any)
      .from('orders')
      .select('id, status, total, payment_method, order_source, created_at')
      .gte('created_at', weekStart.toISOString())
      .order('created_at', { ascending: false });

    const orders = (thisWeekOrders || []) as Array<{
      id: string; status: string; total: number;
      payment_method: string | null; order_source: string | null; created_at: string;
    }>;

    // Fetch previous week's orders
    const { data: prevWeekOrders } = await (supabaseAdmin as any)
      .from('orders')
      .select('id, status, total')
      .gte('created_at', prevWeekStart.toISOString())
      .lt('created_at', weekStart.toISOString());

    const prevOrders = (prevWeekOrders || []) as Array<{
      id: string; status: string; total: number;
    }>;

    // This week stats
    const paidOrders = orders.filter(o => paidStatuses.includes(o.status));
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // Previous week stats
    const prevPaidOrders = prevOrders.filter(o => paidStatuses.includes(o.status));
    const prevRevenue = prevPaidOrders.reduce((s, o) => s + (o.total || 0), 0);

    const revenueChange = prevRevenue > 0
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;

    // Revenue by source
    const onlineRevenue = paidOrders
      .filter(o => (o.order_source || 'online') !== 'mostrador')
      .reduce((s, o) => s + (o.total || 0), 0);
    const mostradorRevenue = paidOrders
      .filter(o => o.order_source === 'mostrador')
      .reduce((s, o) => s + (o.total || 0), 0);

    // Status counts
    const statusCounts: Record<string, number> = {};
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    // Top 5 products
    const orderIds = paidOrders.map(o => o.id);
    const { data: itemsData } = await supabaseAdmin
      .from('order_items')
      .select('product_name, quantity, subtotal')
      .in('order_id', orderIds.length > 0 ? orderIds : ['none']) as {
        data: Array<{ product_name: string; quantity: number; subtotal: number }> | null;
      };

    const productSales: Record<string, { sold: number; revenue: number }> = {};
    for (const item of (itemsData || [])) {
      if (!productSales[item.product_name]) {
        productSales[item.product_name] = { sold: 0, revenue: 0 };
      }
      productSales[item.product_name].sold += item.quantity;
      productSales[item.product_name].revenue += item.subtotal || 0;
    }

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    // Low stock alerts
    const { data: lowStockProducts } = await (supabaseAdmin as any)
      .from('products')
      .select('name, sku, stock')
      .eq('is_active', true)
      .lt('stock', 5)
      .gt('stock', 0)
      .order('stock', { ascending: true })
      .limit(10);

    const lowStock = (lowStockProducts || []) as Array<{ name: string; sku: string; stock: number }>;

    // Out of stock
    const { data: outOfStockProducts } = await (supabaseAdmin as any)
      .from('products')
      .select('name, sku')
      .eq('is_active', true)
      .eq('stock', 0)
      .limit(10);

    const outOfStock = (outOfStockProducts || []) as Array<{ name: string; sku: string }>;

    // Format currency
    const fmt = (v: number) => `$${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

    // Format dates
    const dateRange = `${weekStart.toLocaleDateString('es-UY')} - ${now.toLocaleDateString('es-UY')}`;

    // === Build HTML Email ===
    const statusLabels: Record<string, string> = {
      pending: 'Pendiente', paid: 'Pagado', paid_pending_verification: 'Por verificar',
      processing: 'En preparación', shipped: 'Enviado', delivered: 'Entregado',
      cancelled: 'Cancelado', refunded: 'Reembolsado', invoiced: 'Facturado',
      ready_to_invoice: 'Por facturar', awaiting_stock: 'Sin stock',
    };

    const changeArrow = revenueChange >= 0 ? '&#9650;' : '&#9660;';
    const changeColor = revenueChange >= 0 ? '#16a34a' : '#dc2626';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f1f5f9; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
    <!-- Header -->
    <div style="background: #1e293b; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">La Aldea - Reporte Semanal</h1>
      <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">${dateRange}</p>
    </div>

    <div style="padding: 24px;">
      <!-- Revenue Summary -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 4px; color: #64748b; font-size: 13px;">Ingresos de la semana</p>
        <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1e293b;">${fmt(totalRevenue)}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: ${changeColor};">
          ${changeArrow} ${Math.abs(revenueChange)}% vs semana anterior (${fmt(prevRevenue)})
        </p>
      </div>

      <!-- Key Metrics -->
      <table style="width: 100%; margin-bottom: 20px;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px; text-align: center; background: #f8fafc; border-radius: 8px;">
            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e293b;">${paidOrders.length}</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Pedidos pagados</p>
          </td>
          <td style="width: 8px;"></td>
          <td style="padding: 8px; text-align: center; background: #f8fafc; border-radius: 8px;">
            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e293b;">${fmt(avgOrderValue)}</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Ticket promedio</p>
          </td>
          <td style="width: 8px;"></td>
          <td style="padding: 8px; text-align: center; background: #f8fafc; border-radius: 8px;">
            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e293b;">${orders.length}</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Total pedidos</p>
          </td>
        </tr>
      </table>

      <!-- Revenue by Source -->
      <h3 style="font-size: 15px; color: #1e293b; margin: 20px 0 8px;">Ingresos por Canal</h3>
      <table style="width: 100%; margin-bottom: 20px;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 10px; background: #eff6ff; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: #3b82f6; font-weight: 600;">Online</p>
            <p style="margin: 2px 0 0; font-size: 18px; font-weight: bold; color: #1e293b;">${fmt(onlineRevenue)}</p>
          </td>
          <td style="width: 8px;"></td>
          <td style="padding: 10px; background: #ecfdf5; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: #10b981; font-weight: 600;">Mostrador</p>
            <p style="margin: 2px 0 0; font-size: 18px; font-weight: bold; color: #1e293b;">${fmt(mostradorRevenue)}</p>
          </td>
        </tr>
      </table>

      <!-- Top Products -->
      <h3 style="font-size: 15px; color: #1e293b; margin: 20px 0 8px;">Top 5 Productos</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        ${topProducts.map(([name, data], i) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; font-size: 13px; color: #64748b;">${i + 1}.</td>
          <td style="padding: 8px 4px; font-size: 13px; color: #1e293b;">${name}</td>
          <td style="padding: 8px 0; font-size: 13px; color: #64748b; text-align: right;">${data.sold} uds</td>
          <td style="padding: 8px 0; font-size: 13px; color: #16a34a; text-align: right; font-weight: 600;">${fmt(data.revenue)}</td>
        </tr>`).join('')}
      </table>

      <!-- Order Status -->
      <h3 style="font-size: 15px; color: #1e293b; margin: 20px 0 8px;">Estado de Pedidos</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        ${Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([status, count]) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 6px 0; font-size: 13px; color: #475569;">${statusLabels[status] || status}</td>
          <td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right; font-weight: 600;">${count}</td>
        </tr>`).join('')}
      </table>

      <!-- Stock Alerts -->
      ${(lowStock.length > 0 || outOfStock.length > 0) ? `
      <h3 style="font-size: 15px; color: #dc2626; margin: 20px 0 8px;">Alertas de Stock</h3>
      ${outOfStock.length > 0 ? `
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
        <p style="margin: 0 0 4px; font-size: 12px; color: #dc2626; font-weight: 600;">Sin stock (${outOfStock.length})</p>
        ${outOfStock.map(p => `<p style="margin: 2px 0; font-size: 13px; color: #7f1d1d;">${p.name} (${p.sku})</p>`).join('')}
      </div>` : ''}
      ${lowStock.length > 0 ? `
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px;">
        <p style="margin: 0 0 4px; font-size: 12px; color: #d97706; font-weight: 600;">Stock bajo (${lowStock.length})</p>
        ${lowStock.map(p => `<p style="margin: 2px 0; font-size: 13px; color: #92400e;">${p.name} (${p.sku}) - ${p.stock} uds</p>`).join('')}
      </div>` : ''}
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">Reporte generado automáticamente - La Aldea</p>
    </div>
  </div>
</body>
</html>`;

    // Send email
    if (BREVO_API_KEY) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: FROM_NAME, email: FROM_EMAIL },
          to: [{ email: ADMIN_EMAIL, name: 'Admin' }],
          subject: `Reporte Semanal - ${fmt(totalRevenue)} (${dateRange})`,
          htmlContent,
        }),
      });
    }

    // Send Telegram summary
    const telegramMsg =
      `<b>Reporte Semanal La Aldea</b>\n` +
      `${dateRange}\n\n` +
      `<b>Ingresos:</b> ${fmt(totalRevenue)} (${revenueChange >= 0 ? '+' : ''}${revenueChange}%)\n` +
      `<b>Pedidos pagados:</b> ${paidOrders.length}\n` +
      `<b>Ticket promedio:</b> ${fmt(avgOrderValue)}\n` +
      `<b>Online:</b> ${fmt(onlineRevenue)} | <b>Mostrador:</b> ${fmt(mostradorRevenue)}\n\n` +
      (topProducts.length > 0
        ? `<b>Top productos:</b>\n${topProducts.map(([name, data]) => `  ${name}: ${data.sold} uds (${fmt(data.revenue)})`).join('\n')}\n\n`
        : '') +
      (lowStock.length > 0
        ? `<b>Stock bajo:</b> ${lowStock.map(p => `${p.name} (${p.stock})`).join(', ')}\n`
        : '') +
      (outOfStock.length > 0
        ? `<b>Sin stock:</b> ${outOfStock.map(p => p.name).join(', ')}`
        : '');

    await sendTelegramAlert(telegramMsg);

    return NextResponse.json({
      success: true,
      summary: {
        revenue: totalRevenue,
        prevRevenue,
        revenueChange,
        paidOrders: paidOrders.length,
        totalOrders: orders.length,
        avgOrderValue,
        topProducts: topProducts.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
      },
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    return NextResponse.json({ error: 'Failed to generate weekly report' }, { status: 500 });
  }
}
