'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Phone } from "lucide-react";
import HeroSection from "@/components/HeroSection";

export default function HomeHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const tickerItems = [
    "Más de 25 años en Tala",
    "Riego por goteo",
    "Instalaciones hidráulicas",
    "Envíos a todo Uruguay",
    "Bombas de agua",
    "Asesoramiento técnico sin costo",
    "Tanques y cisternas",
    "Droguería industrial",
    "Piscinas y filtros",
    "Sistemas solares",
  ];

  return (
  <HeroSection className="relative w-full flex flex-col pt-20 lg:pt-16 overflow-hidden touch-pan-y">
      
      {/* BACKGROUND IMAGE - Full Width */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/laaldeaedificio.webp"
          alt="La Aldea - Local en Tala"
          fill
          className="object-cover object-[center_40%]"
          priority={true}
          sizes="100vw"
          quality={85}
        />
        {/* Dark overlay: deeper on the left for text, lighter on the right where the glass panel sits */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050b14]/95 via-[#050b14]/85 to-[#050b14]/40" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] items-center max-w-[1100px] w-full mx-auto gap-2 md:gap-4 lg:gap-8 xl:gap-12">
          {/* LEFT PANEL */}
          <div className="relative flex flex-col justify-center px-6 py-0 md:px-10 md:py-4 lg:pl-10 lg:pr-0 xl:pl-0">
            <div className={`hidden md:flex items-center gap-2.5 mb-3 transition-all duration-[550ms] ease-out delay-100 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="w-6 h-0.5 bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              <span className="font-dm-mono text-[9px] md:text-[10px] text-blue-300 tracking-[0.2em] uppercase font-medium">Más de 25 años en Tala, Canelones</span>
            </div>

            <h1 className="font-barlow font-black leading-[0.85] uppercase tracking-tight mb-2 md:mb-4">
              <span className={`block text-[clamp(3.5rem,6.5vw,5.5rem)] text-white transition-all duration-700 ease-out delay-[180ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Riego.</span>
              <span className={`block text-[clamp(3.5rem,6.5vw,5.5rem)] text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.25)] transition-all duration-700 ease-out delay-[280ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Agua.</span>
              <span className={`block text-[clamp(3.5rem,6.5vw,5.5rem)] text-transparent transition-all duration-700 ease-out delay-[380ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ WebkitTextStroke: '2px rgba(255, 255, 255, 0.5)' }}>Campo.</span>
            </h1>

            <p className={`text-[14px] md:text-[15px] font-light text-slate-300 leading-snug max-w-[480px] mb-3 md:mb-5 transition-all duration-600 ease-out delay-[480ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Bombas de agua, sistemas de riego, instalaciones hidráulicas y más.
              Si tenés un proyecto, te asesoramos sin costo.
            </p>

            <div className={`flex flex-col sm:flex-row items-stretch gap-2.5 max-w-[460px] mb-4 md:mb-6 transition-all duration-600 ease-out delay-[560ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <a href="https://wa.me/59892744725?text=Hola,%20me%20gustaría%20consultar%20por%20una%20instalación" target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col gap-0.5 px-4 py-3 bg-blue-600 text-white rounded-xl no-underline cursor-pointer transition-all duration-300 relative overflow-hidden group hover:bg-blue-500 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(37,99,235,0.4)]">
                <span className="font-dm-mono text-[8px] md:text-[9px] tracking-[0.15em] uppercase text-white/70">Para tu proyecto</span>
                <span className="font-epilogue text-[14px] md:text-[15px] font-bold tracking-tight flex items-center gap-1.5">
                  Consultar instalación
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </a>
              <a href="/productos" className="flex-1 flex flex-col gap-0.5 px-4 py-3 bg-white/10 text-white rounded-xl no-underline border border-white/20 cursor-pointer transition-all duration-300 group hover:border-white/40 hover:bg-white/15 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-md">
                <span className="font-dm-mono text-[8px] md:text-[9px] tracking-[0.15em] uppercase text-white/50">Compra online</span>
                <span className="font-epilogue text-[14px] md:text-[15px] font-bold tracking-tight flex items-center gap-1.5">
                  Ver tienda
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </a>
            </div>

            <div className={`hidden lg:flex items-center gap-3 transition-opacity duration-600 ease-out delay-[700ms] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-6 h-px bg-white/20 shrink-0" />
              <div>
                <div className="font-fraunces italic font-light text-[15px] md:text-[16px] text-white tracking-wide" style={{ fontVariationSettings: "'opsz' 48" }}>
                  Martín Betancor
                </div>
                <div className="font-dm-mono text-[8.5px] tracking-[0.15em] uppercase text-slate-400 mt-0.5">
                  Fundador <span className="text-slate-600 text-[10px] mx-1">•</span> Director Técnico
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Floating Glassmorphism */}
          <div className={`flex flex-col justify-center px-6 py-3 md:px-10 lg:px-0 transition-all duration-700 ease-out delay-[220ms] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative bg-[#050b14]/50 backdrop-blur-2xl border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col gap-3 md:gap-4 overflow-hidden">
              {/* Glow effects inside the panel */}
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-sky-400/10 blur-[60px] rounded-full pointer-events-none" />

              {/* Search Preview Element */}
              <a href="/productos" className="hidden lg:flex items-center gap-2.5 px-3 py-2.5 bg-black/20 border border-white/10 rounded-2xl transition-all duration-300 relative z-10 hover:border-blue-500/50 hover:bg-black/40 no-underline cursor-pointer group">
                <Search className="w-3.5 h-3.5 text-white/40 shrink-0 group-hover:text-blue-400 transition-colors" />
                <div className="text-[12px] md:text-[13px] text-white/50 flex-1 font-epilogue font-light group-hover:text-white/70 transition-colors">Buscar bombas, filtros...</div>
                <div className="font-dm-mono text-[8px] md:text-[9px] text-blue-400 border border-blue-400/30 bg-blue-400/10 rounded px-1.5 py-0.5 tracking-wider shrink-0 transition-colors group-hover:bg-blue-400 group-hover:text-[#050b14] font-semibold">Tienda</div>
              </a>

              {/* Service Statement */}
              <div className="relative z-10">
                <div className="hidden md:block font-dm-mono text-[8.5px] md:text-[9.5px] tracking-[0.2em] uppercase text-blue-300 mb-1.5 font-medium">Nuestro enfoque</div>
                <div className="font-barlow font-bold text-[18px] md:text-[24px] text-white tracking-wide uppercase leading-[1.05]">
                  Sistemas que <em className="italic text-blue-400 not-italic">resuelven</em> problemas.
                </div>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-1.5 md:gap-2 relative z-10">
                <div className="flex items-center gap-2 md:gap-2.5 px-3 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5">
                  <div className="font-dm-mono text-[9px] text-blue-400 w-4 shrink-0 tracking-wider font-semibold">01</div>
                  <div>
                    <div className="text-[12px] md:text-[13px] font-semibold text-white tracking-tight leading-none">Asesoramiento integral</div>
                    <div className="hidden sm:block text-[10px] md:text-[11px] font-light text-white/60 mt-1 leading-snug">Evaluamos tu necesidad sobre el terreno.</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-2.5 px-3 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5">
                  <div className="font-dm-mono text-[9px] text-blue-400 w-4 shrink-0 tracking-wider font-semibold">02</div>
                  <div>
                    <div className="text-[12px] md:text-[13px] font-semibold text-white tracking-tight leading-none">Presupuesto a medida</div>
                    <div className="hidden sm:block text-[10px] md:text-[11px] font-light text-white/60 mt-1 leading-snug">Seleccionamos los mejores equipos para vos.</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-2.5 px-3 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5">
                  <div className="font-dm-mono text-[9px] text-blue-400 w-4 shrink-0 tracking-wider font-semibold">03</div>
                  <div>
                    <div className="text-[12px] md:text-[13px] font-semibold text-white tracking-tight leading-none">Instalación garantizada</div>
                    <div className="hidden sm:block text-[10px] md:text-[11px] font-light text-white/60 mt-1 leading-snug">Dejamos tu proyecto funcionando al 100%.</div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <a href="https://wa.me/59892744725?text=Hola,%20me%20gustaría%20agendar%20una%20visita%20técnica" target="_blank" rel="noopener noreferrer" className="relative z-10 flex items-center justify-between px-3.5 py-2.5 bg-white text-[#050b14] rounded-2xl font-epilogue text-[12px] md:text-[13px] font-bold no-underline cursor-pointer transition-all duration-300 tracking-tight hover:bg-blue-50 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(255,255,255,0.2)]">
                <span className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  Agendar visita técnica
                </span>
                <span className="text-blue-600 bg-blue-50 w-5 h-5 flex items-center justify-center rounded-full text-[12px]">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* TICKER - Integrated beautifully at the bottom */}
      <div className={`relative z-10 mt-auto h-[32px] md:h-[40px] border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center overflow-hidden transition-opacity duration-700 ease-out delay-[850ms] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 bottom-0 left-0 w-24 md:w-32 z-10 bg-gradient-to-r from-[#050b14]/90 to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 md:w-32 z-10 bg-gradient-to-l from-[#050b14]/90 to-transparent pointer-events-none" />
        
        <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-6 px-8 font-dm-mono text-[11px] tracking-[0.16em] text-white/60 uppercase whitespace-nowrap font-medium">
              {item}
              <span className="text-blue-500/50 text-xl leading-none">·</span>
            </div>
          ))}
        </div>
      </div>
    </HeroSection>
  );
}
