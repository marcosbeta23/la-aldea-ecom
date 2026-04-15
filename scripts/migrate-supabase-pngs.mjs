import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  process.exit(1);
}

const BUCKET = 'product-images';
const QUALITY = Number(process.env.PNG_WEBP_QUALITY || 80);
const MAX_DIM = Number(process.env.PNG_WEBP_MAX_DIM || 600);
const AVIF_CQ = Number(process.env.PNG_AVIF_CQ || 40);

const args = process.argv.slice(2);
const hasArg = (name) => args.includes(name);
const getArgValue = (name, fallback = null) => {
  const prefix = `${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const apply = hasArg('--apply');
const deleteOriginal = hasArg('--delete-original');
const allowAvifFallback = hasArg('--allow-avif-fallback');
const limit = Number(getArgValue('--limit', '0')) || 0;
const onlySlug = getArgValue('--only-slug', null);
const onlyId = getArgValue('--only-id', null);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const sanitize = (s) => s.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60);
const isPngUrl = (url) => {
  const clean = String(url || '').split('?')[0].toLowerCase();
  return clean.endsWith('.png');
};

const extractBucketPath = (publicUrl) => {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx < 0) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
};

const runFfmpeg = (inputPath, outputPath, format) => {
  const vf = `scale=${MAX_DIM}:${MAX_DIM}:force_original_aspect_ratio=decrease`;
  const codecArgs =
    format === 'avif'
      ? ['-c:v', 'libaom-av1', '-crf', String(AVIF_CQ), '-b:v', '0', '-cpu-used', '8', '-still-picture', '1']
      : ['-c:v', 'libwebp', '-quality', String(QUALITY), '-compression_level', '6', '-preset', 'picture'];

  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-loglevel',
      'error',
      '-i',
      inputPath,
      '-vf',
      vf,
      ...codecArgs,
      outputPath,
    ],
    { encoding: 'utf8' }
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'ffmpeg conversion failed');
  }
};

async function convertPngBuffer(buffer, tempDir, token, format) {
  const inputPath = path.join(tempDir, `${token}.png`);
  const outputPath = path.join(tempDir, `${token}.${format}`);

  await fs.writeFile(inputPath, buffer);
  runFfmpeg(inputPath, outputPath, format);

  const out = await fs.readFile(outputPath);

  await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)]);
  return out;
}

async function main() {
  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Bucket: ${BUCKET} | webpQ=${QUALITY} | avifCQ=${AVIF_CQ} | maxDim=${MAX_DIM} | avifFallback=${allowAvifFallback}`);

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, images, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Could not load products: ${error.message}`);
  }

  let products = (data || []).filter(
    (p) => Array.isArray(p.images) && p.images.some((img) => isPngUrl(img))
  );

  if (onlySlug) products = products.filter((p) => p.slug === onlySlug);
  if (onlyId) products = products.filter((p) => p.id === onlyId);
  if (limit > 0) products = products.slice(0, limit);

  console.log(`Products with PNG images: ${products.length}`);

  if (products.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'supabase-png-migrate-'));

  let pngFound = 0;
  let convertedCount = 0;
  let productUpdates = 0;
  let failedCount = 0;
  let skippedLargerCount = 0;
  let avifFallbackCount = 0;
  let totalBytesBefore = 0;
  let totalBytesAfter = 0;

  try {
    for (const product of products) {
      const nextImages = [...product.images];
      let changed = false;

      for (let i = 0; i < product.images.length; i += 1) {
        const originalUrl = product.images[i];
        if (!isPngUrl(originalUrl)) continue;

        pngFound += 1;

        try {
          const res = await fetch(originalUrl);
          if (!res.ok) {
            throw new Error(`download failed: HTTP ${res.status}`);
          }

          const inputBuffer = Buffer.from(await res.arrayBuffer());
          const token = crypto.randomBytes(8).toString('hex');
          let outputBuffer = await convertPngBuffer(inputBuffer, tempDir, token, 'webp');
          let outputExt = 'webp';
          let outputContentType = 'image/webp';

          if (outputBuffer.length >= inputBuffer.length && allowAvifFallback) {
            try {
              const avifBuffer = await convertPngBuffer(inputBuffer, tempDir, `${token}-avif`, 'avif');
              if (avifBuffer.length < outputBuffer.length) {
                outputBuffer = avifBuffer;
                outputExt = 'avif';
                outputContentType = 'image/avif';
                avifFallbackCount += 1;
              }
            } catch (avifErr) {
              console.warn(`WARN avif fallback failed ${product.slug}: ${String(avifErr)}`);
            }
          }

          if (outputBuffer.length >= inputBuffer.length) {
            skippedLargerCount += 1;
            console.log(`SKIP larger: ${product.slug} | ${path.basename(originalUrl)}`);
            continue;
          }

          totalBytesBefore += inputBuffer.length;
          totalBytesAfter += outputBuffer.length;

          if (!apply) {
            convertedCount += 1;
            changed = true;
            console.log(
              `DRY ${product.slug} | ${path.basename(originalUrl)} -> .${outputExt} | ${inputBuffer.length} -> ${outputBuffer.length}`
            );
            continue;
          }

          const oldPath = extractBucketPath(originalUrl);
          if (!oldPath) {
            throw new Error(`Cannot extract bucket path from URL: ${originalUrl}`);
          }

          const oldBase = path.basename(oldPath, path.extname(oldPath));
          const newPath = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}-${sanitize(oldBase)}.${outputExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(newPath, outputBuffer, {
              contentType: outputContentType,
              cacheControl: '31536000',
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`upload failed: ${uploadError.message}`);
          }

          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);
          nextImages[i] = urlData.publicUrl;
          changed = true;
          convertedCount += 1;

          console.log(
            `APPLY ${product.slug} | ${path.basename(originalUrl)} -> ${path.basename(uploadData.path)} | ${inputBuffer.length} -> ${outputBuffer.length}`
          );

          if (deleteOriginal) {
            const { error: removeError } = await supabase.storage.from(BUCKET).remove([oldPath]);
            if (removeError) {
              console.warn(`WARN remove old failed (${oldPath}): ${removeError.message}`);
            }
          }
        } catch (err) {
          failedCount += 1;
          console.warn(`FAIL ${product.slug} | ${originalUrl}`);
          console.warn(String(err));
        }
      }

      if (apply && changed) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: nextImages })
          .eq('id', product.id);

        if (updateError) {
          failedCount += 1;
          console.warn(`FAIL DB update ${product.slug}: ${updateError.message}`);
        } else {
          productUpdates += 1;
        }
      }
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  const savings = totalBytesBefore - totalBytesAfter;
  const savingsPct = totalBytesBefore > 0 ? ((savings / totalBytesBefore) * 100).toFixed(2) : '0.00';

  console.log('--- Summary ---');
  console.log(`PNG found: ${pngFound}`);
  console.log(`Converted: ${convertedCount}`);
  console.log(`AVIF fallback used: ${avifFallbackCount}`);
  console.log(`Skipped (larger): ${skippedLargerCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Products updated: ${productUpdates}`);
  console.log(`Input bytes: ${totalBytesBefore}`);
  console.log(`Output bytes: ${totalBytesAfter}`);
  console.log(`Estimated savings: ${savings} bytes (${savingsPct}%)`);
  console.log(`Done (${apply ? 'APPLY' : 'DRY-RUN'}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
