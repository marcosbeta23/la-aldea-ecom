// lib/admin-auth.ts
import { auth } from '@clerk/nextjs/server';
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
  return null;
}

/**
 * Verify that the current request is from any authenticated admin.
 * Use this in staff-accessible admin API routes.
 */
export async function verifyAdminAuth(): Promise<
  { authorized: true; userId: string; role: AdminRole } |
  { authorized: false; response: NextResponse }
> {
  const { userId } = await auth();
  if (!userId) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
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
 * Use this in owner-only admin API routes.
 */
export async function verifyOwnerAuth(): Promise<
  { authorized: true; userId: string } |
  { authorized: false; response: NextResponse }
> {
  const role = await getAdminRole();
  if (role !== 'owner') {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Acceso restringido al propietario' }, { status: 403 }),
    };
  }
  const { userId } = await auth();
  return { authorized: true, userId: userId! };
}