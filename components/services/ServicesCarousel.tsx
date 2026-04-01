'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Droplets,
    CloudRain,
    Gauge,
    Timer,
    Sun,
    Database,
    Leaf,
    Shield,
    Lightbulb,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   SERVICE DATA
   imageSlug → /public/assets/images/servicios/{slug}.webp
───────────────────────────────────────────────────────────── */
interface ServiceData {
    icon: React.ElementType;
    overline: string;
    title: string;
    description: string;
    tags: string[];
    /** What kind of photo to shoot / source */
    photoDescription: string;
    imageSlug: string;
    accentHex: string;
}

const SERVICES: ServiceData[] = [
    {
        icon: Droplets,
        overline: 'Horticultura · Frutales · Viñedos',
        title: 'Riego por Goteo',
        description:
            'Relevamiento de campo, diseño hidráulico y montaje completo. Optimizamos el uso del agua y los nutrientes adaptando cada instalación al suelo, cultivo y fuente hídrica disponible.',
        tags: ['Goteo superficial', 'Goteo subsuperficial', 'Fertirrigación'],
        photoDescription:
            'Vista aérea (drone) de líneas de goteo sobre viñedo o cultivo hortícola. Luz de amanecer o atardecer dorado. Transmite precisión y tecnología agrícola.',
        imageSlug: 'riego-goteo',
        accentHex: '#3b82f6',
    },
    {
        icon: CloudRain,
        overline: 'Pasturas · Praderas · Jardines',
        title: 'Riego por Aspersión',
        description:
            'Sistemas para coberturas extensas, desde microaspersión hasta cañones de largo alcance. Diseñamos la red hidráulica completa y dimensionamos los equipos según presión, caudal y área.',
        tags: ['Aspersores rotativos', 'Microaspersión', 'Cañones de largo alcance'],
        photoDescription:
            'Aspersores en funcionamiento sobre pradera verde. Atardecer con luz dorada. Fondo con paisaje rural uruguayo abierto.',
        imageSlug: 'riego-aspersion',
        accentHex: '#06b6d4',
    },
    {
        icon: Gauge,
        overline: 'Pozos · Norias · Represas',
        title: 'Sistemas de Bombeo',
        description:
            'Instalación y puesta en marcha de bombas periféricas, sumergibles y de superficie. Calculamos el equipo correcto según profundidad, caudal requerido, altura manométrica y demanda energética.',
        tags: ['Bombas sumergibles', 'Bombas periféricas', 'Tableros eléctricos'],
        photoDescription:
            'Instalación de bomba sumergible junto al pozo con tablero eléctrico y cañerías de salida bien terminadas. Contexto rural, luz de día. Aspecto ordenado y profesional.',
        imageSlug: 'sistemas-bombeo',
        accentHex: '#64748b',
    },
    {
        icon: Timer,
        overline: 'Control inteligente del agua',
        title: 'Riego Automatizado',
        description:
            'Integramos controladores digitales y electroválvulas para que el riego funcione de forma autónoma en el horario y duración exacta que el cultivo necesita. Compatible con instalaciones existentes.',
        tags: ['Programadores digitales', 'Electroválvulas', 'Sensores de humedad'],
        photoDescription:
            'Tablero de control con programador digital y electroválvulas instalado en poste de madera en campo. Cableado prolijo, luz natural de día.',
        imageSlug: 'riego-automatizado',
        accentHex: '#6366f1',
    },
    {
        icon: Sun,
        overline: 'Sin costo de energía eléctrica',
        title: 'Bombeo Solar',
        description:
            'Sistemas de bombeo alimentados por energía solar fotovoltaica. Sin factura de luz ni generador a combustible. Ideales para campos sin red eléctrica, pozos lejanos y reservorios en zonas remotas.',
        tags: ['Paneles fotovoltaicos', 'Bombas DC/AC', 'Sin conexión a la red'],
        photoDescription:
            'Paneles solares instalados en campo abierto con bomba y depósito de agua visible al fondo. Cielo celeste claro, contexto rural uruguayo sin tendido eléctrico.',
        imageSlug: 'bombeo-solar',
        accentHex: '#f59e0b',
    },
    {
        icon: Database,
        overline: 'Represas · Cisternas · Tanques',
        title: 'Almacenamiento de Agua',
        description:
            'Diseño y construcción de soluciones de almacenamiento para garantizar disponibilidad hídrica en cualquier época, independientemente del caudal de la fuente o las precipitaciones.',
        tags: ['Represas con geomembrana', 'Cisternas soterradas', 'Tanques elevados'],
        photoDescription:
            'Represa impermeabilizada con geomembrana azul o negra en establecimiento rural. Vista lateral con agua clara y bordes bien terminados. Campo verde al fondo.',
        imageSlug: 'almacenamiento-agua',
        accentHex: '#14b8a6',
    },
    {
        icon: Leaf,
        overline: 'Tambos · Feedlots · Establecimientos',
        title: 'Instalaciones Ganaderas',
        description:
            'Redes de distribución, bebederos automáticos y sistemas de bombeo para establecimientos ganaderos y lecheros. Dimensionamos la demanda según carga animal, categoría y tasa de consumo.',
        tags: ['Bebederos automáticos', 'Redes de distribución', 'Bombeo para tambo'],
        photoDescription:
            'Bebederos automáticos de calidad con ganado bovino bebiendo. Cañerías de instalación visibles. Campo verde, luz de día.',
        imageSlug: 'instalaciones-ganaderia',
        accentHex: '#16a34a',
    },
    {
        icon: Shield,
        overline: 'Bioseguridad predial',
        title: 'Arcos Sanitarios',
        description:
            'Instalación de arcos de desinfección vehicular y pediluvios para establecimientos ganaderos, lecheros y avícolas. Dosificación automática y cumplimiento de protocolos sanitarios.',
        tags: ['Arcos vehiculares', 'Pediluvios automáticos', 'Dosificación integrada'],
        photoDescription:
            'Arco de desinfección vehicular de acero galvanizado en entrada de establecimiento ganadero. Vista frontal limpia, cielo celeste, sin elementos que distraigan.',
        imageSlug: 'arcos-sanitarios',
        accentHex: '#f97316',
    },
    {
        icon: Lightbulb,
        overline: 'Diagnóstico · Diseño · Presupuesto',
        title: 'Asesoramiento Técnico',
        description:
            'Si todavía no sabés qué necesitás, arrancamos por ahí. Analizamos tu situación, modelamos las alternativas posibles y presentamos un presupuesto detallado con materiales y mano de obra.',
        tags: ['Diagnóstico sin cargo', 'Planos hidráulicos', 'Presupuesto detallado'],
        photoDescription:
            'Técnico con casco y portapapeles revisando planos hidráulicos en campo, con vista al predio de fondo. Transmite profesionalismo y confianza técnica.',
        imageSlug: 'asesoramiento-tecnico',
        accentHex: '#8b5cf6',
    },
];

