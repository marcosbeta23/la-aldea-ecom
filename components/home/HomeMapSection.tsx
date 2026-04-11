'use client';

import dynamic from 'next/dynamic';

const LazyMap = dynamic(() => import("@/components/ui/LazyMap"), {
  ssr: false,
  loading: () => (
    <div className="mt-8 h-96 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-100 shadow-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500 text-sm">Cargando mapa...</div>
    </div>
  ),
});

export default function HomeMapSection() {
  return <LazyMap />;
}
