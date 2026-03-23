import type { ArticleSection } from '@/lib/faq-articles';
import { autoLinkBlogContent } from '@/lib/auto-link';
import type { SeoCluster } from '@/lib/seo-clusters';

interface ArticleSectionProps {
  section: ArticleSection;
  index: number;
  currentSlug: string;
  additionalClusters?: SeoCluster[];
}

export default function ArticleSectionBlock({ 
  section, 
  index, 
  currentSlug, 
  additionalClusters 
}: ArticleSectionProps) {
  const linkedContent = autoLinkBlogContent(section.content, currentSlug, {
    maxLinks: index === 0 ? 3 : 2,
    linkClass: 'text-blue-600 hover:text-blue-700 hover:underline font-medium',
    excludePaths: [currentSlug],
    additionalClusters: additionalClusters,
  });

  // Stats type gets a colored banner
  if (section.type === 'stats') {
    return (
      <section className="my-8">
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white cursor-pointer hover:shadow-md transition-shadow"
          dangerouslySetInnerHTML={{ __html: linkedContent }}
        />
      </section>
    );
  }

  // Comparison type gets a two-column grid
  if (section.type === 'comparison') {
    return (
      <section className="my-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{section.title}</h2>
        <div
          className="grid sm:grid-cols-2 gap-4 faq-comparison"
          dangerouslySetInnerHTML={{ __html: linkedContent }}
        />
      </section>
    );
  }

  // Table type gets responsive wrapper
  if (section.type === 'table') {
    return (
      <section className="my-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{section.title}</h2>
        <div
          className="overflow-x-auto faq-table"
          dangerouslySetInnerHTML={{ __html: linkedContent }}
        />
      </section>
    );
  }

  return (
    <section className="my-8">
      <h2 className="text-xl font-bold text-slate-900 mb-4">{section.title}</h2>
      <div
        className="faq-content text-slate-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: linkedContent }}
      />
    </section>
  );
}
