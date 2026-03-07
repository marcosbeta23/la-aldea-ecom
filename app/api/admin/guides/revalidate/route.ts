import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await req.json();
  revalidatePath(`/faq/${slug}`);
  revalidatePath(`/guias/${slug}`);
  return NextResponse.json({ revalidated: true });
}
