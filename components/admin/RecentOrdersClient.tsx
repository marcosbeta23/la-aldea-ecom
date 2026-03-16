'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { STATUS_CONFIG, formatUYU, formatUSD, formatDate } from '@/lib/admin-utils';

const RECENT_ORDERS_INITIAL = 5;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, classes: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

export default function RecentOrdersClient({ orders }: { orders: any[] }) {
  const [ordersVisible, setOrdersVisible] = useState(RECENT_ORDERS_INITIAL);

  const visibleOrders = orders.slice(0, ordersVisible);
  const hasMoreOrders = ordersVisible < orders.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">Pedidos Recientes</h2>
          {orders.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              {Math.min(ordersVisible, orders.length)} de {orders.length}
            </span>
          )}
        </div>
        <Link
          href="/admin/orders"
          className="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {orders.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-slate-400 text-sm font-medium">Sin pedidos en los últimos 30 días</p>
          </div>
        ) : (
          <>
            {visibleOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-600 group-hover:underline">#{order.order_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-slate-700 truncate font-medium">{order.customer_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                    {order.currency === 'USD' ? formatUSD(order.total) : formatUYU(order.total)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{formatDate(order.created_at)}</p>
                </div>
              </Link>
            ))}

            {/* Pagination controls */}
            {orders.length > RECENT_ORDERS_INITIAL && (
              <div className="px-5 py-3 flex items-center justify-center bg-slate-50/50 border-t border-slate-100">
                {hasMoreOrders ? (
                  <button
                    onClick={() => setOrdersVisible(v => Math.min(v + 5, orders.length))}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider py-2 px-4 rounded-lg hover:bg-blue-100/50 transition-all"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Mostrar más ({orders.length - ordersVisible})
                  </button>
                ) : (
                  <button
                    onClick={() => setOrdersVisible(RECENT_ORDERS_INITIAL)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-bold uppercase tracking-wider py-2 px-4 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    Mostrar menos
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
