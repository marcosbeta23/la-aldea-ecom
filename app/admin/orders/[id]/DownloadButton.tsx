'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { Order, OrderItem } from '@/types/database';

interface DownloadButtonProps {
  order: Order;
  items: OrderItem[];
}

export default function DownloadButton({ order, items }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const formatPrice = (value: number) =>
    `UYU ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'paid': 'Pagado',
      'paid_pending_verification': 'Verificando',
      'awaiting_stock': 'Sin Stock',
      'ready_to_invoice': 'Por Facturar',
      'invoiced': 'Facturado',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado',
    };
    return labels[status] || status;
  };

  const generatePDF = async () => {
    setDownloading(true);
    
    try {
      // Generate HTML content for the invoice
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Comprobante - ${order.order_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { 
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }
    .logo h1 { 
      font-size: 28px;
      color: #1e40af;
      font-weight: 700;
    }
    .logo p {
      color: #64748b;
      font-size: 12px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      font-size: 24px;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .invoice-info p {
      color: #64748b;
      font-size: 14px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    
    .section {
      margin-bottom: 32px;
    }
    .section h3 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 12px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .info-box {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
    }
    .info-box p {
      margin-bottom: 4px;
      font-size: 14px;
    }
    .info-box strong {
      color: #0f172a;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      text-align: left;
      padding: 12px;
      background: #f1f5f9;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
    }
    th:last-child, td:last-child { text-align: right; }
    th:nth-child(2), td:nth-child(2) { text-align: center; }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    
    .totals {
      background: #0f172a;
      color: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-top: 24px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    .totals-row.discount { color: #4ade80; }
    .totals-row.total {
      font-size: 20px;
      font-weight: 700;
      padding-top: 12px;
      margin-top: 8px;
      border-top: 1px solid #334155;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <h1>La Aldea</h1>
      <p>Agroinsumos y Riego</p>
      <p>Tala, Canelones, Uruguay</p>
    </div>
    <div class="invoice-info">
      <h2>Comprobante</h2>
      <p><strong>${order.order_number}</strong></p>
      <p>${formatDate(order.created_at)}</p>
      <span class="status-badge ${
        ['paid', 'paid_pending_verification', 'invoiced', 'delivered'].includes(order.status)
          ? 'status-paid'
          : order.status === 'cancelled' || order.status === 'refunded'
          ? 'status-cancelled'
          : 'status-pending'
      }">
        ${getStatusLabel(order.status)}
      </span>
    </div>
  </div>
  
  <div class="section">
    <div class="info-grid">
      <div class="info-box">
        <h3>Cliente</h3>
        <p><strong>${order.customer_name || 'No especificado'}</strong></p>
        <p>${order.customer_email || ''}</p>
        <p>${order.customer_phone || ''}</p>
      </div>
      <div class="info-box">
        <h3>Dirección de entrega</h3>
        <p>${order.shipping_address || 'No especificada'}</p>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h3>Productos</h3>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio Unit.</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(item.unit_price)}</td>
            <td>${formatPrice(item.subtotal)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>${formatPrice(order.subtotal)}</span>
      </div>
      ${order.discount_amount > 0 ? `
        <div class="totals-row discount">
          <span>Descuento${order.coupon_code ? ` (${order.coupon_code})` : ''}:</span>
          <span>-${formatPrice(order.discount_amount)}</span>
        </div>
      ` : ''}
      <div class="totals-row total">
        <span>Total:</span>
        <span>${formatPrice(order.total)}</span>
      </div>
    </div>
  </div>
  
  ${order.notes ? `
    <div class="section">
      <h3>Notas</h3>
      <div class="info-box">
        <p>${order.notes}</p>
      </div>
    </div>
  ` : ''}
  
  <div class="footer">
    <p>La Aldea - Agroinsumos y Riego | Tala, Canelones, Uruguay</p>
    <p>Tel: 099 123 456 | laaldeatala.com.uy</p>
    <p style="margin-top: 8px;">Documento generado el ${new Date().toLocaleDateString('es-UY')}</p>
  </div>
</body>
</html>
      `;

      // Create a blob and trigger download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Comprobante-${order.order_number}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error al generar el comprobante');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
    >
      {downloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Descargar Comprobante
        </>
      )}
    </button>
  );
}
