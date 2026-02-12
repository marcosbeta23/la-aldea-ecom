import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Verify that the current request is from an authenticated Clerk user.
 * Use this in all admin API routes.
 * 
 * Returns the userId if authenticated, or a 401 NextResponse if not.
 */
export async function verifyAdminAuth(): Promise<
  { authorized: true; userId: string } | { authorized: false; response: NextResponse }
> {
  const { userId } = await auth();

  if (!userId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      ),
    };
  }

  return { authorized: true, userId };
}
