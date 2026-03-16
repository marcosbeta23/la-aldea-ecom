import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { esES } from "@clerk/localizations";
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Star,
  TrendingUp, FileText, Search,
  Boxes, Users, Building2, BookOpen,
} from 'lucide-react';
import AdminSidebarClient from "@/components/admin/AdminSidebarClient";

const ALL_NAV_ITEMS = [
  { href: '/admin',                  label: 'Dashboard',        icon: LayoutDashboard, roles: ['owner', 'staff'] },
  { href: '/admin/analytics',        label: 'Analytics',        icon: TrendingUp,      roles: ['owner'] },
  { href: '/admin/search-analytics', label: 'Búsquedas',        icon: Search,          roles: ['owner'] },
  { href: '/admin/orders',           label: 'Pedidos',          icon: ShoppingCart,    roles: ['owner', 'staff'] },
  { href: '/admin/customers',        label: 'Clientes',         icon: Users,           roles: ['owner', 'staff'] },
  { href: '/admin/products',         label: 'Productos',        icon: Package,         roles: ['owner', 'staff'] },
  { href: '/admin/inventory',        label: 'Inventario',       icon: Boxes,           roles: ['owner', 'staff'] },
  { href: '/admin/coupons',          label: 'Cupones',          icon: Tag,             roles: ['owner', 'staff'] },
  { href: '/admin/reviews',          label: 'Reseñas',          icon: Star,            roles: ['owner'] },
  { href: '/admin/partners',         label: 'Marcas',           icon: Building2,       roles: ['owner'] },
  { href: '/admin/guides',           label: 'Guias',            icon: BookOpen,        roles: ['owner'] },
  { href: '/admin/reports',          label: 'Reportes',         icon: FileText,        roles: ['owner', 'staff'] },
];

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) ?? 'staff';
  
  // Filter nav items based on role on the server
  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(role));
  
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? 'Admin';
  
  const roleBadge = (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${role === 'owner' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-600 text-slate-300'}`}>
      {role === 'owner' ? '👑 Propietario' : '👤 Empleado'}
    </span>
  );

  return (
    <ClerkProvider localization={esES}>
      <AdminSidebarClient 
        navItems={navItems as any} 
        userEmail={userEmail}
        roleBadge={roleBadge}
        userButton={
          <UserButton 
            afterSignOutUrl="/admin/login" 
            appearance={{ 
              elements: { 
                avatarBox: 'w-9 h-9', 
                userButtonPopoverCard: 'shadow-xl' 
              } 
            }} 
          />
        }
      >
        {children}
      </AdminSidebarClient>
    </ClerkProvider>
  );
}