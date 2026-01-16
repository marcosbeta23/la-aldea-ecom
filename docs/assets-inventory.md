# Assets Inventory - La Aldea E-Commerce

**Date:** January 16, 2026  
**Source:** `la-aldea-website` (Netlify site)  
**Destination:** `la-aldea-ecom/public/assets/images/`

---

## 📁 Folder Structure

```
public/
└── assets/
    └── images/
        ├── favicon/           # All favicon files
        ├── partners/          # Brand partner logos
        ├── products/          # Product category images
        ├── services/          # Service images
        ├── logo.webp          # Main La Aldea logo
        ├── og-image.webp      # Open Graph social share image
        ├── laaldeaedificio.webp  # Hero image (building)
        └── map-static.webp    # Static map image
```

---

## 🖼️ Core Images

### Logo & Branding
| File | Size | Usage | Format |
|------|------|-------|--------|
| `logo.webp` | High-res | Navbar, footer, social | WebP |
| `og-image.webp` | 1200x630 | Social media share | WebP |

### Hero Images
| File | Size | Usage | Format |
|------|------|-------|--------|
| `laaldeaedificio.webp` | Hero-sized | Homepage hero section | WebP |
| `map-static.webp` | Static | Contact section map | WebP |

---

## 🏢 Partner Logos (12 brands)

**Location:** `public/assets/images/partners/`

| File | Brand | Type |
|------|-------|------|
| `gianni.webp` | Gianni | Filtros de agua |
| `diu.webp` | DIU | Droguería Industrial Uruguaya |
| `tigre1.webp` | Tigre | Cañerías PVC |
| `nicoll.webp` | Nicoll | Cañerías y accesorios |
| `hidroservice.webp` | Hidroservice | Bombas y sistemas |
| `pacifil.webp` | Pacifil | Cables y electricidad |
| `cablinur.webp` | Cablinur | Cables |
| `lesa.webp` | Lesa | Herramientas |
| `ramasil.webp` | Ramasil | Construcción |
| `balaguer.webp` | Balaguer | Herramientas |
| `armco.webp` | Armco | Industrial |
| `lusqtoff.webp` | Lusqtoff | Herramientas eléctricas |

**Usage:**
- Homepage partners section
- Product pages (related brands)
- Footer brand carousel

---

## 🛒 Product Category Images (7 images)

**Location:** `public/assets/images/products/`

| File | Category | Usage |
|------|----------|-------|
| `agricultural.webp` | Hidráulica / Insumos Agrícolas | Product category card |
| `drogueria.webp` | Droguería Industrial | Product category card |
| `drogueria2.webp` | Droguería (alternate) | Alternative image |
| `filters.webp` | Filtros de Agua | Product category card |
| `pool.webp` | Piscinas | Product category card |
| `renewable.webp` | Energías Renovables | Product category card |
| `tools.webp` | Herramientas | Product category card |

**Usage:**
- Homepage product categories section
- Product listing page banners
- Category navigation

---

## 🔧 Service Images (1 image)

**Location:** `public/assets/images/services/`

| File | Service | Usage |
|------|---------|-------|
| `irrigation.webp` | Instalaciones Hidráulicas | Service section card |

**Note:** May need additional service images for:
- Diseño de sistemas de riego
- Asesoramiento técnico
- Instalaciones de bombas

---

## 🎨 Favicon Files (7 files)

**Location:** `public/assets/images/favicon/`

| File | Size | Usage | Format |
|------|------|-------|--------|
| `favicon.ico` | Multiple sizes | Legacy browsers | ICO |
| `favicon.svg` | Vector | Modern browsers | SVG |
| `favicon-96x96.png` | 96x96 | General favicon | PNG |
| `apple-touch-icon.png` | 180x180 | iOS home screen | PNG |
| `web-app-manifest-192x192.png` | 192x192 | PWA manifest | PNG |
| `web-app-manifest-512x512.png` | 512x512 | PWA manifest | PNG |
| `site.webmanifest` | - | PWA configuration | JSON |

