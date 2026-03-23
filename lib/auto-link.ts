import { SEO_CLUSTERS, type ClusterKeyword, type SeoCluster } from './seo-clusters';

interface AutoLinkOptions {
  maxLinks?: number;
  newTab?: boolean;
  linkClass?: string;
  randomizeAnchor?: boolean;
  excludePaths?: string[];
  additionalClusters?: SeoCluster[];
}

export function autoLinkContent(
  html: string | null | undefined,
  options: AutoLinkOptions = {}
): string {
  if (!html || typeof html !== 'string' || html.trim() === '') return '';
  const {
    maxLinks = 5,
    newTab = false,
    linkClass = 'text-blue-600 hover:text-blue-700 hover:underline',
    randomizeAnchor = false,
    excludePaths = [],
    additionalClusters = [],
  } = options;

  // 1. Filter and prepare clusters
  const allClusters = [...SEO_CLUSTERS, ...additionalClusters];
  const clustersToUse = allClusters.filter(
    c => !excludePaths.some(p => c.url.includes(p))
  ).map(c => ({
    url: c.url,
    keywords: [...c.keywords].sort((a, b) => b.term.length - a.term.length).map(k => k.term),
  }));

  // 2. Tokenize HTML into chunks
  type Chunk = { type: 'tag' | 'text'; content: string; isLinked?: boolean };
  const chunks: Chunk[] = [];
  const tagRegex = /<[^>]+>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      chunks.push({ type: 'text', content: html.slice(lastIndex, match.index) });
    }
    chunks.push({ type: 'tag', content: match[0] });
    lastIndex = tagRegex.lastIndex;
  }
  if (lastIndex < html.length) {
    chunks.push({ type: 'text', content: html.slice(lastIndex) });
  }

  // 3. Process blocks and replace keywords
  const BLOCKED_TAGS = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'button', 'script', 'style']);
  let linksAdded = 0;
  const usedUrls = new Set<string>();

  for (const { url, keywords } of clustersToUse) {
    if (linksAdded >= maxLinks) break;
    if (usedUrls.has(url)) continue;

    let urlLinked = false;

    for (const keyword of keywords) {
      if (urlLinked || linksAdded >= maxLinks) break;

      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escapedKeyword}(?:es|s)?)\\b`, 'i');

      let blockedLevel = 0;

      // Iterate through chunks to find a safe place for the link
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        if (chunk.type === 'tag') {
          const tagNameMatch = chunk.content.match(/^<\/?([a-z0-9]+)/i);
          if (tagNameMatch) {
            const tagName = tagNameMatch[1].toLowerCase();
            if (BLOCKED_TAGS.has(tagName)) {
              if (chunk.content.startsWith('</')) {
                blockedLevel = Math.max(0, blockedLevel - 1);
              } else if (!chunk.content.endsWith('/>')) {
                blockedLevel++;
              }
            }
          }
          continue;
        }

        // Only process text chunks NOT inside blocked tags and NOT already containing a link
        if (blockedLevel === 0 && !chunk.isLinked) {
          const m = chunk.content.match(regex);
          if (m) {
            const index = m.index!;
            const fullMatchText = m[0];
            const displayText = randomizeAnchor
              ? pickAnchorVariant(keyword, keywords)
              : fullMatchText;

            const linkAttrs = [
              `href="${url}"`,
              `class="${linkClass}"`,
              newTab ? 'target="_blank" rel="noopener"' : '',
            ].filter(Boolean).join(' ');

            const linkHtml = `<a ${linkAttrs}>${displayText}</a>`;

            // Split the chunk
            const before = chunk.content.slice(0, index);
            const after = chunk.content.slice(index + fullMatchText.length);

            // Replace current chunk and insert new ones
            chunks[i] = { type: 'text', content: before };
            const linkChunk: Chunk = { type: 'tag', content: linkHtml, isLinked: true };
            const afterChunk: Chunk = { type: 'text', content: after };

            chunks.splice(i + 1, 0, linkChunk, afterChunk);

            linksAdded++;
            usedUrls.add(url);
            urlLinked = true;
            break;
          }
        }
      }
    }
  }

  return chunks.map(c => c.content).join('');
}

function pickAnchorVariant(primary: string, allVariants: string[]): string {
  if (Math.random() < 0.7) return primary;
  const others = allVariants.filter(k => k !== primary && k.length > 3);
  if (others.length === 0) return primary;
  return others[Math.floor(Math.random() * others.length)];
}

export function autoLinkBlogContent(
  html: string | null | undefined,
  currentSlug: string,
  options: AutoLinkOptions = {}
): string {
  if (!html) return '';
  return autoLinkContent(html, {
    ...options,
    excludePaths: [currentSlug, ...(options.excludePaths || [])],
    additionalClusters: options.additionalClusters,
  });
}
