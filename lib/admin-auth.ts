// lib/admin-auth.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export type AdminRole = 'owner' | 'staff';

/**
 * Returns the role from the current session's publicMetadata.
 * Returns null if not authenticated or no role is set.
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role === 'owner' || role === 'staff') return role;
  
  const user = await currentUser();
  const metaRole = user?.publicMetadata?.role as AdminRole | undefined;
  if (metaRole === 'owner' || metaRole === 'staff') return metaRole;
  
  return null;
}

/**
 * Check that no is_active=false override exists in admin_users for this email.
 * Returns true if the user is allowed (active or not found in table).
 * Returns false if explicitly deactivated.
 */
async function checkIsActive(email: string): Promise<boolean> {
  if (!email) return true; // no email = let Clerk handle it
  try {
    const adminUsersTable = supabaseAdmin.from('admin_users') as unknown as {
      select: (columns: 'is_active') => {
        eq: (column: 'email', value: string) => {
          maybeSingle: () => Promise<{ data: { is_active: boolean | null } | null }>;
        };
      };
    };

    const { data } = await adminUsersTable
      .select('is_active')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    // If row not found (data is null) allow through — not all admins are in the table
    if (data === null) return true;
    return data.is_active === true;
  } catch {
    // On DB error, allow through to avoid locking out admins on transient failures
    return true;
  }
}

/**
 * Verify that the current request is from any authenticated admin.
 * Also cross-checks is_active in admin_users table (fix for admin deactivation gap).
 */
export async function verifyAdminAuth(): Promise<
  { authorized: true; userId: string; role: AdminRole } |
  { authorized: false; response: NextResponse }
> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
  }

  // Fix #6: check is_active in DB — deactivated employees get 403 even if their Clerk session is still valid
  const email = (sessionClaims?.email as string) ?? '';
  if (email) {
    const active = await checkIsActive(email);
    if (!active) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 }),
      };
    }
  }

  const role = await getAdminRole();
  if (!role) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Sin rol asignado' }, { status: 403 }),
    };
  }
  return { authorized: true, userId, role };
}

/**
 * Verify that the current request is from an owner.
 * Also cross-checks is_active in admin_users table.
 */
export async function verifyOwnerAuth(): Promise<
  { authorized: true; userId: string } |
  { authorized: false; response: NextResponse }
> {
  const { userId, sessionClaims } = await auth();

  // Fix #6: check is_active before role
  const email = (sessionClaims?.email as string) ?? '';
  if (email) {
    const active = await checkIsActive(email);
    if (!active) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 }),
      };
    }
  }

  const role = await getAdminRole();
  if (role !== 'owner') {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Acceso restringido al propietario' }, { status: 403 }),
    };
  }
  return { authorized: true, userId: userId! };
}