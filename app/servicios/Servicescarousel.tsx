'use client';

import { useRef, useState, useCallback } from 'react';
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

/* ─────────────────────────────────────────────
   SERVICE DATA
   Each entry documents the required photo.
   Image path convention: /assets/images/servicios/{imageSlug}.webp
───────────────────────────────────────────── */
interface ServiceData {
    icon: React.ElementType;
    overline: string;
    title: string;
    description: string;
    tags: string[];
    /* Used in placeholder badge and code comments */
    photoDescription: string;
    imageSlug: string;
    accentClass: string;
    iconBg: string;
}

const services: ServiceData[] = [
    {
        icon: Droplets,
        overline: 'Horticultura · Frutales · Viñedos',
        title: 'Riego por Goteo',
        description:
            'Relevamiento de campo, diseño hidráulico y montaje completo. Optimizamos el uso del agua y los nutrientes adaptando cada instalación al suelo, cultivo y fuente hídrica disponible.',
        tags: ['Goteo superficial', 'Goteo subsuperficial', 'Fertirrigación'],
        photoDescription:
            'Vista aérea (drone) de líneas de goteo sobre viñedo o cultivo hortícola. Luz de amanecer o atardecer, color cálido. Transmite precisión y tecnología agrícola a escala.',
        imageSlug: 'riego-goteo',
        accentClass: 'bg-blue-500',
        iconBg: 'bg-blue-500',
    },
    {
        icon: CloudRain,
        overline: 'Pasturas · Praderas · Jardines',
        title: 'Riego por Aspersión',
        description:
            'Sistemas para coberturas extensas, desde microaspersión hasta cañones de largo alcance. Diseñamos la red hidráulica completa y dimensionamos los equipos según presión, caudal y área.',
        tags: ['Aspersores rotativos', 'Microaspersión', 'Cañones de largo alcance'],
        photoDescription:
            'Aspersores en pleno funcionamiento sobre pradera verde o campo de cultivo. Atardecer con luz cálida y dorada. Fondo con paisaje rural abierto de Uruguay.',
        imageSlug: 'riego-aspersion',
        accentClass: 'bg-cyan-500',
        iconBg: 'bg-cyan-500',
    },
    {
        icon: Gauge,
        overline: 'Pozos · Norias · Represas',
        title: 'Sistemas de Bombeo',
        description:
            'Instalación y puesta en marcha de bombas periféricas, sumergibles y de superficie. Calculamos el equipo correcto según profundidad, caudal requerido, altura manométrica y demanda energética.',
        tags: ['Bombas sumergibles', 'Bombas periféricas', 'Tableros eléctricos'],
        photoDescription:
            'Primer plano de instalación de bomba sumergible junto al pozo, con tablero eléctrico y cañerías de salida bien terminadas. Contexto rural, luz de día. Aspecto ordenado y profesional.',
        imageSlug: 'sistemas-bombeo',
        accentClass: 'bg-slate-500',
        iconBg: 'bg-slate-500',
    },
    {
        icon: Timer,
        overline: 'Control inteligente del agua',
        title: 'Automatización de Riego',
        description:
            'Integramos controladores digitales y electroválvulas para que el riego funcione de forma autónoma, en el horario y la duración exacta que tu cultivo necesita. Compatible con instalaciones existentes.',
        tags: ['Programadores digitales', 'Electroválvulas', 'Sensores de humedad'],
        photoDescription:
            'Tablero de control con programador digital y módulo de electroválvulas, instalado en poste de madera en campo. Ordenado, con cableado prolijo. Luz natural de día.',
        imageSlug: 'riego-automatizado',
        accentClass: 'bg-indigo-500',
        iconBg: 'bg-indigo-500',
    },
    {
        icon: Sun,
        overline: 'Sin costo de energía eléctrica',
        title: 'Bombeo Solar',
        description:
            'Sistemas de bombeo alimentados por energía solar fotovoltaica. Sin factura de luz ni generador a combustible. Ideales para campos sin red eléctrica, pozos lejanos y reservorios en zonas remotas.',
        tags: ['Paneles fotovoltaicos', 'Bombas DC/AC', 'Sin conexión a la red'],
        photoDescription:
            'Paneles solares instalados en campo abierto con bomba y depósito de agua visible al fondo. Cielo celeste claro. Contexto rural uruguayo, sin cables de tendido eléctrico visibles.',
        imageSlug: 'bombeo-solar',
        accentClass: 'bg-amber-500',
        iconBg: 'bg-amber-500',
    },
    {
        icon: Database,
        overline: 'Represas · Cisternas · Tanques',
        title: 'Almacenamiento de Agua',
        description:
            'Diseño y construcción de soluciones de almacenamiento para garantizar disponibilidad de agua en cualquier época del año, independientemente del caudal de la fuente o las precipitaciones.',
        tags: ['Represas con geomembrana', 'Cisternas soterradas', 'Tanques elevados'],
        photoDescription:
            'Represa impermeabilizada con geomembrana negra o azul en establecimiento rural. Vista lateral con agua clara y bordes bien terminados. Campo verde al fondo, cielo despejado.',
        imageSlug: 'almacenamiento-agua',
        accentClass: 'bg-teal-500',
        iconBg: 'bg-teal-500',
    },
    {
        icon: Leaf,
        overline: 'Tambos · Feedlots · Establecimientos',
        title: 'Instalaciones para Ganadería',
        description:
            'Redes de distribución de agua, bebederos automáticos y sistemas de bombeo para establecimientos ganaderos y lecheros. Calculamos la demanda según carga animal, categoría y tasa de consumo.',
        tags: ['Bebederos automáticos', 'Redes de distribución', 'Bombeo para tambo'],
        photoDescription:
            'Bebederos automáticos de calidad para ganado bovino con animales bebiendo. Se deben ver las cañerías enterradas o la instalación. Campo verde, luz de día.',
        imageSlug: 'instalaciones-ganaderia',
        accentClass: 'bg-emerald-600',
        iconBg: 'bg-emerald-600',
    },
    {
        icon: Shield,
        overline: 'Bioseguridad predial',
        title: 'Arcos Sanitarios',
        description:
            'Instalación de arcos de desinfección vehicular y pediluvios para establecimientos ganaderos, lecheros y avícolas. Dosificación automática y cumplimiento de protocolos sanitarios oficiales.',
        tags: ['Arcos vehiculares', 'Pediluvios automáticos', 'Dosificación integrada'],
        photoDescription:
            'Arco de desinfección vehicular de acero galvanizado en la entrada de establecimiento ganadero. Vista frontal limpia. Cielo celeste, sin otros elementos que distraigan.',
        imageSlug: 'arcos-sanitarios',
        accentClass: 'bg-orange-500',
        iconBg: 'bg-orange-500',
    },
    {
        icon: Lightbulb,
        overline: 'Diagnóstico · Diseño · Presupuesto',
        title: 'Asesoramiento Técnico',
        description:
            'Si todavía no sabés qué necesitás, arrancamos por ahí. Analizamos tu situación, modelamos las alternativas posibles y te presentamos un presupuesto detallado con materiales y mano de obra. Sin compromiso.',
        tags: ['Diagnóstico sin cargo', 'Planos hidráulicos', 'Presupuesto detallado'],
        photoDescription:
            'Técnico con casco y portapapeles revisando planos hidráulicos en campo, con vista al predio de fondo. Transmite profesionalismo, atención al detalle y confianza técnica.',
        imageSlug: 'asesoramiento-tecnico',
        accentClass: 'bg-violet-500',
        iconBg: 'bg-violet-500',
    },
];

