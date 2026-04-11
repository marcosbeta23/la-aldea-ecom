import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

type RevalidatePayload = {
  path?: string;
  paths?: string[];
  tag?: string;
  tags?: string[];
};

function toArray(single?: string, many?: string[]): string[] {
  const values = [single, ...(many || [])].filter((value): value is string => Boolean(value));
  return [...new Set(values)];
}

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.REVALIDATE_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET no está configurado' },
      { status: 503 }
    );
  }

  const providedSecret = request.headers.get('x-revalidate-secret');
  if (providedSecret !== configuredSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: RevalidatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const paths = toArray(payload.path, payload.paths).filter((path) => path.startsWith('/'));
  const tags = toArray(payload.tag, payload.tags).map((tag) => tag.trim()).filter(Boolean);

  if (paths.length === 0 && tags.length === 0) {
    return NextResponse.json(
      { error: 'Debes enviar al menos path(s) o tag(s)' },
      { status: 400 }
    );
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  for (const tag of tags) {
    revalidateTag(tag, 'max');
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    tags,
  });
}
