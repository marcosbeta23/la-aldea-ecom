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
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const onlyRecent = args.includes('--only-recent');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const marker = `/storage/v1/object/public/${BUCKET}/`;

const pathFromUrl = (url) => {
  const val = String(url || '');
  const idx = val.indexOf(marker);
  if (idx < 0) return null;
  return decodeURIComponent(val.slice(idx + marker.length));
};

const isModern = (p) => /\.(webp|avif)$/i.test(p || '');
const migratedPattern = /^\d{13}-[a-f0-9]{6}-(.+)\.(webp|avif)$/i;

async function main() {
  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Bucket: ${BUCKET}`);

  let query = supabase.from('products').select('id,slug,images,updated_at');
  if (onlyRecent) {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString();
    query = query.gt('updated_at', since);
    console.log(`Scope: products updated since ${since}`);
  } else {
    console.log('Scope: all products');
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Could not load products: ${error.message}`);
  }

  const referencedPaths = new Set();
  const migratedImagePaths = [];

  for (const product of data || []) {
    const images = Array.isArray(product.images) ? product.images : [];
    for (const url of images) {
      const p = pathFromUrl(url);
      if (!p) continue;
      referencedPaths.add(p);
      if (isModern(p)) migratedImagePaths.push(p);
    }
  }

  const candidates = new Set();
  for (const p of migratedImagePaths) {
    const match = p.match(migratedPattern);
    if (!match) continue;
    const oldBase = match[1];
    const oldPng = `${oldBase}.png`;
    if (!referencedPaths.has(oldPng)) {
      candidates.add(oldPng);
    }
  }

  const candidateList = [...candidates].sort();
  const existingCandidates = [];

  for (const candidate of candidateList) {
    const { data, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(candidate);

    if (!downloadError && data) {
      existingCandidates.push(candidate);
    }
  }

  console.log(`Referenced storage paths: ${referencedPaths.size}`);
  console.log(`Migrated modern image paths: ${migratedImagePaths.length}`);
  console.log(`Orphan PNG candidates (derived): ${candidateList.length}`);
  console.log(`Orphan PNG candidates (existing): ${existingCandidates.length}`);

  if (!apply) {
    for (const c of existingCandidates) {
      console.log(`CANDIDATE ${c}`);
    }
    console.log('Done (DRY-RUN).');
    return;
  }

  let removed = 0;
  let failed = 0;

  for (let i = 0; i < existingCandidates.length; i += 100) {
    const chunk = existingCandidates.slice(i, i + 100);
    const { data: removedData, error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove(chunk);

    if (removeError) {
      failed += chunk.length;
      console.warn(`FAIL removing chunk starting at ${i}: ${removeError.message}`);
      continue;
    }

    removed += Array.isArray(removedData) ? removedData.length : chunk.length;
  }

  console.log('--- Summary ---');
  console.log(`Candidates (existing): ${existingCandidates.length}`);
  console.log(`Removed: ${removed}`);
  console.log(`Failed: ${failed}`);
  console.log('Done (APPLY).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
