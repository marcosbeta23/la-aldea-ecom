/**
 * La Aldea — SEO Metadata Utilities
 * -----------------------------------
 * Centralizes title and description generation for:
 *  - Category pages (with and without ?sub= param)
 *  - Product pages (enriches short titles with primary category)
 *  - Exported constants for static pages
 *
 * Usage in generateMetadata():
 *   import { getCategoryMeta, getProductTitle, STATIC_META } from '@/lib/seo-metadata'
 */

// ---------------------------------------------------------------------------
// CATEGORY META — main category pages (/productos/categoria/[categoria])
// ---------------------------------------------------------------------------
// Keys are the decoded, lowercase URL segment (params.categoria)
export const CATEGORY_META: Record<string, { title: string; description: string }> = {
  piscinas: {
    title: "Productos para Piscinas en Uruguay | La Aldea",
    description:
      "Cloro, algicidas, clarificadores, filtros y bombas para piscinas domésticas y comerciales. Todo para el mantenimiento de tu piscina en La Aldea, Tala, Uruguay.",
  },
  riego: {
    title: "Sistemas de Riego para Campo y Jardín | La Aldea",
    description:
      "Cintas de goteo, aspersores, mangueras y accesorios de riego para campo y jardín. Equipate con soluciones de irrigación en La Aldea, Tala, Canelones.",
  },
  bombas: {
    title: "Bombas de Agua para Riego, Hogar y Campo | La Aldea",
    description:
      "Bombas sumergibles, centrífugas, periféricas y presurizadoras de marcas líderes. Consultá precios y disponibilidad en La Aldea, Uruguay.",
  },
  "hidráulica": {
    title: "Materiales Hidráulicos y Conexiones en Uruguay | La Aldea",
    description:
      "Caños, cuplas, conexiones, filtros y accesorios hidráulicos para instalaciones rurales y domésticas. Todo en hidráulica disponible en La Aldea, Tala.",
  },
  hidraulica: {
    title: "Materiales Hidráulicos y Conexiones en Uruguay | La Aldea",
    description:
      "Caños, cuplas, conexiones, filtros y accesorios hidráulicos para instalaciones rurales y domésticas. Todo en hidráulica disponible en La Aldea, Tala.",
  },
  herramientas: {
    title: "Herramientas Eléctricas y Manuales en Uruguay | La Aldea",
    description:
      "Taladros, sierras, termofusoras y herramientas manuales de marcas líderes. Para el campo, el hogar y el taller. Disponibles en La Aldea, Tala.",
  },
  "droguería": {
    title: "Droguería y Productos Industriales | La Aldea",
    description:
      "Disolventes, desinfectantes, productos de limpieza y químicos industriales. Amplio stock disponible en La Aldea, Tala, Uruguay.",
  },
  droguer: {
    title: "Droguería y Productos Industriales | La Aldea",
    description:
      "Disolventes, desinfectantes, productos de limpieza y químicos industriales. Amplio stock disponible en La Aldea, Tala, Uruguay.",
  },
  filtros: {
    title: "Filtros de Agua para Riego e Hidráulica | La Aldea",
    description:
      "Filtros de malla, disco y rotordisk para riego y agua potable. Soluciones de filtrado para el campo y el hogar disponibles en La Aldea, Uruguay.",
  },
  tanques: {
    title: "Tanques de Agua Tricapa y Australianos | La Aldea",
    description:
      "Tanques tricapa, australianos y de polietileno para almacenamiento de agua. Distintas capacidades disponibles en La Aldea, Tala, Canelones.",
  },
  "energía solar": {
    title: "Sistemas de Energía Solar y Paneles Fotovoltaicos | La Aldea",
    description:
      "Paneles solares y sistemas de bombeo solar para el campo y el hogar en Uruguay. Soluciones de energía renovable disponibles en La Aldea, Tala.",
  },
  "energia solar": {
    title: "Sistemas de Energía Solar y Paneles Fotovoltaicos | La Aldea",
    description:
      "Paneles solares y sistemas de bombeo solar para el campo y el hogar en Uruguay. Soluciones de energía renovable disponibles en La Aldea, Tala.",
  },
  accesorios: {
    title: "Accesorios para Riego e Hidráulica | La Aldea",
    description:
      "Conectores, adaptadores y accesorios para sistemas de riego e hidráulica. Stock permanente en La Aldea, Tala, Uruguay.",
  },
  "caños": {
    title: "Caños y Tuberías para Hidráulica y Riego | La Aldea",
    description:
      "Caños PVC, mangueras y tubería flexible para instalaciones hidráulicas y de riego. Disponibles en La Aldea, Tala, Canelones.",
  },
  canos: {
    title: "Caños y Tuberías para Hidráulica y Riego | La Aldea",
    description:
      "Caños PVC, mangueras y tubería flexible para instalaciones hidráulicas y de riego. Disponibles en La Aldea, Tala, Canelones.",
  },
  sumergibles: {
    title: "Bombas Sumergibles para Pozo y Cisterna | La Aldea",
    description:
      "Bombas sumergibles para extracción de agua de pozo, cisterna y represas. Distintas potencias y caudales disponibles en La Aldea, Uruguay.",
  },
  "centrífugas": {
    title: "Bombas Centrífugas para Riego y Campo | La Aldea",
    description:
      "Bombas centrífugas de uno y múltiples impulsores para riego agrícola y aplicaciones domésticas. Disponibles en La Aldea, Tala, Uruguay.",
  },
  centrifugas: {
    title: "Bombas Centrífugas para Riego y Campo | La Aldea",
    description:
      "Bombas centrífugas de uno y múltiples impulsores para riego agrícola y aplicaciones domésticas. Disponibles en La Aldea, Tala, Uruguay.",
  },
  mangueras: {
    title: "Mangueras para Riego y Uso Industrial | La Aldea",
    description:
      "Mangueras de riego, alta presión y uso industrial disponibles por metro o rollo en La Aldea, Tala, Canelones, Uruguay.",
  },
  desinfectantes: {
    title: "Desinfectantes para Uso Doméstico e Industrial | La Aldea",
    description:
      "Creolina, hipoclorito, desinfectantes y productos de saneamiento para uso doméstico e industrial. Amplio stock en La Aldea, Tala.",
  },
  "agroquímicos": {
    title: "Agroquímicos y Fertilizantes para el Campo | La Aldea",
    description:
      "Urea agrícola, cipermetrina y agroquímicos para la producción agropecuaria en Uruguay. Disponibles en La Aldea, Tala, Canelones.",
  },
  agroquimicos: {
    title: "Agroquímicos y Fertilizantes para el Campo | La Aldea",
    description:
      "Urea agrícola, cipermetrina y agroquímicos para la producción agropecuaria en Uruguay. Disponibles en La Aldea, Tala, Canelones.",
  },
  "cloro y químicos": {
    title: "Cloro y Químicos para Piscinas en Uruguay | La Aldea",
    description:
      "Cloro en polvo, tabletas y granulado, plus algicidas y clarificadores para piscinas. Tratamiento completo del agua disponible en La Aldea, Tala.",
  },
  industriales: {
    title: "Productos Industriales y Droguería | La Aldea",
    description:
      "Solventes, adhesivos, lubricantes y productos químicos industriales para uso profesional. Disponibles en La Aldea, Tala, Uruguay.",
  },
  presurizadoras: {
    title: "Presurizadoras de Agua para el Hogar | La Aldea",
    description:
      "Presurizadoras automáticas para mejorar la presión de agua en el hogar. Distintos modelos y potencias disponibles en La Aldea, Tala.",
  },
  goteo: {
    title: "Riego por Goteo para Campo y Huerta | La Aldea",
    description:
      "Cintas de goteo, goteros, emisores y accesorios para riego de precisión en agricultura y huerta. Disponibles en La Aldea, Uruguay.",
  },
};

