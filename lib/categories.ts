// lib/categories.ts
// Centralized category & subcategory hierarchy for La Aldea e-commerce
// Used by: products page, filters, admin form, SEO

export interface SubCategory {
  value: string;
  label: string;
  /** Keywords to auto-detect this subcategory from product name/description */
  keywords: string[];
}

export interface CategoryConfig {
  value: string;
  label: string;
  description: string;
  /** Tailwind gradient classes */
  color: string;
  /** Lucide icon name reference */
  icon: string;
  subcategories: SubCategory[];
}

/**
 * Main category hierarchy with subcategories.
 * Products use `category: string[]` where:
 * - First element = main category (e.g. "Bombas")
 * - Additional elements = subcategories/cross-tags (e.g. "Sumergibles")
 */
export const CATEGORY_HIERARCHY: CategoryConfig[] = [
  {
    value: 'Bombas',
    label: 'Bombas',
    description: 'Bombas de agua centrífugas, sumergibles, periféricas y multietapa para riego, piscinas y uso doméstico',
    color: 'from-blue-500 to-blue-600',
    icon: 'Droplets',
    subcategories: [
      { value: 'Sumergibles', label: 'Sumergibles', keywords: ['sumergible', 'sumerg', 'pozo profundo'] },
      { value: 'Periféricas', label: 'Periféricas', keywords: ['periférica', 'periferica', 'perifér'] },
      { value: 'Centrífugas', label: 'Centrífugas', keywords: ['centrífuga', 'centrifuga', 'centríf'] },
      { value: 'Multietapa', label: 'Multietapa', keywords: ['multietapa', 'multi etapa', 'multi-etapa'] },
      { value: 'Presurizadoras', label: 'Presurizadoras', keywords: ['presuriz', 'presión', 'presion', 'booster'] },
      { value: 'Solares', label: 'Solares', keywords: ['solar', 'fotovolt'] },
      { value: 'De Calor', label: 'De Calor', keywords: ['calor', 'calefacc', 'heat pump', 'climatiz'] },
      { value: 'Para Piscina', label: 'Para Piscina', keywords: ['piscina', 'pileta'] },
    ],
  },
  {
    value: 'Riego',
    label: 'Riego',
    description: 'Sistemas de riego por goteo, aspersión y microaspersión con mangueras, aspersores y automatización',
    color: 'from-green-500 to-green-600',
    icon: 'Sprout',
    subcategories: [
      { value: 'Goteo', label: 'Goteo', keywords: ['goteo', 'gotero', 'drip'] },
      { value: 'Aspersión', label: 'Aspersión', keywords: ['aspersión', 'aspersion', 'aspersor', 'sprinkler'] },
      { value: 'Microaspersión', label: 'Microaspersión', keywords: ['microaspersión', 'microaspersor', 'micro aspersión'] },
      { value: 'Mangueras', label: 'Mangueras', keywords: ['manguera', 'manga'] },
      { value: 'Conectores', label: 'Conectores y Accesorios', keywords: ['conector', 'unión', 'union', 'codo', 'te ', 'tee', 'acople'] },
      { value: 'Automatización', label: 'Automatización', keywords: ['timer', 'programador', 'automatiz', 'electroválvula', 'electrovalvula'] },
    ],
  },
  {
    value: 'Filtros',
    label: 'Filtros',
    description: 'Filtros de agua para riego, agua potable y piscinas: de disco, malla, arena y carbón activado',
    color: 'from-teal-500 to-teal-600',
    icon: 'Filter',
    subcategories: [
      { value: 'Agua Potable', label: 'Agua Potable', keywords: ['potable', 'gianni', 'purificad'] },
      { value: 'Disco', label: 'De Disco', keywords: ['disco', 'disk'] },
      { value: 'Arena', label: 'De Arena', keywords: ['arena', 'sand'] },
      { value: 'Carbón Activado', label: 'De Carbón Activado', keywords: ['carbón', 'carbon', 'activado'] },
      { value: 'Repuestos Filtros', label: 'Repuestos', keywords: ['repuesto', 'cartucho', 'membrana'] },
    ],
  },
  {
    value: 'Tanques',
    label: 'Tanques',
    description: 'Tanques de polietileno para agua potable, riego agrícola y ganadería, desde 500 hasta 10.000 litros',
    color: 'from-cyan-500 to-cyan-600',
    icon: 'Container',
    subcategories: [
      { value: 'Polietileno', label: 'De Polietileno', keywords: ['polietileno', 'plástico', 'plastico', 'rotomold'] },
      { value: 'Australianos', label: 'Australianos', keywords: ['australian', 'chapa'] },
      { value: 'Cisternas', label: 'Cisternas', keywords: ['cisterna', 'subterr'] },
      { value: 'Hidroneumáticos', label: 'Hidroneumáticos', keywords: ['hidroneumático', 'hidroneumatico', 'presurizado', 'membrana'] },
    ],
  },
  {
    value: 'Piscinas',
    label: 'Piscinas',
    description: 'Bombas de calor, filtros de arena, cloro y accesorios para el mantenimiento de tu piscina en Uruguay',
    color: 'from-sky-500 to-sky-600',
    icon: 'Waves',
    subcategories: [
      { value: 'Bombas Piscina', label: 'Bombas', keywords: ['bomba'] },
      { value: 'Filtros Piscina', label: 'Filtros', keywords: ['filtro', 'filtración'] },
      { value: 'Cloro y Químicos', label: 'Cloro y Químicos', keywords: ['cloro', 'químico', 'quimico', 'alguicida', 'ph', 'floculante'] },
      { value: 'Accesorios Piscina', label: 'Accesorios', keywords: ['skimmer', 'barrefondo', 'manguera', 'aspirador', 'escalera', 'iluminación'] },
    ],
  },
  {
    value: 'Químicos',
    label: 'Químicos',
    description: 'Productos químicos para piscinas y uso agrícola: cloro, algicidas, herbicidas, fungicidas e insecticidas',
    color: 'from-purple-500 to-purple-600',
    icon: 'FlaskConical',
    subcategories: [
      { value: 'Tratamiento Agua', label: 'Tratamiento de Agua', keywords: ['tratamiento', 'potabiliz', 'clor'] },
      { value: 'Limpieza Industrial', label: 'Limpieza Industrial', keywords: ['limpi', 'desinf', 'industrial'] },
      { value: 'Agroquímicos', label: 'Agroquímicos', keywords: ['agroquímico', 'agroquimico', 'herbicida', 'fungicida', 'insecticida'] },
    ],
  },
  {
    value: 'Herramientas',
    label: 'Herramientas',
    description: 'Herramientas eléctricas y manuales: amoladoras, sierras, taladros, fumigadoras y más para profesionales',
    color: 'from-orange-500 to-orange-600',
    icon: 'Wrench',
    subcategories: [
      { value: 'Manuales', label: 'Manuales', keywords: ['manual', 'llave', 'destornillador', 'martillo', 'alicate', 'pinza'] },
      { value: 'Eléctricas', label: 'Eléctricas', keywords: ['eléctrica', 'electrica', 'amoladora', 'taladro', 'rotomartillo', 'sierra'] },
      { value: 'Medición', label: 'Medición', keywords: ['medición', 'medicion', 'cinta métrica', 'nivel', 'metro', 'manómetro'] },
      { value: 'Corte', label: 'Corte', keywords: ['corte', 'sierra', 'serrucho', 'tijera'] },
    ],
  },
  {
    value: 'Accesorios',
    label: 'Accesorios',
    description: 'Conexiones PVC, válvulas, caños y accesorios para instalaciones hidráulicas, riego y plomería',
    color: 'from-amber-500 to-amber-600',
    icon: 'Settings',
    subcategories: [
      { value: 'Conexiones PVC', label: 'Conexiones PVC', keywords: ['pvc', 'conexión', 'conexion', 'codo', 'te ', 'reducción'] },
      { value: 'Válvulas', label: 'Válvulas', keywords: ['válvula', 'valvula', 'llave de paso', 'esclusa', 'check', 'retención'] },
      { value: 'Caños y Tuberías', label: 'Caños y Tuberías', keywords: ['caño', 'tubería', 'cano', 'tuberia', 'tubo'] },
      { value: 'Abrazaderas', label: 'Abrazaderas y Fijaciones', keywords: ['abrazadera', 'fijación', 'fijacion', 'soporte', 'grampa'] },
    ],
  },
  {
    value: 'Hidráulica',
    label: 'Hidráulica',
    description: 'Instalaciones hidráulicas completas: cañerías, válvulas, conexiones y bombas para uso doméstico y agrícola',
    color: 'from-blue-600 to-blue-700',
    icon: 'Droplets',
    subcategories: [
      { value: 'Cañerías', label: 'Cañerías', keywords: ['cañería', 'caneria', 'caño', 'cano', 'tubo', 'tubería'] },
      { value: 'Conexiones Hidráulicas', label: 'Conexiones', keywords: ['conexión', 'conexion', 'fitting', 'niple', 'unión'] },
      { value: 'Válvulas Hidráulicas', label: 'Válvulas', keywords: ['válvula', 'valvula', 'llave'] },
      { value: 'Presurización', label: 'Presurización', keywords: ['presurización', 'presurizacion', 'presión', 'presion'] },
    ],
  },
  {
    value: 'Droguería',
    label: 'Droguería',
    description: 'Productos de limpieza, desinfectantes e insumos industriales y agropecuarios registrados por DIU',
    color: 'from-violet-500 to-violet-600',
    icon: 'FlaskConical',
    subcategories: [
      { value: 'Limpieza', label: 'Limpieza', keywords: ['limpi', 'detergente', 'lavandina', 'jabón', 'jabon'] },
      { value: 'Desinfectantes', label: 'Desinfectantes', keywords: ['desinfect', 'sanitiz', 'bactericida'] },
      { value: 'Industriales', label: 'Industriales', keywords: ['industrial', 'diu'] },
    ],
  },
  {
    value: 'Energía Solar',
    label: 'Energía Solar',
    description: 'Paneles solares, bombas solares e inversores para riego y generación de energía eléctrica autónoma en el campo',
    color: 'from-yellow-500 to-yellow-600',
    icon: 'Zap',
    subcategories: [
      { value: 'Paneles Solares', label: 'Paneles Solares', keywords: ['panel', 'fotovolt', 'módulo solar'] },
      { value: 'Inversores', label: 'Inversores', keywords: ['inversor', 'regulador', 'controlador'] },
      { value: 'Bombas Solares', label: 'Bombas Solares', keywords: ['bomba solar', 'bombeo solar'] },
      { value: 'Baterías', label: 'Baterías', keywords: ['batería', 'bateria', 'acumulador'] },
    ],
  },
];

