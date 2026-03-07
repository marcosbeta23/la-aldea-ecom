
'use client';
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

interface Partner {
  name: string;
  logo: string;
}

interface PartnersCarouselProps {
  partners: Partner[];
  speed?: number; // px per second
}

export default function PartnersCarousel({ partners, speed = 60 }: PartnersCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [offset, setOffset] = useState(0);

  // Calculate width of one set
  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.scrollWidth / 2);
    }
  }, [partners]);

  // Animation loop
  useEffect(() => {
    if (!trackWidth) return;
    let raf: number;
    let last = performance.now();
    function animate(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      setOffset((prev) => {
        let next = prev - speed * dt;
        if (Math.abs(next) >= trackWidth) {
          next += trackWidth;
        }
        return next;
      });
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [trackWidth, speed]);

  return (
    <div className="relative overflow-hidden w-full">
      <div
        ref={trackRef}
        className="flex"
        style={{
          transform: `translateX(${offset}px)`,
          transition: "none",
          width: trackWidth ? trackWidth * 2 : undefined,
        }}
      >
        {[...partners, ...partners].map((partner, i) => (
          <div
            key={i}
            className="flex items-center gap-12 px-6 shrink-0 grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100"
          >
            <Image
              src={partner.logo}
              alt={partner.name}
              width={100}
              height={50}
              className="h-10 w-auto object-contain"
            />
          </div>
        ))}
      </div>
      {/* Gradients */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