// ---------------------------------------------------------------------------
// SUBCATEGORY META — when ?sub= param is present
// ---------------------------------------------------------------------------
// Keys: [categoria_lower][sub_exact_string]
export const SUBCATEGORY_META: Record<
  string,
  Record<string, { title: string; description: string }>
> = {
  piscinas: {
    "Agua Potable": {
      title: "Agua Potable para Piscinas en Uruguay | La Aldea",
      description:
        "Filtros y sistemas de tratamiento de agua potable para piscinas en Uruguay. Soluciones para mantener el agua limpia y segura disponibles en La Aldea, Tala.",
    },
    "De Calor": {
      title: "Equipos de Calor para Piscinas en Uruguay | La Aldea",
      description:
        "Bombas de calor y equipos de calefacción para piscinas domésticas y comerciales. Mantenéla a temperatura ideal todo el año. Consultanos en La Aldea, Tala.",
    },
    "Químicos Piscina Droguería": {
      title: "Químicos para Piscinas — Droguería | La Aldea",
      description:
        "Algicidas, clarificadores, estabilizadores y químicos especializados para el mantenimiento de piscinas en Uruguay. Disponibles en La Aldea, Tala.",
    },
    Desinfectantes: {
      title: "Desinfectantes para Piscinas en Uruguay | La Aldea",
      description:
        "Desinfectantes para piscinas residenciales y comerciales. Mantené el agua limpia y segura con productos de calidad disponibles en La Aldea, Tala.",
    },
    "Cloro y Químicos": {
      title: "Cloro y Químicos para Piscinas en Uruguay | La Aldea",
      description:
        "Cloro en polvo, tabletas y granulado para piscinas. Tratamiento completo con químicos especializados. Comprá online o consultanos en La Aldea, Tala, Uruguay.",
    },
    Industriales: {
      title: "Químicos Industriales para Piscinas Comerciales | La Aldea",
      description:
        "Productos químicos en volumen para piscinas de gran escala: clubes, hoteles y complejos deportivos en Uruguay. Consultanos en La Aldea, Tala.",
    },
  },
  bombas: {
    Sumergibles: {
      title: "Bombas Sumergibles para Pozo y Cisterna | La Aldea",
      description:
        "Bombas sumergibles para extracción de agua de pozo, cisterna y represa. Distintas potencias disponibles en La Aldea, Tala, Uruguay.",
    },
    "Centrífugas": {
      title: "Bombas Centrífugas para Riego y Campo | La Aldea",
      description:
        "Bombas centrífugas mono y multiestáticas para riego agrícola y doméstico. Consultá precios y disponibilidad en La Aldea, Uruguay.",
    },
    Presurizadoras: {
      title: "Presurizadoras de Agua para el Hogar | La Aldea",
      description:
        "Presurizadoras automáticas para mejorar la presión en el hogar. Distintos modelos Leo y PIU disponibles en La Aldea, Tala.",
    },
    Multietapa: {
      title: "Bombas Multietapa para Alta Presión | La Aldea",
      description:
        "Bombas multietapa para sistemas de alta presión en riego y aplicaciones industriales. Disponibles en La Aldea, Tala, Canelones.",
    },
  },
  filtros: {
    Disco: {
      title: "Filtros de Disco para Riego | La Aldea",
      description:
        "Filtros de disco Rotordisk y similares para sistemas de riego por goteo y microaspersión. Disponibles en La Aldea, Tala, Uruguay.",
    },
    "Agua Potable": {
      title: "Filtros de Agua Potable en Uruguay | La Aldea",
      description:
        "Filtros de malla y disco para agua potable doméstica e industrial. Instalación y asesoramiento disponible en La Aldea, Tala.",
    },
  },
  herramientas: {
    "Eléctricas": {
      title: "Herramientas Eléctricas — Taladros, Sierras y Más | La Aldea",
      description:
        "Taladros, sierras caladora, termofusoras y herramientas eléctricas de marcas líderes. Disponibles en La Aldea, Tala, Uruguay.",
    },
    Manuales: {
      title: "Herramientas Manuales para Campo y Taller | La Aldea",
      description:
        "Herramientas manuales de uso agrícola, hidráulico y de taller disponibles en La Aldea, Tala, Canelones.",
    },
  },
};

