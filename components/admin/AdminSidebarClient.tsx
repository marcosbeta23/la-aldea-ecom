'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  X, Menu, ChevronRight,
  LayoutDashboard, Package, ShoppingCart, Tag, Star,
  TrendingUp, FileText, Search, Boxes, Users, Building2, BookOpen,
} from 'lucide-react';
import { AssistantChat } from '@/components/admin/AssistantChat';

// Nav items live here (client component) — icons are forwardRef components
// and cannot be passed as props from a Server Component.
const ALL_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'staff'] },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp, roles: ['owner'] },
  { href: '/admin/search-analytics', label: 'Búsquedas', icon: Search, roles: ['owner'] },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart, roles: ['owner', 'staff'] },
  { href: '/admin/customers', label: 'Clientes', icon: Users, roles: ['owner', 'staff'] },
  { href: '/admin/products', label: 'Productos', icon: Package, roles: ['owner', 'staff'] },
  { href: '/admin/inventory', label: 'Inventario', icon: Boxes, roles: ['owner', 'staff'] },
  { href: '/admin/coupons', label: 'Cupones', icon: Tag, roles: ['owner', 'staff'] },
  { href: '/admin/reviews', label: 'Reseñas', icon: Star, roles: ['owner'] },
  { href: '/admin/partners', label: 'Marcas', icon: Building2, roles: ['owner'] },
  { href: '/admin/guides', label: 'Guias', icon: BookOpen, roles: ['owner'] },
  { href: '/admin/reports', label: 'Reportes', icon: FileText, roles: ['owner', 'staff'] },
];

export default function AdminSidebarClient({
  role,
  userButton,
  userEmail,
  children,
}: {
  role: string;
  userButton: React.ReactNode;
  userEmail: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(role));

  const roleBadge = (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${role === 'owner' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-600 text-slate-300'
      }`}>
      {role === 'owner' ? '👑 Admin' : '👤 Staff'}
    </span>
  );

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
        <div className="shrink-0 flex items-center justify-between h-20 px-6 border-b border-slate-700">
          <Link href="/admin" className="transition-opacity hover:opacity-80">
            <Image
              src="/logo.svg"
              alt="La Aldea Admin"
              width={200}
              height={65}
              className="object-contain h-[45px] w-auto brightness-0 invert"
              priority
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-2 border-b border-slate-700/50">
          {roleBadge}
        </div>

        <nav className="flex-1 overflow-y-auto min-h-0 p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant — owner only */}
        {role === 'owner' && (
          <div className="border-t border-slate-700 mt-auto p-3 shrink-0">
            <AssistantChat />
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg mr-4"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6 text-slate-600" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline font-medium">
              {userEmail}
            </span>
            {userButton}
          </div>
        </header>

        <main className="p-4 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}