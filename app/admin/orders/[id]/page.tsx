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
  User,
  FileText,
  Clock,
  AlertTriangle,
  ExternalLink,
  Activity,
  MessageCircle,
  CheckCircle2,
  XCircle,
  CircleDot,
  Circle,
  RotateCcw,
  PackageOpen,
} from 'lucide-react';
import OrderStatusForm from './OrderStatusForm';
import InvoiceForm from './InvoiceForm';
import RefundButton from './RefundButton';
import DownloadButton from './DownloadButton';
import type { Order, OrderItem } from '@/types/database';

// ── Status Stepper Config ────────────────────────────────────────────────

const STEPPER_STEPS = [
  { key: 'pending', label: 'Pendiente' },
  { key: 'paid', label: 'Pagado' },
  { key: 'invoiced', label: 'Facturado' },
  { key: 'processing', label: 'Preparación' },
  { key: 'shipped', label: 'Enviado' },
  { key: 'delivered', label: 'Entregado' },
] as const;

// Map every status to its position in the stepper (0-based), or -1 for problem statuses
const STATUS_STEP_INDEX: Record<string, number> = {
  pending: 0,
  paid: 1,
  paid_pending_verification: 1,
  ready_to_invoice: 1,
  invoiced: 2,
  awaiting_stock: 1,
  processing: 3,
  shipped: 4,
  delivered: 5,
  // problem statuses get -1 (no stepper)
  cancelled: -1,
  refunded: -1,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  paid_pending_verification: 'Por verificar',
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  ready_to_invoice: 'Por facturar',
  invoiced: 'Facturado',
  awaiting_stock: 'Sin stock',
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  paid_pending_verification: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  awaiting_stock: 'bg-orange-100 text-orange-800 border-orange-200',
  ready_to_invoice: 'bg-blue-100 text-blue-800 border-blue-200',
  invoiced: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  processing: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-slate-100 text-slate-800 border-slate-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-rose-100 text-rose-800 border-rose-200',
};