/** Flat list of main category values (for backward compat with KNOWN_CATEGORIES) */
export const KNOWN_CATEGORIES = CATEGORY_HIERARCHY.map(c => c.value);

/** Get all subcategory values for a given main category */
export function getSubcategories(mainCategory: string): SubCategory[] {
  const cat = CATEGORY_HIERARCHY.find(c => c.value.toLowerCase() === mainCategory.toLowerCase());
  return cat?.subcategories || [];
}

/** Get a flat list of all subcategory values across all categories */
export function getAllSubcategoryValues(): string[] {
  return CATEGORY_HIERARCHY.flatMap(c => c.subcategories.map(s => s.value));
}

/** Check if a string is a main category (not a subcategory) */
export function isMainCategory(cat: string): boolean {
  return KNOWN_CATEGORIES.some(k => k.toLowerCase() === cat.toLowerCase());
}

/** Given a subcategory value, find which main category it belongs to */
export function findParentCategory(subcategory: string): string | null {
  for (const cat of CATEGORY_HIERARCHY) {
    if (cat.subcategories.some(s => s.value.toLowerCase() === subcategory.toLowerCase())) {
      return cat.value;
    }
  }
  return null;
}

/**
 * Auto-detect subcategories from product name + description.
 * Returns matching subcategory values for a given main category.
 */
export function detectSubcategories(
  mainCategory: string,
  productName: string,
  productDescription?: string | null
): string[] {
  const subs = getSubcategories(mainCategory);
  if (!subs.length) return [];

  const text = `${productName} ${productDescription || ''}`.toLowerCase();
  const matches: string[] = [];

  for (const sub of subs) {
    if (sub.keywords.some(kw => text.includes(kw.toLowerCase()))) {
      matches.push(sub.value);
    }
  }

  return matches;
}
