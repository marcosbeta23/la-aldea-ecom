'use client';
import Image from "next/image";
import Link from "next/link";
import { trackUiInteraction } from '@/lib/analytics';

export interface Partner {
  name: string;
  logo: string;
  url?: string | null;
}

interface PartnersCarouselProps {
  partners: Partner[];
}

export default function PartnersCarousel({ partners }: PartnersCarouselProps) {
  // Multiply the partners array to ensure enough width for seamless scrolling
  // We need enough content to fill the screen twice at least so the loop is invisible
  const displayPartners = [...partners, ...partners];

  return (
    <div className="relative overflow-hidden w-full flex items-center">
      <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
        {displayPartners.map((partner, i) => (
          <div
            key={i}
            className="flex items-center justify-center px-10 shrink-0 grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100"
          >
            {partner.url ? (
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visitar sitio de ${partner.name}`}
                data-ph-zone="partners-carousel"
                data-ph-target={partner.name}
                className="block"
                onClick={() => trackUiInteraction('partners_logo_click', { partner: partner.name, destination_type: 'external' })}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={140}
                  height={60}
                  quality={45}
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </a>
            ) : (
              <Link
                href={`/productos?marca=${encodeURIComponent(partner.name)}`}
                aria-label={`Ver productos de ${partner.name}`}
                data-ph-zone="partners-carousel"
                data-ph-target={partner.name}
                className="block"
                onClick={() => trackUiInteraction('partners_logo_click', { partner: partner.name, destination_type: 'brand_filter' })}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={140}
                  height={60}
                  quality={45}
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </Link>
            )}
          </div>
        ))}
      </div>
      
      {/* Gradients to fade edges cleanly */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
