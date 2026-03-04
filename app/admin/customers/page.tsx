'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  Phone,
  ShoppingCart,
  DollarSign,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

interface Customer {
  identifier: string;
  name: string;
  email: string | null;
  phone: string | null;
  orderCount: number;
  totalSpentUYU: number;
  totalSpentUSD: number;
  totalSpent: number;
  firstOrder: string;
  lastOrder: string;
  preferredPayment: string;
  avgOrderValue: number;
}

interface Pagination {
  page: number;
  totalPages: number;
  totalCustomers: number;
}

const PAYMENT_LABELS: Record<string, string> = {
  mercadopago: 'MercadoPago',
  transfer: 'Transferencia',
  efectivo: 'Efectivo',
  credito: 'Crédito',
  pos_debito: 'POS Débito',
  pos_credito: 'POS Crédito',
  unknown: 'Sin datos',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 0, totalCustomers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('totalSpent');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        search: debouncedSearch,
        sort,
        dir,
      });
      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, sort, dir]);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  const handleSort = (field: string) => {
    if (sort === field) {
      setDir(dir === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort !== field) return null;
    return dir === 'asc'
      ? <ChevronUp className="h-3 w-3 inline ml-1" />
      : <ChevronDown className="h-3 w-3 inline ml-1" />;
  };

  const formatCurrency = (value: number) =>
    `$ ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm">
            {pagination.totalCustomers} cliente{pagination.totalCustomers !== 1 ? 's' : ''} registrado{pagination.totalCustomers !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => fetchCustomers(pagination.page)}
          disabled={isLoading}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading && customers.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No se encontraron clientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    <button onClick={() => handleSort('name')} className="hover:text-slate-900">
                      Cliente <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Contacto</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">
                    <button onClick={() => handleSort('orderCount')} className="hover:text-slate-900">
                      Pedidos <SortIcon field="orderCount" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">
                    <button onClick={() => handleSort('totalSpent')} className="hover:text-slate-900">
                      Total <SortIcon field="totalSpent" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Ticket Prom.</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Pago Pref.</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">
                    <button onClick={() => handleSort('lastOrder')} className="hover:text-slate-900">
                      Último Pedido <SortIcon field="lastOrder" />
                    </button>
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.identifier} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{customer.name || 'Sin nombre'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-0.5">
                        {customer.email && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </p>
                        )}
                        {customer.phone && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        <ShoppingCart className="h-3 w-3" />
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(customer.totalSpentUYU)}</p>
                      {customer.totalSpentUSD > 0 && (
                        <p className="text-xs text-slate-400">US$ {customer.totalSpentUSD.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className="text-slate-600">{formatCurrency(customer.avgOrderValue)}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                        <CreditCard className="h-3 w-3" />
                        {PAYMENT_LABELS[customer.preferredPayment] || customer.preferredPayment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-xs text-slate-500">{formatDate(customer.lastOrder)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${encodeURIComponent(customer.identifier)}`}
                        className="p-1.5 hover:bg-slate-100 rounded-lg inline-flex"
                        title="Ver detalle"
                      >
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchCustomers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => fetchCustomers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
