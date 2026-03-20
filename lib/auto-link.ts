import { SEO_CLUSTERS, type ClusterKeyword } from './seo-clusters';

interface AutoLinkOptions {
  maxLinks?: number;
  newTab?: boolean;
  linkClass?: string;
  randomizeAnchor?: boolean;
  excludePaths?: string[];
}

export function autoLinkContent(
  html: string,
  options: AutoLinkOptions = {}
): string {
  const {
    maxLinks = 5,
    newTab = false,
    linkClass = 'text-blue-600 hover:text-blue-700 hover:underline',
    randomizeAnchor = false,
    excludePaths = [],
  } = options;

  const allKeywords: Array<{ url: string; keywords: string[] }> = [];

  for (const cluster of SEO_CLUSTERS) {
    if (excludePaths.some(p => cluster.url.includes(p))) continue;

    allKeywords.push({
      url: cluster.url,
      keywords: cluster.keywords.sort((a, b) => b.term.length - a.term.length).map(k => k.term),
    });
  }

  let linksAdded = 0;
  const usedUrls = new Set<string>();
  let result = html;

  for (const { url, keywords } of allKeywords) {
    if (linksAdded >= maxLinks) break;
    if (usedUrls.has(url)) continue;

    for (const keyword of keywords) {
      if (linksAdded >= maxLinks) break;

      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(
        `(?<!<[^>]*)\\b(${escapedKeyword}(?:es|s)?)\\b(?![^<]*>)`,
        'i'
      );

      if (!isInsideBlockedTag(result, regex)) {
        const match = result.match(regex);
        if (match) {
          const displayText = randomizeAnchor
            ? pickAnchorVariant(keyword, keywords)
            : match[0];

          const linkAttrs = [
            `href="${url}"`,
            `class="${linkClass}"`,
            newTab ? 'target="_blank" rel="noopener"' : '',
          ].filter(Boolean).join(' ');

          result = result.replace(regex, `<a ${linkAttrs}>${displayText}</a>`);
          linksAdded++;
          usedUrls.add(url);
          break;
        }
      }
    }
  }

  return result;
}

function isInsideBlockedTag(html: string, regex: RegExp): boolean {
  const BLOCKED_TAGS = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'button'];

  for (const tag of BLOCKED_TAGS) {
    const blockRegex = new RegExp(
      `<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`,
      'gi'
    );
    const blocked = html.replace(blockRegex, (match) => {
      return match.replace(/\\S/g, '_');
    });

    if (!blocked.match(regex)) return true;
  }

  return false;
}

function pickAnchorVariant(primary: string, allVariants: string[]): string {
  if (Math.random() < 0.7) return primary;
  const others = allVariants.filter(k => k !== primary && k.length > 3);
  if (others.length === 0) return primary;
  return others[Math.floor(Math.random() * others.length)];
}

export function autoLinkBlogContent(
  html: string,
  currentSlug: string,
  options: AutoLinkOptions = {}
): string {
  return autoLinkContent(html, {
    ...options,
    excludePaths: [currentSlug, ...(options.excludePaths || [])],
  });
}
