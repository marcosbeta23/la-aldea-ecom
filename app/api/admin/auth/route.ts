// app/api/admin/auth/route.ts
// DEPRECATED: Authentication is now handled by Clerk.
// This route is kept temporarily for backwards compatibility.
// It can be safely deleted once Clerk migration is verified.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Autenticación movida a Clerk. Usa /admin/login.' },
    { status: 410 } // Gone
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Logout manejado por Clerk.' },
    { status: 410 }
  );
}