// ---------------------------------------------------------------------------
// STATIC PAGE META — for pages with short/duplicate titles
// ---------------------------------------------------------------------------
export const STATIC_META = {
  blog: {
    title: "Blog — Riego, Hidráulica y Soluciones Hídicas | La Aldea",
    description:
      "Guías, consejos y novedades sobre riego, bombas de agua, hidráulica y piscinas en Uruguay. Contenido técnico y práctico del equipo de La Aldea, Tala.",
  },
  contacto: {
    title: "Contacto | La Aldea — Riego e Insumos en Tala, Uruguay",
    description:
      "Contactate con La Aldea por WhatsApp, teléfono o email. Estamos en Tala, Canelones. Atendemos consultas sobre riego, bombas, hidráulica y piscinas en todo Uruguay.",
  },
  nosotros: {
    title: "Quiénes Somos | La Aldea — 25 Años en Tala, Canelones",
    description:
      "La Aldea es una empresa familiar con más de 25 años de experiencia en riego, hidráulica y soluciones hídicas en Tala, Canelones, Uruguay. Conocé nuestra historia.",
  },
  sitemap: {
    // Use { absolute } to bypass the Next.js title template and avoid duplication
    title: { absolute: "Mapa del Sitio | La Aldea" } as const,
    description:
      "Mapa del sitio de La Aldea — navegá todas las secciones: productos, servicios, guías y más.",
  },
  productos: {
    title: "Catálogo de Productos — Riego, Bombas e Hidráulica | La Aldea",
    description:
      "Explorá el catálogo completo de La Aldea: bombas de agua, sistemas de riego, hidráulica, herramientas, piscinas y más. Comprá online o consultanos en Tala.",
  },
  faq: {
    title: "Preguntas Frecuentes — Riego, Bombas y Piscinas | La Aldea",
    description:
      "Respuestas a las preguntas más frecuentes sobre bombas de agua, sistemas de riego, piscinas y servicios de instalación en Uruguay. La Aldea, Tala.",
  },
} as const;

