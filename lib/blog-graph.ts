export interface BlogLink {
  targetSlug: string;
  anchorText: string;
  context?: string;
  relation: 'pillar-to-sub' | 'sub-to-pillar' | 'lateral' | 'product';
}

export interface BlogNode {
  slug: string;
  cluster: string;
  type: 'pillar' | 'sub' | 'product-page';
  outboundLinks: BlogLink[];
}

export const BLOG_GRAPH: BlogNode[] = [
  {
    slug: 'sistemas-de-riego-uruguay',
    cluster: 'riego',
    type: 'pillar',
    outboundLinks: [
      {
        targetSlug: 'riego-por-goteo-instalacion',
        anchorText: 'instalación de riego por goteo',
        relation: 'pillar-to-sub',
      },
      {
        targetSlug: 'riego-por-goteo-vs-aspersion',
        anchorText: 'riego por goteo vs aspersión',
        relation: 'pillar-to-sub',
      },
      {
        targetSlug: 'calculo-agua-por-hectarea',
        anchorText: 'cálculo de agua por hectárea',
        relation: 'pillar-to-sub',
      },
      {
        targetSlug: 'riego-automatico-huerta-jardin',
        anchorText: 'riego automático para huerta',
        relation: 'pillar-to-sub',
      },
      {
        targetSlug: 'guia-completa-bombas-agua',
        anchorText: 'bombas de agua para riego',
        relation: 'lateral',
        context: 'El riego necesita una bomba — cross-cluster',
      },
    ],
  },
  {
    slug: 'riego-por-goteo-instalacion',
    cluster: 'riego',
    type: 'sub',
    outboundLinks: [
      {
        targetSlug: 'sistemas-de-riego-uruguay',
        anchorText: 'guía completa de sistemas de riego',
        relation: 'sub-to-pillar',
      },
      {
        targetSlug: 'riego-por-goteo-vs-aspersion',
        anchorText: 'diferencias entre goteo y aspersión',
        relation: 'lateral',
      },
      {
        targetSlug: 'guia-completa-bombas-agua',
        anchorText: 'qué bomba necesitas para el goteo',
        relation: 'lateral',
      },
    ],
  },
  {
    slug: 'riego-por-goteo-vs-aspersion',
    cluster: 'riego',
    type: 'sub',
    outboundLinks: [
      {
        targetSlug: 'sistemas-de-riego-uruguay',
        anchorText: 'sistemas de riego en Uruguay',
        relation: 'sub-to-pillar',
      },
      {
        targetSlug: 'riego-por-goteo-instalacion',
        anchorText: 'cómo instalar riego por goteo',
        relation: 'lateral',
      },
      {
        targetSlug: 'calculo-agua-por-hectarea',
        anchorText: 'cuánta agua necesita tu cultivo',
        relation: 'lateral',
      },
    ],
  },
  {
    slug: 'guia-completa-bombas-agua',
    cluster: 'bombas',
    type: 'pillar',
    outboundLinks: [
      {
        targetSlug: 'bomba-sumergible-vs-superficie',
        anchorText: 'diferencias entre bomba sumergible y de superficie',
        relation: 'pillar-to-sub',
      },
      {
        targetSlug: 'bombas-solares-riego-agricola',
        anchorText: 'bombas solares para riego',
        relation: 'pillar-to-sub',
      },
      {
        targetSlug: 'sistemas-de-riego-uruguay',
        anchorText: 'sistemas de riego que usan estas bombas',
        relation: 'lateral',
      },
    ],
  },
  {
    slug: 'bomba-sumergible-vs-superficie',
    cluster: 'bombas',
    type: 'sub',
    outboundLinks: [
      {
        targetSlug: 'guia-completa-bombas-agua',
        anchorText: 'guía completa de bombas de agua',
        relation: 'sub-to-pillar',
      },
      {
        targetSlug: 'bombas-solares-riego-agricola',
        anchorText: 'bombas solares como alternativa',
        relation: 'lateral',
      },
    ],
  },
  {
    slug: 'mantenimiento-piscinas-uruguay',
    cluster: 'piscinas',
    type: 'pillar',
    outboundLinks: [
      {
        targetSlug: 'cuanto-cloro-piscina',
        anchorText: 'cuánto cloro necesita tu piscina',
        relation: 'pillar-to-sub',
      },
      {
        targetSlug: 'ph-piscina-como-regular',
        anchorText: 'cómo regular el pH del agua',
        relation: 'pillar-to-sub',
      },
    ],
  },
  {
    slug: 'cuanto-cloro-piscina',
    cluster: 'piscinas',
    type: 'sub',
    outboundLinks: [
      {
        targetSlug: 'mantenimiento-piscinas-uruguay',
        anchorText: 'guía completa de mantenimiento de piscinas',
        relation: 'sub-to-pillar',
      },
      {
        targetSlug: 'ph-piscina-como-regular',
        anchorText: 'también ajustar el pH del agua',
        relation: 'lateral',
      },
    ],
  },
];

export function getOutboundLinks(slug: string): BlogLink[] {
  const node = BLOG_GRAPH.find(n => n.slug === slug);
  return node?.outboundLinks || [];
}

export function getInboundLinks(slug: string): Array<{ sourceSlug: string; anchorText: string }> {
  return BLOG_GRAPH.flatMap(node =>
    node.outboundLinks
      .filter(link => link.targetSlug === slug)
      .map(link => ({
        sourceSlug: node.slug,
        anchorText: link.anchorText,
      }))
  );
}

export function getRelatedPosts(
  currentSlug: string,
  maxItems = 3
): Array<{ slug: string; anchorText: string; relation: BlogLink['relation'] }> {
  const outbound = getOutboundLinks(currentSlug);
  return outbound
    .slice(0, maxItems)
    .map(link => ({
      slug: link.targetSlug,
      anchorText: link.anchorText,
      relation: link.relation,
    }));
}
