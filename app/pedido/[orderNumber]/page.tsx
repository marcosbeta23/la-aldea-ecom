import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Mail, ArrowRight, Home, Clock, MapPin } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { Order, OrderItem } from '@/types/database';
import Header from '@/components/Header';

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ success?: string }>;
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Pedido ${resolvedParams.orderNumber} - La Aldea`,
    robots: { index: false, follow: false },
  };
}

// Format price
function formatPrice(price: number) {
  return price.toLocaleString('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

async function getOrder(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('order_number', orderNumber)
    .single();

  if (error || !data) return null;
  return data as Order;
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const order = await getOrder(resolvedParams.orderNumber);

  if (!order) {
    notFound();
  }

  const isSuccess = resolvedSearchParams.success === 'true';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Success Banner */}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-800 mb-2">
                  ¡Pedido recibido!
                </h1>
                <p className="text-green-600">
                  Tu pedido ha sido registrado exitosamente.
                </p>
              </div>
            )}

            {/* Order Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Número de pedido</p>
                    <p className="text-2xl font-bold">{order.order_number}</p>
                  </div>
                  <Package className="h-12 w-12 text-blue-200" />
                </div>
              </div>

              {/* Status */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-500' :
                    order.status === 'processing' ? 'bg-blue-500' :
                    order.status === 'shipped' ? 'bg-purple-500' :
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium text-slate-900">
                      Estado: {
                        order.status === 'delivered' ? 'Entregado' :
                        order.status === 'processing' ? 'En proceso' :
                        order.status === 'shipped' ? 'Enviado' :
                        order.status === 'cancelled' ? 'Cancelado' :
                        'Pendiente de pago'
                      }
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('es-UY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-6 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900 mb-4">Datos del cliente</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Nombre</p>
                    <p className="font-medium text-slate-900">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{order.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Teléfono</p>
                    <p className="font-medium text-slate-900">{order.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Método de entrega</p>
                    <p className="font-medium text-slate-900">
                      {order.shipping_type === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}
                    </p>
                  </div>
                </div>

                {order.shipping_address && (
                  <div className="mt-4 flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <p className="text-slate-600">
                      {order.shipping_address}, {order.shipping_city}, {order.shipping_department}
                    </p>
                  </div>
                )}

                {order.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                    <strong>Notas:</strong> {order.notes}
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="p-6 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900 mb-4">Productos</h2>
                <div className="space-y-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{item.product_name}</p>
                        <p className="text-slate-500">
                          {formatPrice(item.unit_price)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-slate-900">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-6 bg-slate-50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900">{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento {order.coupon_code && `(${order.coupon_code})`}</span>
                      <span>-{formatPrice(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Envío</span>
                    <span className="text-slate-900">
                      {order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Gratis'}
                    </span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            {isSuccess && (
              <div className="mt-8 bg-blue-50 rounded-2xl p-6">
                <h2 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Próximos pasos
                </h2>
                <ol className="space-y-3 text-sm text-blue-800">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                      1
                    </span>
                    <span>
                      Recibirás un email en <strong>{order.customer_email}</strong> con la confirmación del pedido.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                      2
                    </span>
                    <span>
                      Procesaremos tu pedido y te notificaremos cuando esté listo
                      {order.shipping_type === 'pickup' ? ' para retirar.' : ' para enviar.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                      3
                    </span>
                    <span>
                      Si tenés alguna consulta, contactanos por WhatsApp o email.
                    </span>
                  </li>
                </ol>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                <Home className="h-5 w-5" />
                Volver al inicio
              </Link>
              <Link
                href="/productos"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                Seguir comprando
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Email Note */}
            <div className="mt-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Guardá este número de pedido para futuras consultas
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
