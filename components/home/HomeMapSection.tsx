'use client';

import dynamic from 'next/dynamic';

const LazyMap = dynamic(() => import("@/components/ui/LazyMap"), {
  ssr: false,
  loading: () => (
    <div className="mt-8 h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl" />
  ),
});

export default function HomeMapSection() {
  return <LazyMap />;
}
