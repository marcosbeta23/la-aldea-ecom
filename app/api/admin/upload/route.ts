import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isCfImagesConfigured, uploadToCfImages } from '@/lib/cloudflare-images';

const BUCKET = 'product-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

export async function POST(request: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no permitido. Usa JPG, PNG, WebP o SVG' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo es muy grande. Máximo 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename: timestamp-random-originalname
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = file.name
      .replace(/\.[^.]+$/, '') // remove extension
      .replace(/[^a-zA-Z0-9-_]/g, '-') // sanitize
      .slice(0, 50); // limit length
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}.${ext}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try Cloudflare Images first (better CDN, automatic variants)
    if (isCfImagesConfigured()) {
      const cfResult = await uploadToCfImages(buffer, filename, {
        source: 'admin-upload',
        originalName: file.name,
      });
      if (cfResult) {
        return NextResponse.json({
          url: cfResult.url,
          path: cfResult.id,
          provider: 'cloudflare',
        });
      }
      // Fall through to Supabase if CF upload fails
    }

    // Fallback: Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: `Error al subir: ${error.message}` },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
      provider: 'supabase',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error interno al subir imagen' },
      { status: 500 }
    );
  }
}
