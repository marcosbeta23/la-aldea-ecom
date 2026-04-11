'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function LazyMap() {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className="mt-8 h-96 overflow-hidden rounded-3xl bg-white shadow-lg"
      style={{ contentVisibility: 'auto' }}
    >
      {loaded ? (
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3294.1314809828673!2d-55.76369469999999!3d-34.3471317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a06b0d701e68b7%3A0x5c6ea977f048f63!2sLa%20Aldea%20-%20Mart%C3%ADn%20Betancor!5e0!3m2!1ses-419!2suy!4v1768700144456!5m2!1ses-419!2suy"
          width="100%"
          height="100%"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación de La Aldea en Google Maps"
          className="w-full h-full border-0"
        />
      ) : (
        <Image
          src="/assets/images/mapa-la-aldea.avif"
          alt="Ver La Aldea en Google Maps — Tala, Canelones"
          width={400}
          height={384}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 400px"
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 384'%3E%3Crect fill='%23f0f0f0' width='400' height='384'/%3E%3C/svg%3E"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
