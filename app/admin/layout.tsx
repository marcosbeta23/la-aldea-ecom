'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Tag,
  Star,
  Menu,
  X,
  ChevronRight,
  Home,
  TrendingUp,
  FileText,
  Search,
  Boxes,
  Users,
  Building2,
  BookOpen,
} from 'lucide-react';
import { useState } from 'react';

type AdminRole = 'owner' | 'staff';

const ALL_NAV_ITEMS = [
  { href: '/admin',                  label: 'Dashboard',        icon: LayoutDashboard, roles: ['owner', 'staff'] },
  { href: '/admin/analytics',        label: 'Analytics',        icon: TrendingUp,      roles: ['owner'] },
  { href: '/admin/search-analytics', label: 'Búsquedas',        icon: Search,          roles: ['owner'] },
  { href: '/admin/orders',           label: 'Pedidos',          icon: ShoppingCart,    roles: ['owner', 'staff'] },
  { href: '/admin/customers',        label: 'Clientes',         icon: Users,           roles: ['owner', 'staff'] },
  { href: '/admin/ventas-mostrador', label: 'Ventas Mostrador', icon: Store,           roles: ['owner', 'staff'] },
  { href: '/admin/products',         label: 'Productos',        icon: Package,         roles: ['owner', 'staff'] },
  { href: '/admin/inventory',        label: 'Inventario',       icon: Boxes,           roles: ['owner', 'staff'] },
  { href: '/admin/coupons',          label: 'Cupones',          icon: Tag,             roles: ['owner', 'staff'] },
  { href: '/admin/reviews',          label: 'Reseñas',          icon: Star,            roles: ['owner'] },
  { href: '/admin/partners',         label: 'Marcas',           icon: Building2,       roles: ['owner'] },
  { href: '/admin/guides',           label: 'Guias',            icon: BookOpen,        roles: ['owner'] },
  { href: '/admin/reports',          label: 'Reportes',         icon: FileText,        roles: ['owner', 'staff'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoaded } = useUser();

  // Don't show layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Get role from Clerk publicMetadata
  const role = (user?.publicMetadata?.role as AdminRole) ?? 'staff';

  // Filter nav to only what this role can see
  const navItems = isLoaded
    ? ALL_NAV_ITEMS.filter(item => item.roles.includes(role))
    : ALL_NAV_ITEMS.filter(item => item.roles.includes('staff')); // safe fallback while loading

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="shrink-0 flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <Link href="/admin" className="text-xl font-bold text-white">
            La Aldea
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role badge */}
        {isLoaded && (
          <div className="px-6 py-2 border-b border-slate-700/50">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              role === 'owner'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-600 text-slate-300'
            }`}>
              {role === 'owner' ? '👑 Propietario' : '👤 Empleado'}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto min-h-0 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="shrink-0 p-4 border-t border-slate-700 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Ver tienda</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
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
            <span className="text-sm text-slate-500 hidden sm:inline">
              {isLoaded ? user?.primaryEmailAddress?.emailAddress ?? 'Admin' : 'Admin'}
            </span>
            <UserButton
              afterSignOutUrl="/admin/login"
              appearance={{
                elements: { avatarBox: 'w-9 h-9', userButtonPopoverCard: 'shadow-xl' }
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