// ---------------------------------------------------------------------------
// PRODUCT TITLE HELPER
// ---------------------------------------------------------------------------
// Enriches short product titles by appending the primary category.
// Threshold: if the plain title is under 40 chars, add "— Category" to reach
// the 40–60 char sweet spot recommended by Google.
//
// Usage in app/productos/[slug]/page.tsx generateMetadata:
//   title: getProductTitle(product.name, product.category),
export function getProductTitle(name: string, categories: string[]): string {
  const plain = `${name} | La Aldea`;
  if (plain.length >= 40 || !categories?.length) return plain;

  // Pick the most specific (first) category, skip generic ones
  const skip = new Set(["Droguería", "Industriales"]);
  const bestCat = categories.find((c) => !skip.has(c)) ?? categories[0];

  return `${name} — ${bestCat} | La Aldea`;
}

// ---------------------------------------------------------------------------
// CATEGORY META RESOLVER
// ---------------------------------------------------------------------------
// Returns the correct title/description for a given categoria + optional sub.
export function getCategoryMeta(
  categoriaParam: string,
  sub?: string
): { title: string; description: string } {
  const catKey = decodeURIComponent(categoriaParam).toLowerCase();

  // 1. Sub-category match (exact key match on the decoded sub string)
  if (sub) {
    const subMeta = SUBCATEGORY_META[catKey]?.[sub];
    if (subMeta) return subMeta;

    // Fallback: dynamic sub title when no explicit mapping
    const displayCat = decodeURIComponent(categoriaParam);
    return {
      title: `${sub} — ${displayCat} | La Aldea`,
      description: `Productos de ${sub} dentro de la categoría ${displayCat}. Encontrá lo que necesitás en La Aldea, Tala, Canelones, Uruguay.`,
    };
  }

  // 2. Main category match
  const catMeta = CATEGORY_META[catKey];
  if (catMeta) return catMeta;

  // 3. Generic fallback
  const displayCat = decodeURIComponent(categoriaParam);
  return {
    title: `${displayCat} | La Aldea — Riego e Hidráulica en Uruguay`,
    description: `Productos de ${displayCat} para riego, hidráulica y campo. Comprá online o consultanos en La Aldea, Tala, Canelones, Uruguay.`,
  };
}