// ── Main Page ────────────────────────────────────────────────────────────

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
    .single() as { data: any; error: any };

  if (error || !data) {
    notFound();
  }

  const order = data as Order;

  // Fetch order items
  const { data: itemsData } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', id) as { data: any[] | null };

  const orderItems = (itemsData || []) as OrderItem[];

  // Fetch order activity logs
  const { data: logsData } = await supabaseAdmin
    .from('order_logs')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: false })
    .limit(10) as { data: Array<{ id: string; order_id: string; action: string; old_status: string | null; new_status: string | null; details: Record<string, unknown> | null; created_by: string | null; created_at: string }> | null };

  const orderLogs = logsData || [];

  const currency = (order as any).currency || 'UYU';

  const formatCurrency = (value: number, cur: string = currency) => {
    if (cur === 'USD') {
      return `US$ ${value.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  };

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

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin}m`;
    if (diffHr < 24) return `hace ${diffHr}h`;
    if (diffDays === 1) return 'hace 1 día';
    if (diffDays < 30) return `hace ${diffDays} días`;
    return '';
  };

  const shippingLabels: Record<string, string> = {
    pickup: 'Retiro en local',
    standard: 'Envío estándar',
    express: 'Envío express',
  };

  const paymentLabels: Record<string, string> = {
    mercadopago: 'MercadoPago',
    transfer: 'Transferencia bancaria',
    efectivo: 'Efectivo',
    credito: 'Crédito',
    pos_debito: 'POS Débito',
    pos_credito: 'POS Crédito',
  };

  const ACTION_LABELS: Record<string, string> = {
    order_created: 'Pedido creado',
    status_updated: 'Estado actualizado',
    order_status_updated: 'Estado actualizado',
    invoice_added: 'Factura registrada',
    invoice_updated: 'Factura actualizada',
    refund_processed: 'Reembolso procesado',
    note_added: 'Nota agregada',
    payment_confirmed: 'Pago confirmado',
    stock_reserved: 'Stock reservado',
    stock_released: 'Stock liberado',
  };

  const LOG_STATUS_LABELS: Record<string, string> = STATUS_LABELS;

  // Stepper logic
  const currentStepIndex = STATUS_STEP_INDEX[order.status] ?? -1;
  const isProblemStatus = currentStepIndex === -1;

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                #{order.order_number}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE_STYLES[order.status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
              {(order as any).order_source === 'mostrador' && (
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Mostrador
                </span>
              )}
              {currency === 'USD' && (
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  USD
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {formatDate(order.created_at)}
              {getRelativeTime(order.created_at) && (
                <span className="text-slate-400"> · {getRelativeTime(order.created_at)}</span>
              )}
            </p>
          </div>
        </div>
        <DownloadButton order={order} items={orderItems || []} />
      </div>

      {/* ── Contact Action Bar ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {order.customer_phone && (
            <a
              href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${order.customer_name}! Te contactamos por tu pedido #${order.order_number}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {order.customer_email && (
            <a
              href={`mailto:${order.customer_email}?subject=Pedido ${order.order_number} - La Aldea`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
          {order.customer_phone && (
            <a
              href={`tel:${order.customer_phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Llamar
            </a>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(order.total)}</p>
        </div>
      </div>

      {/* ── Status Stepper / Problem Badge ──────────────────────────── */}
      {isProblemStatus ? (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          order.status === 'cancelled'
            ? 'bg-red-50 border border-red-200'
            : order.status === 'refunded'
              ? 'bg-rose-50 border border-rose-200'
              : 'bg-orange-50 border border-orange-200'
        }`}>
          {order.status === 'cancelled' ? (
            <XCircle className="h-5 w-5 text-red-600 shrink-0" />
          ) : order.status === 'refunded' ? (
            <RotateCcw className="h-5 w-5 text-rose-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
          )}
          <div>
            <p className={`font-semibold text-sm ${
              order.status === 'cancelled' ? 'text-red-800' :
              order.status === 'refunded' ? 'text-rose-800' : 'text-orange-800'
            }`}>
              {STATUS_LABELS[order.status] || order.status}
            </p>
            {order.status === 'cancelled' && (
              <p className="text-xs text-red-600">Este pedido fue cancelado</p>
            )}
            {order.status === 'refunded' && order.refund_amount && (
              <p className="text-xs text-rose-600">Reembolso: {formatCurrency(order.refund_amount)}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPPER_STEPS.map((step, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isFuture = i > currentStepIndex;

              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isCurrent ? (
                        <CircleDot className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-medium text-center whitespace-nowrap ${
                      isCompleted ? 'text-green-700' :
                      isCurrent ? 'text-blue-700' :
                      'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPPER_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-[-14px] ${
                      isCompleted ? 'bg-green-400' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Alerts ──────────────────────────────────────────────────── */}
      {order.stock_reserved && order.reserved_until && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Stock Reservado</p>
              <p className="text-sm text-amber-600">
                Hasta: {new Date(order.reserved_until).toLocaleDateString('es-UY', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {order.status === 'awaiting_stock' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <PackageOpen className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">Sin Stock</p>
              <p className="text-sm text-orange-600">
                Contactar al cliente para ofrecer reembolso o espera
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 1: Products + Status ─────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Products */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Productos ({orderItems?.length || 0})
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {(orderItems || []).map((item: any) => (
              <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  {item.product_id ? (
                    <Link
                      href={`/admin/products/${item.product_id}`}
                      className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {item.product_name}
                    </Link>
                  ) : (
                    <p className="font-medium text-slate-900">{item.product_name}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                    {formatCurrency(item.unit_price)} × {item.quantity}
                    {!item.product_id && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        mostrador
                      </span>
                    )}
                  </p>
                </div>
                <p className="font-semibold text-slate-900 shrink-0">
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

        {/* Status Update */}
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      {/* ── Row 2: Customer + Payment/Shipping ────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Cliente
          </h2>

          <div className="space-y-4">
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

            {order.notes && (
              <div className="pt-4 border-t border-slate-200 flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Notas del cliente</p>
                  <p className="text-slate-900">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Shipping Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Pago & Envío
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Método de pago</p>
                <p className="font-medium text-slate-900">
                  {order.payment_method ? (paymentLabels[order.payment_method] || order.payment_method) : 'No especificado'}
                </p>
              </div>
            </div>

            {order.paid_at && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Fecha de pago</p>
                  <p className="font-medium text-slate-900">
                    {new Date(order.paid_at).toLocaleDateString('es-UY', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}

            {order.mp_payment_id && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">ID de Pago MP</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-slate-700">{order.mp_payment_id}</p>
                    <a
                      href={`https://www.mercadopago.com.uy/activities/${order.mp_payment_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      title="Ver en MercadoPago"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {order.mp_preference_id && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">ID Preferencia MP</p>
                  <p className="font-mono text-xs text-slate-600 break-all">{order.mp_preference_id}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
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
                <div className="flex items-start gap-3 mt-4">
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
          </div>
        </div>
      </div>

      {/* ── Row 3: Billing + InvoiceForm ──────────────────────────── */}
      {(order.invoice_type || (order as any).order_source !== 'mostrador') ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Billing Info (from checkout) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Datos de Facturación
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Tipo solicitado por cliente</p>
                  <p className="font-medium text-slate-900">
                    {order.invoice_type === 'invoice_rut'
                      ? 'Factura con RUT (crédito fiscal)'
                      : 'Consumidor Final (boleta/ticket)'}
                  </p>
                </div>
              </div>

              {order.invoice_type === 'invoice_rut' && (
                <>
                  {order.invoice_tax_id && (
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">RUT</p>
                        <p className="font-medium font-mono text-slate-900">
                          {order.invoice_tax_id.replace(/(\d{2})(\d{6})(\d{4})(\d{2})/, '$1 $2 $3 $4') || order.invoice_tax_id}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.invoice_business_name && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Razón Social</p>
                        <p className="font-medium text-slate-900">{order.invoice_business_name}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Invoice Form */}
          <InvoiceForm order={order} />
        </div>
      ) : (
        /* Mostrador orders without billing data — just show InvoiceForm full-width */
        <InvoiceForm order={order} />
      )}

      {/* ── RefundButton (full-width) ─────────────────────────────── */}
      <RefundButton order={order} currency={currency} />

      {/* ── Activity Log (full-width bottom) ───────────────────────── */}
      {orderLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Actividad
          </h2>

          <div className="grid gap-0">
            {orderLogs.map((log: any, index: number) => (
              <div key={log.id} className="flex items-start gap-4 relative">
                {/* Timeline line */}
                {index < orderLogs.length - 1 && (
                  <div className="absolute left-[11px] top-7 w-0.5 h-full bg-slate-200" />
                )}
                {/* Dot */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 z-10 ${
                  index === 0 ? 'bg-blue-600' : 'bg-slate-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-white' : 'bg-slate-400'
                  }`} />
                </div>
                {/* Content */}
                <div className="flex-1 pb-6 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-medium text-sm text-slate-800">
                      {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
                    </p>
                    <span className="text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleDateString('es-UY', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {' · '}{log.created_by || 'Sistema'}
                    </span>
                  </div>
                  {log.old_status && log.new_status && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="text-slate-400">{LOG_STATUS_LABELS[log.old_status] || log.old_status}</span>
                      <span className="text-slate-300">→</span>
                      <span className="font-medium text-slate-700">{LOG_STATUS_LABELS[log.new_status] || log.new_status}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