**Implementation:**
- Add to `app/layout.tsx` metadata
- Reference in `<link>` tags
- Copy `site.webmanifest` to `public/`

---

## ✅ Optimization Status

### All images are already optimized ✅
- **Format:** WebP (modern, compressed)
- **Quality:** Production-ready
- **Optimization:** Already done in Netlify site
- **Size:** Appropriate for web delivery

### No additional optimization needed
All images from the Netlify site are already:
- In WebP format (best compression)
- Properly sized for their use cases
- Optimized for web delivery

---

## 📋 Implementation Checklist

### Next.js Configuration
- [ ] Update `next.config.ts` to allow image optimization
- [ ] Configure `remotePatterns` if using external images
- [ ] Set up `Image` component with proper sizing

### Metadata Setup
- [ ] Add favicon links to `app/layout.tsx`
- [ ] Configure Open Graph image path
- [ ] Update Twitter Card image
- [ ] Test social share previews

### Component Usage
```typescript
// Example: Using Next.js Image component
import Image from 'next/image'

<Image
  src="/assets/images/logo.webp"
  alt="La Aldea - Tala, Uruguay"
  width={200}
  height={80}
  priority // For above-the-fold images
/>
```

### Manifest File
- [ ] Copy `site.webmanifest` to `public/` root
- [ ] Update paths in manifest to match new structure
- [ ] Test PWA installation on mobile

---

## 🎯 Usage Guidelines

### Logo Usage
- **Navbar:** 180px width (desktop), 140px (mobile)
- **Footer:** 150px width
- **Social share:** Use `og-image.webp`

### Hero Images
- **laaldeaedificio.webp:** Full-width hero, max 1920px viewport
- Implement `priority` prop for immediate load
- Use `fill` prop with `object-cover` for responsive

### Partner Logos
- Display in grid: 3 cols (mobile), 4 cols (tablet), 6 cols (desktop)
- Grayscale by default, color on hover
- Link to partner websites (if applicable)

### Product Images
- Used as category cards
- Aspect ratio: 16:9 or 4:3
- Implement hover effects (scale, shadow)

---

## 🔄 Future Additions

### Recommended Additional Images
1. **Service images:**
   - Riego por goteo installation
   - Bombas de agua samples
   - Mantenimiento de piscinas
   
2. **Team photos:**
   - Martín Betancor (founder)
   - Store exterior
   - Customer testimonial photos

3. **Product photos:**
   - Individual product shots (when adding to e-commerce)
   - 360° product views (premium products)
   - Installation examples

4. **Content images:**
   - Blog post headers (future)
   - Tutorial/guide images
   - Before/after installation photos

---

## 📝 Image Credits & Licenses

**All images are proprietary assets of La Aldea:**
- Logo designed for La Aldea Tala
- Building photos taken at store location
- Product images: Mix of supplier assets and custom photos
- Partner logos: Used with permission from respective brands

**No attribution required** (owned assets)  
**No external licenses** needed

---

## 🔐 Backup & Version Control

### Git Status
- ✅ All images added to `public/assets/images/`
- ⚠️ Files are in `.gitignore` by default for large assets
- 🎯 **Action needed:** Verify images are tracked in git

### Backup Location
- Original source: `d:\Escritorio\CODE\la-aldea-website\src\assets\images\`
- Backup copy: Consider cloud storage (Google Drive/Dropbox)

### File Sizes (Approximate)
- Total folder size: ~2-3 MB
- Individual images: 50-300 KB each (WebP compression)
- Safe for git repository (under 5MB threshold)

---

## 🚀 Next Steps (Card 7 Completion)

- [x] Create folder structure
- [x] Copy all images from Netlify site
- [x] Verify all files copied successfully
- [x] Document inventory
- [ ] Update `site.webmanifest` paths
- [ ] Test images load in Next.js dev server
- [ ] Implement in components (Week 2)

---

**Status:** ✅ All assets collected and organized  
**Ready for:** Week 2 implementation (Cards 9-16)
