import Link from 'next/link';
import { BookOpen, ShoppingBag, ArrowRight } from 'lucide-react';
import type { FaqArticle } from '@/lib/faq-articles';

interface RelatedLinksProps {
  article: FaqArticle;
  relatedArticles?: FaqArticle[];
}

export default function RelatedLinks({ article, relatedArticles = [] }: RelatedLinksProps) {
  return (
    <aside className="space-y-6">
      {/* Related product categories */}
      {article.relatedCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Productos Relacionados</h3>
          </div>
          <div className="space-y-2">
            {article.relatedCategories.map((cat) => (
              <Link
                key={cat.value}
                href={`/productos?categoria=${encodeURIComponent(cat.value)}`}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group"
              >
                <span className="text-sm font-medium">{cat.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-slate-900">Guias Relacionadas</h3>
          </div>
          <div className="space-y-2">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/guias/${related.slug}`}
                className="block p-3 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors group"
              >
                <p className="text-sm font-medium text-slate-800 group-hover:text-green-700">
                  {related.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{related.category}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Contact CTA */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
        <h3 className="font-bold mb-2">Necesitas asesoramiento?</h3>
        <p className="text-green-100 text-sm mb-4">
          Nuestro equipo tecnico te asesora sin costo.
        </p>
        <a
          href="https://wa.me/59892744725"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors text-sm"
        >
          WhatsApp
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </aside>
  );
}
