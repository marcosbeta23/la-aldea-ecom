// app/feed/google-merchant.xml/route.ts
//
// Google Merchant Center product feed
// Accessible at: https://laaldeatala.com.uy/feed/google-merchant.xml
//
// Setup in Google Merchant Center:
//   Products → Feeds → Add feed → Scheduled fetch
//   URL: https://laaldeatala.com.uy/feed/google-merchant.xml
//   Fetch frequency: Daily

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Re-generate on every request (Vercel Edge caches via Cache-Control below)
export const dynamic = 'force-dynamic'

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getAvailability(stock: number, availabilityType: string): string {
  if (stock > 0) return 'in_stock'
  if (availabilityType === 'on_request') return 'backorder'
  return 'out_of_stock'
}

// ─── Feed Route ─────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS — safe for server-only route
  )

  const { data: products, error } = await supabase
    .from('products')
    .select(
      'id, sku, name, description, slug, images, price_numeric, currency, stock, brand, category, availability_type, show_price_on_request, shipping_type'
    )
    .eq('is_active', true)
    .eq('show_price_on_request', false) // Skip products without public price
    .gt('price_numeric', 0)            // Google requires a real price
    .order('sold_count', { ascending: false }) // Best sellers first

  if (error) {
    console.error('[google-merchant-feed] Supabase error:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }

  const BASE_URL = 'https://laaldeatala.com.uy'

  const items = (products ?? [])
    .filter(
      (p) =>
        p.slug &&                        // Must have a URL
        p.images?.length > 0             // Must have at least one image
    )
    .map((p) => {
      const availability = getAvailability(p.stock ?? 0, p.availability_type)
      const price = `${Number(p.price_numeric).toFixed(2)} UYU`
      const imageUrl = p.images[0]
      const productUrl = `${BASE_URL}/productos/${p.slug}`

      // Map your category array to a human-readable product type
      const productType = Array.isArray(p.category) && p.category.length > 0
        ? escapeXml(p.category.join(' > '))
        : ''

      // Use SKU as the merchant ID (stable, unique, readable)
      const itemId = escapeXml(p.sku || p.id)

      return `
    <item>
      <g:id>${itemId}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(p.description || p.name)}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:condition>new</g:condition>${
        p.brand ? `\n      <g:brand>${escapeXml(p.brand)}</g:brand>` : ''
      }${
        productType ? `\n      <g:product_type>${productType}</g:product_type>` : ''
      }${
        p.sku ? `\n      <g:mpn>${escapeXml(p.sku)}</g:mpn>` : ''
      }${
        // Mark freight/large items as requiring shipping quote
        p.shipping_type === 'pickup_only'
          ? '\n      <g:shipping>\n        <g:country>UY</g:country>\n        <g:service>Retiro en local</g:service>\n        <g:price>0 UYU</g:price>\n      </g:shipping>'
          : ''
      }
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>La Aldea - Insumos Agrícolas y Riego</title>
    <link>${BASE_URL}</link>
    <description>Sistemas de riego, bombas de agua, herramientas y soluciones rurales en Uruguay. Envíos a todo el país.</description>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      // Vercel CDN caches for 1 hour, serves stale for up to 24h while revalidating
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}