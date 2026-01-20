import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Package,
  Truck,
  CreditCard,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import OrderStatusForm from './OrderStatusForm';
import type { Order, OrderItem } from '@/types/database';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch order with items
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) {
    notFound();
  }
  
  const order = data as Order;
  
  // Fetch order items
  const { data: itemsData } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', id);
  
  const orderItems = (itemsData || []) as OrderItem[];
  
  const formatCurrency = (value: number) => 
    `UYU ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-UY', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const shippingLabels: Record<string, string> = {
    pickup: 'Retiro en local',
    standard: 'Envío estándar',
    express: 'Envío express',
  };
  
  const paymentLabels: Record<string, string> = {
    mercadopago: 'MercadoPago',
    transfer: 'Transferencia bancaria',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/orders"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Pedido #{order.order_number}
          </h1>
          <p className="text-slate-500">{formatDate(order.created_at)}</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Productos ({orderItems?.length || 0})
              </h2>
            </div>
            
            <div className="divide-y divide-slate-200">
              {(orderItems || []).map((item: any) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{item.product_name}</p>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="px-6 py-4 bg-slate-50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Descuento {order.coupon_code && `(${order.coupon_code})`}
                  </span>
                  <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              {order.shipping_cost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Envío</span>
                  <span className="text-slate-900">{formatCurrency(order.shipping_cost)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900">Total</span>
                <span className="text-slate-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Cliente
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Nombre</p>
                  <p className="font-medium text-slate-900">{order.customer_name}</p>
                </div>
              </div>
              
              {order.customer_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Teléfono</p>
                    <a 
                      href={`tel:${order.customer_phone}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {order.customer_phone}
                    </a>
                  </div>
                </div>
              )}
              
              {order.customer_email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <a 
                      href={`mailto:${order.customer_email}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {order.customer_email}
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Entrega</p>
                  <p className="font-medium text-slate-900">
                    {shippingLabels[order.shipping_type] || order.shipping_type}
                  </p>
                </div>
              </div>
              
              {order.shipping_address && (
                <div className="sm:col-span-2 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Dirección de envío</p>
                    <p className="font-medium text-slate-900">
                      {order.shipping_address}
                      {order.shipping_city && `, ${order.shipping_city}`}
                      {order.shipping_department && `, ${order.shipping_department}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Notas del cliente</p>
                    <p className="text-slate-900">{order.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          
          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Pago
            </h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Método</p>
                <p className="font-medium text-slate-900">
                  {order.payment_method ? (paymentLabels[order.payment_method] || order.payment_method) : 'No especificado'}
                </p>
              </div>
              
              {order.mp_preference_id && (
                <div>
                  <p className="text-sm text-slate-500">ID MercadoPago</p>
                  <p className="font-mono text-sm text-slate-700">{order.mp_preference_id}</p>
                </div>
              )}
              
              {order.mp_payment_id && (
                <div>
                  <p className="text-sm text-slate-500">ID de Pago</p>
                  <p className="font-mono text-sm text-slate-700">{order.mp_payment_id}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Acciones rápidas</h2>
            
            <div className="space-y-2">
              {order.customer_phone && (
                <a
                  href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=Hola ${order.customer_name}! Te contactamos por tu pedido ${order.order_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              
              {order.customer_email && (
                <a
                  href={`mailto:${order.customer_email}?subject=Pedido ${order.order_number} - La Aldea`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Enviar email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