interface Props {
    whatsappPhone: string;
}

export default function ServicesCarousel({ whatsappPhone }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    /* ── Track which card is centred ── */
    const handleScroll = useCallback(() => {
        const container = scrollRef.current;
        if (!container) return;
        const cards = Array.from(
            container.querySelectorAll<HTMLElement>('[data-service-card]')
        );
        const containerMid = container.scrollLeft + container.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, idx) => {
            const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - containerMid);
            if (dist < closestDist) {
                closestDist = dist;
                closest = idx;
            }
        });
        setActiveIndex(closest);
    }, []);

    /* ── Scroll to a specific card ── */
    const scrollToCard = useCallback(
        (index: number) => {
            const container = scrollRef.current;
            if (!container) return;
            const cards = Array.from(
                container.querySelectorAll<HTMLElement>('[data-service-card]')
            );
            const card = cards[index];
            if (!card) return;
            const containerRect = container.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            container.scrollTo({
                left: container.scrollLeft + cardRect.left - containerRect.left,
                behavior: 'smooth',
            });
            setActiveIndex(index);
        },
        []
    );

    const prev = () => scrollToCard(Math.max(0, activeIndex - 1));
    const next = () => scrollToCard(Math.min(services.length - 1, activeIndex + 1));

    return (
        <div>
            {/* ── Track ── */}
            <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pl-4 pr-4 sm:pl-8 sm:pr-8 lg:pl-12 lg:pr-12 pb-3"
                onScroll={handleScroll}
            >
                {services.map((service, i) => {
                    const Icon = service.icon;
                    return (
                        <article
                            key={i}
                            data-service-card=""
                            className="snap-start shrink-0 w-[82vw] sm:w-[340px] lg:w-[380px] bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                            {/* ── Image area ── */}
                            <div className="relative h-52 flex-shrink-0 overflow-hidden">
                                {/*
                 * ─────────────────────────────────────────────────────────────────
                 * 📸  IMAGEN REQUERIDA
                 * Ruta: /public/assets/images/servicios/{service.imageSlug}.webp
                 * Descripción: {service.photoDescription}
                 *
                 * Cuando tengas la foto, reemplazá el bloque de placeholder
                 * (el <div className="absolute inset-0 bg-gradient-to-br ...">)
                 * con el siguiente Image component:
                 *
                 * <Image
                 *   src={`/assets/images/servicios/${service.imageSlug}.webp`}
                 *   alt={service.title}
                 *   fill
                 *   className="object-cover group-hover:scale-105 transition-transform duration-700"
                 * />
                 * ─────────────────────────────────────────────────────────────────
                 */}

                                {/* PLACEHOLDER — remove when real photo is added */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900">
                                    <div
                                        className="absolute inset-0 opacity-[0.05]"
                                        style={{
                                            backgroundImage:
                                                'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                                            backgroundSize: '24px 24px',
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <Icon className="h-24 w-24 text-white" />
                                    </div>
                                </div>

                                {/* Accent stripe */}
                                <div className={`absolute top-0 inset-x-0 h-1 z-10 ${service.accentClass}`} />

                                {/* Bottom gradient overlay for when real photo is present */}
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent z-10" />

                                {/* Placeholder badge */}
                                <div className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-slate-900/70 backdrop-blur-sm border border-slate-700/60 px-2.5 py-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                                    <span className="text-[9px] font-dm-mono text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        foto pendiente
                                    </span>
                                </div>
                            </div>

                            {/* ── Content ── */}
                            <div className="flex flex-col flex-1 p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${service.iconBg} text-white shadow-sm`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.15em] leading-tight mb-1 truncate">
                                            {service.overline}
                                        </p>
                                        <h3 className="text-xl font-bold text-slate-900 font-barlow leading-tight group-hover:text-blue-700 transition-colors">
                                            {service.title}
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-5">
                                    {service.description}
                                </p>

                                <div className="flex flex-wrap gap-1.5">
                                    {service.tags.map((tag, j) => (
                                        <span
                                            key={j}
                                            className="inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    );
                })}

                {/* End spacer so last card doesn't butt against the edge */}
                <div className="shrink-0 w-4 sm:w-8 lg:w-12" aria-hidden="true" />
            </div>

            {/* ── Navigation ── */}
            <div className="mt-8 flex flex-col items-center gap-4">
                {/* Dots + arrows row */}
                <div className="flex items-center gap-5">
                    <button
                        onClick={prev}
                        disabled={activeIndex === 0}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Servicio anterior"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Dots */}
                    <div className="flex items-center gap-1.5" role="tablist" aria-label="Navegación del carrusel">
                        {services.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => scrollToCard(i)}
                                role="tab"
                                aria-selected={i === activeIndex}
                                aria-label={`${s.title}`}
                                className={`rounded-full transition-all duration-300 ${i === activeIndex
                                    ? 'w-6 h-2 bg-blue-600'
                                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={next}
                        disabled={activeIndex === services.length - 1}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Siguiente servicio"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* Counter */}
                <p className="text-xs font-dm-mono text-slate-400 tabular-nums">
                    {String(activeIndex + 1).padStart(2, '0')} /{' '}
                    {String(services.length).padStart(2, '0')}
                </p>
            </div>
        </div>
    );
}