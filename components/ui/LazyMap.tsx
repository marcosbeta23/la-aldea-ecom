'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3294.1314809828673!2d-55.76369469999999!3d-34.3471317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a06b0d701e68b7%3A0x5c6ea977f048f63!2sLa%20Aldea%20-%20Mart%C3%ADn%20Betancor!5e0!3m2!1ses-419!2suy!4v1768700144456!5m2!1ses-419!2suy';
const MAPS_EXTERNAL_URL = 'https://maps.app.goo.gl/4oUish4o13iMrJ2c9';

export default function LazyMap() {
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative mt-8 h-96 overflow-hidden rounded-3xl bg-white shadow-lg [content-visibility:auto]"
    >
      <Image
        src="/assets/images/mapa-la-aldea.avif"
        alt="Ver La Aldea en Google Maps — Tala, Canelones"
        width={400}
        height={384}
        loading="eager"
        sizes="(max-width: 768px) 100vw, 400px"
        placeholder="blur"
        blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 384'%3E%3Crect fill='%23f0f0f0' width='400' height='384'/%3E%3C/svg%3E"
        className={`h-full w-full object-cover transition-opacity duration-500 ${mapReady ? 'opacity-0' : 'opacity-100'}`}
      />

      {shouldLoadMap && (
        <iframe
          src={MAP_EMBED_URL}
          width="100%"
          height="100%"
          allowFullScreen
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación de La Aldea en Google Maps"
          onLoad={() => setMapReady(true)}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-500 ${mapReady ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {!mapReady && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl bg-slate-900/65 px-3 py-2 text-xs text-white backdrop-blur-sm">
          <span>{shouldLoadMap ? 'Cargando mapa interactivo...' : 'Mapa interactivo disponible'}</span>
          <a
            href={MAPS_EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto shrink-0 rounded-lg bg-white/20 px-2.5 py-1 font-medium text-white transition-colors hover:bg-white/30"
          >
            Abrir mapa
          </a>
        </div>
      )}
    </div>
  );
}
