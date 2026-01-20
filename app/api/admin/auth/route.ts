import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Read env vars inside function to ensure fresh values
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

    // Debug logging (remove in production)
    console.log('🔐 Login attempt');
    console.log('ENV ADMIN_PASSWORD (full):', JSON.stringify(ADMIN_PASSWORD));
    console.log('Password provided (full):', JSON.stringify(password));
    console.log('Password lengths:', ADMIN_PASSWORD?.length, password?.length);
    console.log('Password match:', password === ADMIN_PASSWORD);

    // Validate environment variables
    if (!ADMIN_PASSWORD || !SESSION_SECRET) {
      console.error('❌ ADMIN_PASSWORD or ADMIN_SESSION_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Check password
    if (!password || password !== ADMIN_PASSWORD) {
      console.log('❌ Password mismatch');
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    console.log('✅ Password correct, setting cookie');

    // Set cookie with the session secret as the token value
    // proxy.ts checks: cookie value === ADMIN_SESSION_SECRET
    const cookieStore = await cookies();
    cookieStore.set('admin_token', SESSION_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  return NextResponse.json({ success: true });
}
