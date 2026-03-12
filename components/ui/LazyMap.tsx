'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

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
      { rootMargin: '200px' } // start loading 200px before it's visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-8 overflow-hidden rounded-3xl bg-white shadow-lg" style={{ height: 400 }}>
      {loaded ? (
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3294.1314809828673!2d-55.76369469999999!3d-34.3471317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a06b0d701e68b7%3A0x5c6ea977f048f63!2sLa%20Aldea%20-%20Mart%C3%ADn%20Betancor!5e0!3m2!1ses-419!2suy!4v1768700144456!5m2!1ses-419!2suy"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación de La Aldea en Google Maps"
          className="w-full h-full"
        />
      ) : (
        /* Placeholder shown until scroll triggers load — matches the iframe's size exactly */
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-6 w-6 text-slate-300 mx-auto mb-2" />
            <span className="text-xs text-slate-400">Cargando mapa...</span>
          </div>
        </div>
      )}
    </div>
  );
}
