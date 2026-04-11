import Link from 'next/link';
import { CATEGORY_HIERARCHY } from '@/lib/categories';
import { getCategoryPath } from '@/lib/category-slugs';
import {
  Droplets,
  Sprout,
  Filter,
  Container,
  Waves,
  FlaskConical,
  Wrench,
  Settings,
  Zap,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Droplets,
  Sprout,
  Filter,
  Container,
  Waves,
  FlaskConical,
  Wrench,
  Settings,
  Zap,
};

interface CategoryBrowseProps {
  categoryCounts: Record<string, number>;
}

export default function CategoryBrowse({ categoryCounts }: CategoryBrowseProps) {
  // Only show categories that have products
  const activeCategories = CATEGORY_HIERARCHY.filter(
    cat => (categoryCounts[cat.value] || 0) > 0
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {activeCategories.map(cat => {
        const Icon = ICON_MAP[cat.icon] || Droplets;
        const count = categoryCounts[cat.value] || 0;

        return (
          <Link
            key={cat.value}
            href={getCategoryPath(cat.value)}
            className="group relative flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-sm`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-center">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {cat.label}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                {count} productos
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
