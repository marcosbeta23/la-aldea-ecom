'use client';

import dynamic from 'next/dynamic';
import type { Partner } from './PartnersCarousel';

// ssr: false is allowed here because this is a Client Component
const PartnersCarouselClient = dynamic(
  () => import('@/components/ui/PartnersCarouselClient'),
  {
    ssr: false,
    loading: () => <div className="h-20 animate-pulse bg-slate-100 rounded-xl" />,
  }
);

interface Props {
  partners: Partner[];
  speed?: number;
}

export default function PartnersCarouselWrapper({ partners, speed }: Props) {
  return <PartnersCarouselClient partners={partners} speed={speed} />;
}
