'use client';
import Image from "next/image";

export interface Partner {
  name: string;
  logo: string;
}

interface PartnersCarouselProps {
  partners: Partner[];
}

export default function PartnersCarousel({ partners }: PartnersCarouselProps) {
  // Multiply the partners array to ensure enough width for seamless scrolling
  // We need enough content to fill the screen twice at least so the loop is invisible
  const displayPartners = [...partners, ...partners, ...partners, ...partners, ...partners, ...partners];

  return (
    <div className="relative overflow-hidden w-full flex items-center">
      <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
        {displayPartners.map((partner, i) => (
          <div
            key={i}
            className="flex items-center justify-center px-10 shrink-0 grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100"
          >
            <Image
              src={partner.logo}
              alt={partner.name}
              width={140}
              height={60}
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>
        ))}
      </div>
      
      {/* Gradients to fade edges cleanly */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
