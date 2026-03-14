'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Phone, ChevronDown } from "lucide-react";
import HeroSection from "@/components/HeroSection";

export default function HomeHero() {
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
  <HeroSection className="relative w-full flex flex-col pt-14 sm:pt-16 lg:pt-16 overflow-hidden touch-pan-y">
      
      {/* BACKGROUND IMAGE - Full Width */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/laaldeaedificio.avif"
          alt="La Aldea - Local en Tala"
          fill
          className="object-cover object-[center_40%]"
          priority={true}
          fetchPriority="high"
          sizes="100vw"
          quality={55}
        />
        {/* Dark overlay: lighter gradient to reveal the store image clearly */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050b14]/90 via-[#050b14]/70 to-[#050b14]/20" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] items-center max-w-[1300px] w-full mx-auto gap-2 md:gap-4 lg:gap-12 xl:gap-20">
          {/* LEFT PANEL */}
          <div className="relative flex flex-col justify-center px-3 pt-2 pb-0 md:px-12 md:py-8 lg:pl-12 lg:pr-0 xl:pl-0">
            <div className="hidden md:flex items-center gap-3 mb-5"> 
              <div className="w-8 h-0.5 bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              <span className="font-dm-mono text-[10px] md:text-[11px] text-blue-300 tracking-[0.2em] uppercase font-medium">Más de 25 años en Tala, Canelones</span>
            </div>

            <h1 className="font-barlow font-black leading-[0.85] uppercase tracking-tight mb-2 md:mb-5 mt-2 sm:mt-4">
              <span className="block text-[clamp(4rem,11vw,7.5rem)] md:text-[clamp(3.2rem,8vw,7.5rem)] text-white">Riego.</span>
              <span className="block text-[clamp(4rem,11vw,7.5rem)] md:text-[clamp(3.2rem,8vw,7.5rem)] text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.25)]">Agua.</span>
              <span className="block text-[clamp(4rem,11vw,7.5rem)] md:text-[clamp(3.2rem,8vw,7.5rem)] text-transparent" style={{ WebkitTextStroke: '2px rgba(255, 255, 255, 0.5)' }}>Campo.</span>
            </h1>

            <p className="text-[15px] md:text-[17px] font-light text-slate-300 leading-snug max-w-[500px] mb-6 md:mb-8 hero-fade-in hero-delay-5">
              Bombas de agua, sistemas de riego, instalaciones hidráulicas y más.
              Si tenés un proyecto, te asesoramos sin costo.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-[480px] mt-6 mb-12 md:mb-8 hero-fade-in hero-delay-5">
              <a 
                href="https://wa.me/59892744725?text=Hola,%20me%20gustaría%20consultar%20por%20una%20instalación" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Consultar por WhatsApp — La Aldea"
                className="flex-1 flex flex-col gap-0.5 px-5 py-3.5 bg-blue-600 text-white rounded-xl no-underline cursor-pointer transition-all duration-300 relative overflow-hidden group hover:bg-blue-500 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(37,99,235,0.4)]"
              >
                <span className="font-dm-mono text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-white/90">Para tu proyecto</span>
                <span className="font-epilogue text-[15px] md:text-[16px] font-bold tracking-tight flex items-center gap-2">
                  Consultar instalación
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </span>
              </a>
              <a href="/productos" className="flex-1 flex flex-col gap-0.5 px-5 py-3.5 bg-white/10 text-white rounded-xl no-underline border border-white/20 cursor-pointer transition-all duration-300 group hover:border-white/40 hover:bg-white/15 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-md">
                <span className="font-dm-mono text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-white/80">Compra online</span>
                <span className="font-epilogue text-[15px] md:text-[16px] font-bold tracking-tight flex items-center gap-2">
                  Ver tienda
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </span>
              </a>
            </div>

            <div className="hidden lg:flex items-center gap-3 hero-fade-in hero-delay-5">
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

          {/* RIGHT PANEL - Floating Glassmorphism (Hidden on Mobile) */}
          <div className="hidden lg:flex flex-col justify-center px-6 py-4 md:px-12 lg:px-0 xl:pr-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-[250ms] fill-mode-backwards">
            <div className="relative bg-[#050b14]/50 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col gap-5 overflow-hidden">
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
              <div className="flex flex-col gap-2.5 relative z-10">
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5">
                  <div className="font-dm-mono text-[10px] text-blue-400 w-5 shrink-0 tracking-wider font-semibold">01</div>
                  <div>
                    <div className="text-[13px] font-semibold text-white tracking-tight">Asesoramiento integral</div>
                    <div className="text-[11px] md:text-[12px] font-light text-white/60 mt-0.5 leading-snug">Evaluamos tu necesidad sobre el terreno.</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5">
                  <div className="font-dm-mono text-[10px] text-blue-400 w-5 shrink-0 tracking-wider font-semibold">02</div>
                  <div>
                    <div className="text-[13px] font-semibold text-white tracking-tight">Presupuesto a medida</div>
                    <div className="text-[11px] md:text-[12px] font-light text-white/60 mt-0.5 leading-snug">Seleccionamos los mejores equipos para vos.</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5">
                  <div className="font-dm-mono text-[10px] text-blue-400 w-5 shrink-0 tracking-wider font-semibold">03</div>
                  <div>
                    <div className="text-[13px] font-semibold text-white tracking-tight">Instalación garantizada</div>
                    <div className="text-[11px] md:text-[12px] font-light text-white/60 mt-0.5 leading-snug">Dejamos tu proyecto funcionando al 100%.</div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <a 
                href="https://wa.me/59892744725?text=Hola,%20me%20gustaría%20agendar%20una%20visita%20técnica" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Agendar visita técnica por WhatsApp"
                className="relative z-10 flex items-center justify-between px-4 py-3 bg-white text-[#050b14] rounded-2xl font-epilogue text-[13px] md:text-[14px] font-bold no-underline cursor-pointer transition-all duration-300 tracking-tight mt-1 hover:bg-blue-50 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(255,255,255,0.2)]"
              >
                <span className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Agendar visita técnica
                </span>
                <span className="text-blue-600 bg-blue-50 w-6 h-6 flex items-center justify-center rounded-full">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker Indicator (Bouncing chevron to encourage scrolling) */}
      <div className="absolute bottom-16 lg:bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-top-4 duration-1000 delay-[1000ms] fill-mode-backwards">
        <span className="text-[10px] sm:text-[11px] font-dm-mono uppercase tracking-[0.2em] text-white/60 whitespace-nowrap text-center">Desliza para descubrir</span>
        <ChevronDown className="w-5 h-5 text-white/60 animate-bounce" />
      </div>

      {/* TICKER - Integrated beautifully at the bottom */}
      <div className="relative z-10 mt-auto h-[32px] md:h-[40px] border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center overflow-hidden animate-in fade-in duration-700 delay-[850ms] fill-mode-backwards">
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
