'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Download, CheckCircle, Package, Mail, Home, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export const metadata = {
  robots: { index: false, follow: false },
};

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  created_at: string;
  order_items: OrderItem[];
}

function GraciasContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders?order_id=${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Error al cargar pedido');
        }

        setOrder(data.order);
        // Clear cart after confirmed payment
        clearCart();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownloadReceipt = () => {
    if (!order) return;

    const cur = order.currency || 'UYU';
    const prefix = cur === 'USD' ? 'US$' : '$';

    // Create printable receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Comprobante - ${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .order-number { font-size: 14px; color: #666; margin-top: 10px; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
          .items-table th { background: #f5f5f5; }
          .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">La Aldea</div>
          <div style="color: #666; margin-top: 5px;">Comprobante de Compra</div>
          <div class="order-number">Pedido #${order.order_number}</div>
          <div style="color: #666; font-size: 12px;">${new Date(order.created_at).toLocaleDateString('es-UY', {
      dateStyle: 'long',
      timeZone: 'America/Montevideo'
    })}</div>
        </div>

        <div class="section">
          <div class="section-title">Datos del Cliente</div>
          <div class="row"><span>Nombre:</span><span>${order.customer_name}</span></div>
          <div class="row"><span>Email:</span><span>${order.customer_email}</span></div>
          <div class="row"><span>Teléfono:</span><span>${order.customer_phone || '-'}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Dirección de Envío</div>
          <div>${order.shipping_address}</div>
          <div>${order.shipping_city}, ${order.shipping_state}</div>
        </div>

        <div class="section">
          <div class="section-title">Productos</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>${prefix}${item.unit_price.toLocaleString('es-UY')}</td>
                  <td>${prefix}${item.subtotal.toLocaleString('es-UY')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="row"><span>Subtotal:</span><span>${prefix}${order.subtotal.toLocaleString('es-UY')}</span></div>
          ${order.discount_amount > 0 ? `<div class="row" style="color: #16a34a;"><span>Descuento:</span><span>-${prefix}${order.discount_amount.toLocaleString('es-UY')}</span></div>` : ''}
          <div class="row"><span>Envío:</span><span>${order.shipping_cost > 0 ? `${prefix}${order.shipping_cost.toLocaleString('es-UY')}` : 'Gratis'}</span></div>
          <div class="row total-row"><span>TOTAL:</span><span>${prefix}${order.total.toLocaleString('es-UY')}</span></div>
        </div>

        <div class="footer">
          <p>Gracias por tu compra en La Aldea</p>
          <p>Este comprobante no es válido como factura fiscal</p>
          <p>laaldeatala.com.uy</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error al cargar pedido</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Gracias por tu compra!
          </h1>

          <p className="text-gray-600 mb-4">
            Tu pago fue procesado exitosamente
          </p>

          {order && (
            <div className="inline-block bg-gray-100 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-500">Pedido </span>
              <span className="font-mono font-bold text-gray-900">#{order.order_number}</span>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6" ref={receiptRef}>
            {/* Products */}
            <div className="p-6 border-b">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Resumen del Pedido
              </h2>

              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {(order.currency === 'USD' ? 'US$' : '$')}{item.subtotal.toLocaleString('es-UY')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{(order.currency === 'USD' ? 'US$' : '$')}{order.subtotal.toLocaleString('es-UY')}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento</span>
                    <span>-{(order.currency === 'USD' ? 'US$' : '$')}{order.discount_amount.toLocaleString('es-UY')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span>{order.shipping_cost > 0 ? `${order.currency === 'USD' ? 'US$' : '$'}${order.shipping_cost.toLocaleString('es-UY')}` : 'Gratis'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">{(order.currency === 'USD' ? 'US$' : '$')}{order.total.toLocaleString('es-UY')}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">Dirección de Envío</h3>
              <p className="text-gray-600">{order.shipping_address}</p>
              <p className="text-gray-600">{order.shipping_city}, {order.shipping_state}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Te enviamos un email de confirmación a <strong>{order?.customer_email}</strong> con todos los detalles de tu pedido.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Descargar Comprobante
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <GraciasContent />
    </Suspense>
  );
}
