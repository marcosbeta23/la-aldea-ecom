export interface ClusterKeyword {
  term: string;
  weight: number;
}

export interface SeoCluster {
  url: string;
  cluster: string;
  subCluster?: string;
  keywords: ClusterKeyword[];
  type: 'category' | 'guide' | 'product' | 'pillar';
}

export const SEO_CLUSTERS: SeoCluster[] = [
  // BOMBAS
  {
    url: '/productos/categoria/bombas',
    cluster: 'bombas',
    type: 'category',
    keywords: [
      { term: 'bombas de agua', weight: 10 },
      { term: 'bomba de agua', weight: 10 },
      { term: 'bomba centrífuga', weight: 9 },
      { term: 'bomba sumergible', weight: 9 },
      { term: 'bomba periférica', weight: 8 },
      { term: 'bomba para agua', weight: 7 },
      { term: 'bomba de riego', weight: 7 },
      { term: 'presurizadora', weight: 8 },
      { term: 'bomba de presión', weight: 7 },
      { term: 'bomba para pozo', weight: 8 },
      { term: 'bomba para cisterna', weight: 7 },
      { term: 'sistema de bombeo', weight: 6 },
      { term: 'electrobomba', weight: 7 },
      { term: 'motobomba', weight: 7 },
    ],
  },
  {
    url: '/guias/energias-renovables',
    cluster: 'bombas',
    subCluster: 'solar',
    type: 'guide',
    keywords: [
      { term: 'bomba solar', weight: 10 },
      { term: 'bomba con energía solar', weight: 9 },
      { term: 'bombeo solar', weight: 8 },
      { term: 'bomba fotovoltaica', weight: 7 },
    ],
  },
  {
    url: '/guias/tipos-bombas',
    cluster: 'bombas',
    subCluster: 'tipos',
    type: 'guide',
    keywords: [
      { term: 'bomba sumergible vs superficie', weight: 10 },
      { term: 'diferencia bomba sumergible', weight: 9 },
      { term: 'bomba de superficie', weight: 8 },
    ],
  },

  // RIEGO
  {
    url: '/productos/categoria/riego',
    cluster: 'riego',
    type: 'category',
    keywords: [
      { term: 'sistema de riego', weight: 10 },
      { term: 'sistemas de riego', weight: 10 },
      { term: 'riego agrícola', weight: 9 },
      { term: 'riego por goteo', weight: 9 },
      { term: 'riego por aspersión', weight: 9 },
      { term: 'gotero', weight: 8 },
      { term: 'goteros', weight: 8 },
      { term: 'aspersor', weight: 8 },
      { term: 'aspersores', weight: 8 },
      { term: 'cinta de riego', weight: 8 },
      { term: 'manguera de goteo', weight: 7 },
      { term: 'microaspersión', weight: 7 },
      { term: 'riego automático', weight: 8 },
      { term: 'automatización de riego', weight: 7 },
      { term: 'válvula de riego', weight: 7 },
      { term: 'electroválvula', weight: 7 },
      { term: 'programador de riego', weight: 7 },
      { term: 'temporizador de riego', weight: 6 },
    ],
  },
  {
    url: '/guias/instalar-riego-goteo',
    cluster: 'riego',
    subCluster: 'goteo',
    type: 'guide',
    keywords: [
      { term: 'instalación de riego por goteo', weight: 10 },
      { term: 'instalar riego por goteo', weight: 10 },
      { term: 'cómo instalar goteo', weight: 9 },
      { term: 'instalación de goteo', weight: 8 },
    ],
  },
  {
    url: '/guias/goteo-vs-aspersion',
    cluster: 'riego',
    subCluster: 'comparativa',
    type: 'guide',
    keywords: [
      { term: 'goteo vs aspersión', weight: 10 },
      { term: 'riego por goteo o aspersión', weight: 9 },
      { term: 'diferencia entre goteo y aspersión', weight: 8 },
      { term: 'cuál es mejor goteo o aspersión', weight: 8 },
    ],
  },
  {
    url: '/guias/cuanta-agua-por-hectarea',
    cluster: 'riego',
    subCluster: 'cálculo',
    type: 'guide',
    keywords: [
      { term: 'cuánta agua necesita una hectárea', weight: 10 },
      { term: 'cálculo de agua por hectárea', weight: 10 },
      { term: 'agua para cultivo', weight: 7 },
      { term: 'necesidades hídricas', weight: 7 },
      { term: 'litros por hectárea', weight: 8 },
    ],
  },

  // ALMACENAMIENTO
  {
    url: '/productos/categoria/tanques',
    cluster: 'almacenamiento',
    type: 'category',
    keywords: [
      { term: 'tanque de agua', weight: 10 },
      { term: 'tanques de agua', weight: 10 },
      { term: 'tanque australiano', weight: 10 },
      { term: 'tanque', weight: 9 },
      { term: 'tanques', weight: 9 },
      { term: 'depósito de agua', weight: 8 },
      { term: 'reservorio de agua', weight: 8 },
      { term: 'almacenamiento de agua', weight: 7 },
      { term: 'cisternas', weight: 7 },
      { term: 'tanque elevado', weight: 8 },
      { term: 'tanque polietileno', weight: 8 },
      { term: 'tanque de fibra', weight: 7 },
    ],
  },
  {
    url: '/guias/tanque-australiano-que-es',
    cluster: 'almacenamiento',
    subCluster: 'australiano',
    type: 'guide',
    keywords: [
      { term: 'tanque australiano', weight: 10 },
      { term: 'tanques australianos', weight: 10 },
      { term: 'qué es un tanque australiano', weight: 9 },
      { term: 'cómo instalar tanque australiano', weight: 8 },
    ],
  },

  // FILTROS
  {
    url: '/productos/categoria/filtros',
    cluster: 'filtros',
    type: 'category',
    keywords: [
      { term: 'filtro de agua', weight: 10 },
      { term: 'filtros de agua', weight: 10 },
      { term: 'filtro de disco', weight: 9 },
      { term: 'filtros Gianni', weight: 9 },
      { term: 'filtro para riego', weight: 8 },
      { term: 'filtro de arena', weight: 8 },
      { term: 'filtro de malla', weight: 8 },
      { term: 'filtro de agua potable', weight: 9 },
      { term: 'purificador de agua', weight: 7 },
    ],
  },

  // ENERGÍA SOLAR
  {
    url: '/productos/categoria/energia-solar',
    cluster: 'solar',
    type: 'category',
    keywords: [
      { term: 'panel solar', weight: 10 },
      { term: 'paneles solares', weight: 10 },
      { term: 'energía solar', weight: 9 },
      { term: 'kit solar', weight: 9 },
      { term: 'instalación solar', weight: 8 },
      { term: 'sistema fotovoltaico', weight: 8 },
      { term: 'inversor solar', weight: 8 },
      { term: 'batería solar', weight: 8 },
      { term: 'energía renovable', weight: 7 },
      { term: 'energías renovables', weight: 7 },
      { term: 'energía solar Uruguay', weight: 10 },
    ],
  },

  // PISCINAS
  {
    url: '/productos/categoria/piscinas',
    cluster: 'piscinas',
    type: 'category',
    keywords: [
      { term: 'piscina', weight: 7 },
      { term: 'piscinas', weight: 7 },
      { term: 'cloro para piscina', weight: 10 },
      { term: 'cloro granulado', weight: 9 },
      { term: 'mantenimiento de piscina', weight: 9 },
      { term: 'mantenimiento de piscinas', weight: 9 },
      { term: 'producto para piscina', weight: 8 },
      { term: 'productos para piscina', weight: 8 },
      { term: 'algicida', weight: 8 },
      { term: 'clarificante para piscina', weight: 8 },
      { term: 'floculante', weight: 7 },
      { term: 'pH de piscina', weight: 9 },
      { term: 'regulador de pH', weight: 8 },
      { term: 'bomba de piscina', weight: 9 },
      { term: 'filtro de piscina', weight: 9 },
      { term: 'cloro pastilla', weight: 8 },
      { term: 'cloro en pastillas', weight: 8 },
    ],
  },
  {
    url: '/guias/mantenimiento-piscinas',
    cluster: 'piscinas',
    subCluster: 'mantenimiento',
    type: 'pillar',
    keywords: [
      { term: 'cómo mantener una piscina', weight: 10 },
      { term: 'cómo limpiar piscina', weight: 9 },
      { term: 'cuidado de piscina', weight: 8 },
      { term: 'tratamiento de agua de piscina', weight: 8 },
    ],
  },
  {
    url: '/guias/cuanto-cloro-piscina',
    cluster: 'piscinas',
    subCluster: 'cloro',
    type: 'guide',
    keywords: [
      { term: 'cuánto cloro necesita una piscina', weight: 10 },
      { term: 'cuánto cloro echar', weight: 9 },
      { term: 'dosis de cloro', weight: 9 },
      { term: 'cloro para 50000 litros', weight: 8 },
      { term: 'cómo clorar piscina', weight: 8 },
    ],
  },

  // AGROQUÍMICOS
  {
    url: '/productos/categoria/agroquimicos',
    cluster: 'agroquimicos',
    type: 'category',
    keywords: [
      { term: 'agroquímico', weight: 9 },
      { term: 'agroquímicos', weight: 10 },
      { term: 'herbicida', weight: 9 },
      { term: 'herbicidas', weight: 9 },
      { term: 'insecticida', weight: 9 },
      { term: 'insecticidas', weight: 9 },
      { term: 'fungicida', weight: 9 },
      { term: 'fungicidas', weight: 9 },
      { term: 'fertilizante', weight: 8 },
      { term: 'fertilizantes', weight: 8 },
      { term: 'plaguicida', weight: 8 },
      { term: 'insumos agrícolas', weight: 9 },
      { term: 'agroquímicos Uruguay', weight: 10 },
    ],
  },

  // HIDRÁULICA GENERAL
  {
    url: '/productos/categoria/hidraulica',
    cluster: 'hidraulica',
    type: 'category',
    keywords: [
      { term: 'instalación hidráulica', weight: 10 },
      { term: 'instalaciones hidráulicas', weight: 10 },
      { term: 'tubo PVC', weight: 9 },
      { term: 'caño PVC', weight: 9 },
      { term: 'cañería', weight: 8 },
      { term: 'cañerías', weight: 8 },
      { term: 'accesorios hidráulicos', weight: 8 },
      { term: 'conexión de agua', weight: 7 },
      { term: 'válvula de paso', weight: 8 },
      { term: 'llave de paso', weight: 8 },
      { term: 'accesorio para agua', weight: 7 },
      { term: 'accesorio Tigre', weight: 8 },
      { term: 'accesorio Nicoll', weight: 8 },
    ],
  },

  // HERRAMIENTAS
  {
    url: '/productos/categoria/herramientas',
    cluster: 'herramientas',
    type: 'category',
    keywords: [
      { term: 'herramienta', weight: 7 },
      { term: 'herramientas', weight: 7 },
      { term: 'herramienta eléctrica', weight: 8 },
      { term: 'herramientas eléctricas', weight: 8 },
      { term: 'Lusqtoff', weight: 9 },
      { term: 'taladro', weight: 7 },
      { term: 'amoladora', weight: 7 },
    ],
  },

  // DROGUERÍA
  {
    url: '/productos/categoria/drogueria',
    cluster: 'drogueria',
    type: 'category',
    keywords: [
      { term: 'droguería', weight: 10 },
      { term: 'producto de limpieza industrial', weight: 9 },
      { term: 'productos de limpieza industrial', weight: 9 },
      { term: 'desinfectante industrial', weight: 9 },
      { term: 'desengrasante', weight: 8 },
      { term: 'detergente industrial', weight: 8 },
      { term: 'hipoclorito de sodio', weight: 8 },
      { term: 'producto DIU', weight: 9 },
      { term: 'limpieza de galpón', weight: 7 },
      { term: 'limpieza de tambo', weight: 8 },
      { term: 'desinfección animal', weight: 7 },
    ],
  },

  // GUÍAS PILLAR
  {
    url: '/guias/que-es-riego-agricola',
    cluster: 'riego',
    type: 'pillar',
    keywords: [
      { term: 'riego Uruguay', weight: 10 },
      { term: 'sistemas de riego en Uruguay', weight: 10 },
      { term: 'riego agrícola Uruguay', weight: 10 },
      { term: 'instalar riego Uruguay', weight: 9 },
    ],
  },
  {
    url: '/guias/tipos-bombas', // Combined into types guide
    cluster: 'bombas',
    type: 'pillar',
    keywords: [
      { term: 'guía de bombas de agua', weight: 10 },
      { term: 'todo sobre bombas de agua', weight: 9 },
      { term: 'tipos de bombas de agua', weight: 9 },
    ],
  },
];

export function getClustersByType(type: SeoCluster['type']): SeoCluster[] {
  return SEO_CLUSTERS.filter(c => c.type === type);
}

export function getClusterFamily(clusterName: string): SeoCluster[] {
  return SEO_CLUSTERS.filter(c => c.cluster === clusterName);
}