const N = SERVICES.length; // 9
const TRIPLED = [...SERVICES, ...SERVICES, ...SERVICES]; // 27 cards

interface Props {
    whatsappPhone: string;
}

export default function ServicesCarousel({ whatsappPhone }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    // Track which absolute index (0..26) we're on; start in middle set at index N
    const [activeIndex, setActiveIndex] = useState(N);
    const isTeleporting = useRef(false);
    const isNavigating = useRef(false);

    /* ─── Compute scrollLeft that centers a given absolute card ─── */
    const getScrollLeftForCard = useCallback((absoluteIdx: number): number => {
        const container = scrollRef.current;
        if (!container) return 0;
        const cards = container.querySelectorAll<HTMLElement>('[data-card]');
        const card = cards[absoluteIdx];
        if (!card) return 0;
        return card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
    }, []);

    /* ─── Init: silently jump to the middle set card N ─── */
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const init = () => {
            isTeleporting.current = true;
            container.scrollLeft = getScrollLeftForCard(N);
            // Release after one rAF so the scroll event we might fire doesn't trigger teleport
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    isTeleporting.current = false;
                });
            });
        };

        requestAnimationFrame(init);
    }, [getScrollLeftForCard]);

    /* ─── Scroll handler ─── */
    const handleScroll = useCallback(() => {
        if (isTeleporting.current) return;
        const container = scrollRef.current;
        if (!container) return;

        const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-card]'));
        const mid = container.scrollLeft + container.clientWidth / 2;

        let closest = N;
        let closestDist = Infinity;
        cards.forEach((card, idx) => {
            const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
            if (dist < closestDist) {
                closestDist = dist;
                closest = idx;
            }
        });

        setActiveIndex(closest);

        // Teleport at boundaries
        if (closest < N) {
            // Drifted into first copy → jump to middle copy
            isTeleporting.current = true;
            const target = cards[closest + N];
            if (target) {
                container.scrollLeft += target.offsetLeft - cards[closest].offsetLeft;
            }
            setActiveIndex(closest + N);
            setTimeout(() => { isTeleporting.current = false; }, 80);
        } else if (closest >= N * 2) {
            // Drifted into third copy → jump to middle copy
            isTeleporting.current = true;
            const target = cards[closest - N];
            if (target) {
                container.scrollLeft += target.offsetLeft - cards[closest].offsetLeft;
            }
            setActiveIndex(closest - N);
            setTimeout(() => { isTeleporting.current = false; }, 80);
        }
    }, []);

    /* ─── Navigate to display index (0..N-1), always via middle copy ─── */
    const goTo = useCallback(
        (displayIdx: number) => {
            const container = scrollRef.current;
            if (!container || isNavigating.current) return;
            const absoluteIdx = N + ((displayIdx % N) + N) % N;
            const targetLeft = getScrollLeftForCard(absoluteIdx);
            isNavigating.current = true;
            container.scrollTo({ left: targetLeft, behavior: 'smooth' });
            setActiveIndex(absoluteIdx);
            setTimeout(() => { isNavigating.current = false; }, 700);
        },
        [getScrollLeftForCard]
    );

    const displayIndex = activeIndex % N;

    const prev = () => goTo((displayIndex - 1 + N) % N);
    const next = () => goTo((displayIndex + 1) % N);

    return (
        <div className="relative">
            {/* ── Edge fade overlays (visual) ── */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-[calc(100%-52px)] w-16 sm:w-20 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-[calc(100%-52px)] w-16 sm:w-20 bg-gradient-to-l from-white to-transparent" />

            {/* ── Left arrow — floats over the track, vertically centered ── */}
            <div className="pointer-events-none absolute left-1.5 sm:left-3 top-0 z-20 flex h-[calc(100%-52px)] items-center">
                <button
                    onClick={prev}
                    aria-label="Servicio anterior"
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-all duration-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-lg active:scale-95"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </div>

            {/* ── Right arrow ── */}
            <div className="pointer-events-none absolute right-1.5 sm:right-3 top-0 z-20 flex h-[calc(100%-52px)] items-center">
                <button
                    onClick={next}
                    aria-label="Siguiente servicio"
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-all duration-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-lg active:scale-95"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* ── Scroll track ──
          px-14 (56px) on each side gives the arrows room without cards touching screen edges
      ── */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}
            >
                {TRIPLED.map((service, i) => {
                    const Icon = service.icon;
                    // Cards in the first and third copy are aria-hidden to screen readers
                    const isActiveSet = i >= N && i < N * 2;

                    return (
                        <article
                            key={i}
                            data-card=""
                            aria-hidden={!isActiveSet}
                            className="snap-center shrink-0 w-[72vw] sm:w-[280px] lg:w-[310px] bg-white rounded-[1.75rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300 group"
                        >
                            {/* ── Image ── */}
                            <div className="relative h-44 sm:h-48 shrink-0 overflow-hidden">
                                {/*
                 * ─────────────────────────────────────────────────────────────
                 * 📸 IMAGEN REQUERIDA
                 * Ruta: /public/assets/images/servicios/{service.imageSlug}.webp
                 * Descripción para el fotógrafo: {service.photoDescription}
                 *
                 * Cuando tengas la foto, eliminá el bloque de placeholder y
                 * descomentá:
                 *
                 * import Image from 'next/image';
                 * <Image
                 *   src={`/assets/images/servicios/${service.imageSlug}.webp`}
                 *   alt={service.title}
                 *   fill
                 *   className="object-cover group-hover:scale-105 transition-transform duration-700"
                 *   sizes="(max-width: 640px) 72vw, 310px"
                 * />
                 * ─────────────────────────────────────────────────────────────
                 */}

                                {/* PLACEHOLDER — remove when real photo is added */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                                    <div
                                        className="absolute inset-0 opacity-[0.05]"
                                        style={{
                                            backgroundImage:
                                                'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                                            backgroundSize: '20px 20px',
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.09]">
                                        <Icon className="h-20 w-20 text-white" />
                                    </div>
                                </div>

                                {/* Accent strip */}
                                <div
                                    className="absolute inset-x-0 top-0 z-10 h-[3px]"
                                    style={{ backgroundColor: service.accentHex }}
                                />

                                {/* Bottom scrim */}
                                <div className="absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-black/50 to-transparent" />

                                {/* Placeholder badge — remove when real photo is added */}
                                <div className="absolute bottom-2.5 left-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-slate-700/50 bg-slate-900/60 px-2 py-0.5 backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-400" />
                                    <span className="whitespace-nowrap font-dm-mono text-[8px] uppercase tracking-wider text-slate-400">
                                        foto pendiente
                                    </span>
                                </div>
                            </div>

                            {/* ── Content ── */}
                            <div className="flex flex-1 flex-col p-5">
                                <div className="mb-3 flex items-start gap-3">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                                        style={{ backgroundColor: service.accentHex }}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="mb-0.5 line-clamp-1 font-dm-mono text-[9px] uppercase tracking-[0.13em] text-slate-400">
                                            {service.overline}
                                        </p>
                                        <h3 className="font-barlow text-[1rem] font-bold leading-tight text-slate-900 transition-colors duration-200 group-hover:text-blue-700">
                                            {service.title}
                                        </h3>
                                    </div>
                                </div>

                                <p className="flex-grow text-[12.5px] leading-relaxed text-slate-500 mb-4">
                                    {service.description}
                                </p>

                                <div className="flex flex-wrap gap-1.5 mt-auto">
                                    {service.tags.map((tag, j) => (
                                        <span
                                            key={j}
                                            className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-medium text-slate-600"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* ── Dots ── */}
            <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Navegación de servicios">
                {SERVICES.map((s, i) => (
                    <button
                        key={i}
                        role="tab"
                        aria-selected={i === displayIndex}
                        aria-label={`Ir a: ${s.title}`}
                        onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-300 ${i === displayIndex
                            ? 'h-2 w-6 bg-blue-600'
                            : 'h-2 w-2 bg-slate-300 hover:bg-slate-400'
                            }`}
                    />
                ))}
            </div>

            {/* ── Counter ── */}
            <p className="mt-1.5 text-center font-dm-mono text-[10.5px] tabular-nums text-slate-400">
                {String(displayIndex + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </p>
        </div>
    );
}