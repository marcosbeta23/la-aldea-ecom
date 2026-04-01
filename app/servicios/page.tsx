import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import {
    MessageCircle,
    CheckCircle,
    ChevronRight,
    Phone,
    ClipboardList,
    HardHat,
    Headphones,
    ArrowDown,
} from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '@/lib/constants';
import ServicesCarousel from './ServicesCarousel';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

/* ─────────────────────────────────────────────
   SEO METADATA
───────────────────────────────────────────── */
export const metadata: Metadata = {
    title: 'Servicios de Riego, Bombeo y Soluciones Hídricas | La Aldea',
    description:
        'Diseño e instalación de sistemas de riego por goteo, aspersión, bombeo, energía solar, almacenamiento de agua, instalaciones ganaderas y arcos sanitarios. Todo Uruguay. Presupuesto sin cargo.',
    openGraph: {
        title: 'Servicios de Riego, Bombeo y Soluciones Hídricas | La Aldea',
        description:
            'Diseño e instalación de sistemas de riego por goteo, aspersión, bombeo, energía solar, almacenamiento de agua, instalaciones ganaderas y arcos sanitarios. Todo Uruguay.',
        type: 'website',
        url: `${siteUrl}/servicios`,
    },
    alternates: { canonical: `${siteUrl}/servicios` },
    keywords: [
        'instalación de riego Uruguay',
        'sistema de riego por goteo Uruguay',
        'servicio bombeo de agua Uruguay',
        'arcos sanitarios Uruguay',
        'energía solar rural Uruguay',
        'riego automatizado Uruguay',
        'instalación bomba de agua',
        'sistemas hídricos rurales Uruguay',
        'bebederos automáticos ganado Uruguay',
        'almacenamiento de agua rural',
        'represas impermeabilizadas Uruguay',
        'riego por aspersión Uruguay',
    ],
};

/* ─────────────────────────────────────────────
   STRUCTURED DATA — LocalBusiness + Services
   Uruguay-wide, not city-specific
───────────────────────────────────────────── */
const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${siteUrl}/#business`,
    name: 'La Aldea',
    url: siteUrl,
    logo: `${siteUrl}/assets/images/logo.webp`,
    image: `${siteUrl}/assets/images/og-image.webp`,
    telephone: `+${WHATSAPP_PHONE}`,
    email: 'contacto@laaldeatala.com.uy',
    foundingDate: '1999',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'José Alonso y Trelles y Av Artigas',
        addressLocality: 'Tala',
        addressRegion: 'Canelones',
        postalCode: '91800',
        addressCountry: 'UY',
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: -34.346943768995686,
        longitude: -55.76359424741334,
    },
    areaServed: { '@type': 'Country', name: 'Uruguay' },
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios de Riego, Bombeo y Soluciones Hídricas',
        itemListElement: [
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Diseño e Instalación de Riego por Goteo',
                    description:
                        'Relevamiento, diseño hidráulico y montaje de sistemas de riego por goteo para horticultura, fruticultura y viñedos en Uruguay.',
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Riego por Aspersión y Microaspersión',
                    description: 'Diseño e instalación de sistemas de aspersión para pasturas, praderas y grandes superficies.',
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Instalación de Sistemas de Bombeo',
                    description: 'Instalación y puesta en marcha de bombas periféricas, sumergibles y de superficie en todo Uruguay.',
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Automatización de Riego',
                    description: 'Instalación de controladores digitales y electroválvulas para riego automático.',
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Bombeo Solar Fotovoltaico',
                    description: 'Sistemas de bombeo alimentados por energía solar para campos sin red eléctrica.',
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Almacenamiento de Agua — Represas y Cisternas',
                    description: 'Construcción de represas con geomembrana, cisternas soterradas y tanques elevados.',
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Instalaciones para Ganadería',
                    description: 'Bebederos automáticos, redes de distribución y bombeo para tambos y feedlots.',
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Arcos Sanitarios de Desinfección',
                    description: 'Instalación de arcos vehiculares y pediluvios para bioseguridad predial.',
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Asesoramiento Técnico Hídrico',
                    description: 'Consultoría sin cargo para diseño y dimensionamiento de proyectos hídricos rurales.',
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
        ],
    },
};

/* ─────────────────────────────────────────────
   PAGE DATA
───────────────────────────────────────────── */
const processSteps = [
    {
        icon: MessageCircle,
        step: '01',
        title: 'Consulta inicial',
        description:
            'Contanos tu proyecto por WhatsApp o teléfono: tipo de cultivo o uso, superficie, fuente de agua disponible. Respondemos en el día.',
    },
    {
        icon: ClipboardList,
        step: '02',
        title: 'Relevamiento técnico',
        description:
            'Analizamos tu información (planos, fotos, mediciones) y calculamos caudales, presiones y materiales necesarios. Si hace falta, coordinamos visita al predio.',
    },
    {
        icon: HardHat,
        step: '03',
        title: 'Instalación profesional',
        description:
            'Realizamos el montaje completo con materiales de primer nivel. Sin atajos ni improvisaciones. Entregamos el sistema funcionando.',
    },
    {
        icon: Headphones,
        step: '04',
        title: 'Soporte post-instalación',
        description:
            'Seguimos disponibles una vez terminado el trabajo. Si algo no funciona como se acordó o surge un inconveniente, nos hacemos cargo.',
    },
];

const differentiators = [
    {
        title: 'Honestidad técnica, siempre',
        description:
            'Te recomendamos lo que realmente necesitás, aunque eso signifique una solución más simple y económica. No somos una empresa que vende por vender.',
    },
    {
        title: 'Materiales líderes del mercado',
        description:
            'Trabajamos exclusivamente con marcas seleccionadas por su desempeño, durabilidad y respaldo técnico. No instalamos lo que no garantizamos.',
    },
    {
        title: 'Servicio completo, sin excusas',
        description:
            'No vendemos materiales y te dejamos solo. Instalamos, ponemos en marcha y quedamos disponibles. El proyecto termina cuando el sistema funciona.',
    },
    {
        title: '25 años de trayectoria en Uruguay',
        description:
            'Décadas resolviendo proyectos hídricos en todo el país nos dieron algo que no se aprende en el aula: el conocimiento real de los suelos y las condiciones de trabajo.',
    },
];

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default function ServiciosPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />

            <Header />

            <main className="min-h-screen bg-slate-50">

                {/* ══════════════════════════════════════════
            HERO
            ═══════════════════════════════════════ */}
                <section
                    id="hero"
                    className="relative flex min-h-[88vh] items-end overflow-hidden bg-slate-900"
                >
                    {/*
           * ─────────────────────────────────────────────────────────────────────
           * 📸  IMAGEN DE FONDO — HERO PRINCIPAL
           * Ruta: /public/assets/images/servicios/hero-servicios.webp
           *
           * TIPO DE FOTO RECOMENDADA:
           * Vista aérea (drone) de campos irrigados en Uruguay. Opciones:
           *   → Viñedo con sistema de riego activo al amanecer (luz dorada)
           *   → Cultivo extensivo con aspersores en funcionamiento
           *   → Panorámica de establecimiento rural con represa visible al fondo
           * El tono debe ser épico y de escala. Evitar fotos genéricas de internet.
           *
           * Cuando tengas la foto, descomentá el bloque Image y eliminá
           * el div de placeholder debajo:
           *
           * import Image from 'next/image';
           *
           * <Image
           *   src="/assets/images/servicios/hero-servicios.webp"
           *   alt="Sistemas de riego instalados en campo uruguayo — La Aldea"
           *   fill
           *   priority
           *   className="object-cover object-center opacity-30"
           * />
           * ─────────────────────────────────────────────────────────────────────
           */}

                    {/* PLACEHOLDER BG — eliminar cuando se agregue la foto real */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-900" />
                        <div
                            className="absolute inset-0 opacity-[0.035]"
                            style={{
                                backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)',
                                backgroundSize: '48px 48px',
                            }}
                        />
                        {/* Atmospheric glows */}
                        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />
                    </div>

                    {/* Photo-pending badge — remove when real image is added */}
                    <div className="absolute top-20 right-4 md:top-24 md:right-6 z-30 inline-flex items-center gap-1.5 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 px-3 py-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[9px] font-dm-mono text-slate-400 uppercase tracking-wider">
                            foto pendiente — hero
                        </span>
                    </div>

                    {/* Gradient ramp for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent pointer-events-none" />

                    {/* Hero content */}
                    <div className="relative z-10 container mx-auto px-4 pb-16 pt-40 lg:pb-24 lg:pt-52">
                        {/* Overline badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 backdrop-blur-sm px-4 py-1.5 mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                            <span className="text-[11px] font-dm-mono font-medium text-blue-300 tracking-[0.2em] uppercase">
                                Instalación · Diseño · Asesoramiento Técnico
                            </span>
                        </div>

                        {/* Main headline */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-fraunces font-bold text-white leading-[0.95] tracking-tight max-w-4xl">
                            Soluciones{' '}
                            <span className="text-blue-400">Hídricas</span>
                            <br />
                            <span className="italic text-slate-300">a Escala Nacional.</span>
                        </h1>

                        <p className="mt-8 text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed font-light">
                            De la consulta inicial al proyecto terminado. Diseñamos e instalamos sistemas de riego,
                            bombeo, energía solar y almacenamiento de agua en todo Uruguay — con 25 años de
                            experiencia técnica que nos respaldan.
                        </p>

                        {/* CTAs */}
                        <div className="mt-10 flex flex-wrap gap-4 items-center">
                            <a
                                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20quiero%20consultar%20sobre%20un%20servicio%20de%20instalaci%C3%B3n...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 rounded-2xl bg-green-500 px-7 py-4 font-bold text-white shadow-[0_8px_30px_rgba(34,197,94,0.25)] hover:bg-green-400 hover:shadow-[0_12px_40px_rgba(34,197,94,0.35)] transition-all duration-300 active:scale-[0.98]"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Consultar sin cargo
                            </a>
                            <a
                                href="#servicios"
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-7 py-4 font-semibold text-white hover:border-white/30 hover:bg-white/10 transition-all duration-300"
                            >
                                Ver servicios
                                <ArrowDown className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            STATS STRIP
            ═══════════════════════════════════════ */}
                <section className="bg-white border-b border-slate-200">
                    <div className="container mx-auto px-4 py-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-slate-200 rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
                            {[
                                { value: '25+', label: 'Años de experiencia' },
                                { value: '9', label: 'Tipos de servicio' },
                                { value: 'Uruguay', label: 'Cobertura completa' },
                                { value: 'Sin cargo', label: 'Consulta y presupuesto' },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center justify-center py-6 px-4 text-center bg-white"
                                >
                                    <p className="text-2xl md:text-3xl font-bold text-blue-600 font-barlow">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            SERVICES CAROUSEL
            ═══════════════════════════════════════ */}
                <section id="servicios" className="py-16 lg:py-24 bg-white">
                    <div className="container mx-auto px-4 mb-10">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-[11px] font-dm-mono font-medium text-blue-700 tracking-[0.2em] uppercase">
                                    Lo que hacemos
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-barlow font-bold text-slate-900 leading-tight">
                                Servicios de instalación
                                <br />
                                <span className="text-blue-600">para cualquier proyecto hídrico.</span>
                            </h2>
                            <p className="mt-4 text-slate-500 text-lg leading-relaxed">
                                No vendemos materiales y te dejamos solo. Relevamos, diseñamos, instalamos y quedamos
                                disponibles. Deslizá para explorar los nueve servicios que ofrecemos.
                            </p>
                        </div>
                    </div>

                    {/* Carousel — full width, bleeds past container padding */}
                    <ServicesCarousel whatsappPhone={WHATSAPP_PHONE} />
                </section>

                {/* ══════════════════════════════════════════
            HOW WE WORK — dark section
            ═══════════════════════════════════════ */}
                <section className="bg-slate-900 py-16 lg:py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-14">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <span className="text-[11px] font-dm-mono font-medium text-slate-400 tracking-[0.2em] uppercase">
                                    Proceso
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-barlow font-bold text-white leading-tight">
                                Simple y sin burocracia.
                            </h2>
                            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
                                Desde la primera consulta hasta que el agua fluye exactamente donde necesitás.
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
                            {processSteps.map((step, i) => {
                                const Icon = step.icon;
                                return (
                                    <div
                                        key={i}
                                        className="relative bg-slate-800/60 border border-slate-700/50 rounded-[2rem] p-6 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300"
                                    >
                                        {/* Connector — desktop */}
                                        {i < processSteps.length - 1 && (
                                            <div className="hidden lg:block absolute top-10 -right-2.5 w-5 h-px bg-slate-600 z-10" />
                                        )}

                                        <span className="block font-dm-mono text-5xl font-bold text-slate-700 mb-4 leading-none select-none">
                                            {step.step}
                                        </span>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 mb-4">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-white mb-2 font-barlow text-lg">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CTA inside dark section */}
                        <div className="text-center mt-12">
                            <a
                                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20quiero%20empezar%20una%20consulta%20t%C3%A9cnica...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 rounded-2xl bg-green-500 px-8 py-4 font-bold text-white hover:bg-green-400 transition-all duration-300 shadow-[0_8px_30px_rgba(34,197,94,0.2)]"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Empezar ahora por WhatsApp
                            </a>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            COVERAGE + WHY US — two-column
            ═══════════════════════════════════════ */}
                <section className="py-16 lg:py-24 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-start">

                            {/* ─── COVERAGE ─── */}
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 mb-5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-[11px] font-dm-mono font-medium text-blue-700 tracking-[0.2em] uppercase">
                                        Cobertura
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-barlow font-bold text-slate-900 leading-tight mb-5">
                                    Donde esté tu proyecto,
                                    <br />
                                    <span className="text-blue-600">llegamos.</span>
                                </h2>

                                <p className="text-slate-600 leading-relaxed mb-8">
                                    25 años trabajando en todo el territorio nacional nos dieron algo que no se aprende
                                    en el aula: el conocimiento real de los suelos, los cultivos y las condiciones
                                    hídricas de Uruguay. La distancia no es un obstáculo — es simplemente logística.
                                </p>

                                {/*
                 * ─────────────────────────────────────────────────────────────────
                 * 📸  IMAGEN OPCIONAL — COBERTURA
                 * Ruta: /public/assets/images/servicios/mapa-cobertura.webp
                 *
                 * TIPO: Mapa ilustrativo de Uruguay con puntos marcados en distintos
                 * departamentos donde han instalado proyectos. Puede ser una captura
                 * de Google Maps con pines, o un diseño simple con el contorno del
                 * país y puntos de instalación. Refuerza la cobertura nacional.
                 *
                 * Alternativamente: foto representativa de un proyecto en el interior
                 * del país (campo abierto, sin referencia a ciudad específica).
                 * ─────────────────────────────────────────────────────────────────
                 */}

                                <div className="space-y-3">
                                    {[
                                        {
                                            label: 'Relevamiento en cualquier departamento',
                                            sub: 'Coordinamos la visita al predio sin importar la ubicación.',
                                        },
                                        {
                                            label: 'Materiales enviados a los 19 departamentos',
                                            sub: 'Embalaje especializado para cada tipo de producto.',
                                        },
                                        {
                                            label: 'Soporte remoto y presencial post-instalación',
                                            sub: 'Seguimos disponibles después del trabajo terminado.',
                                        },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4 bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm"
                                        >
                                            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                                                <p className="text-sm text-slate-500 mt-0.5">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                                    <p className="text-sm text-slate-600">
                                        <strong className="text-blue-700">¿Solo necesitás los materiales?</strong>{' '}
                                        Los enviamos a todo el país con embalaje adecuado para cada tipo de equipo.{' '}
                                        <Link href="/productos" className="text-blue-600 hover:underline font-semibold">
                                            Explorar catálogo →
                                        </Link>
                                    </p>
                                </div>
                            </div>

                            {/* ─── WHY US ─── */}
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 mb-5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-[11px] font-dm-mono font-medium text-blue-700 tracking-[0.2em] uppercase">
                                        Por qué elegirnos
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-barlow font-bold text-slate-900 leading-tight mb-8">
                                    Técnica con{' '}
                                    <span className="text-blue-600">honestidad.</span>
                                </h2>

                                <div className="space-y-4">
                                    {differentiators.map((item, i) => (
                                        <div
                                            key={i}
                                            className="group bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 mt-0.5">
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 mb-1.5">{item.title}</h3>
                                                    <p className="text-sm text-slate-500 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            TESTIMONIAL / REINFORCEMENT QUOTE
            ═══════════════════════════════════════ */}
                <section className="py-16 lg:py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            {/*
               * ─────────────────────────────────────────────────────────────────
               * 📸  IMAGEN OPCIONAL — SECCIÓN DE TESTIMONIO
               * Ruta: /public/assets/images/servicios/instalacion-campo.webp
               *
               * TIPO: Foto de una instalación real terminada — sistema de goteo,
               * represa, bomba solar, o similar. Debe transmitir trabajo bien hecho,
               * prolijo y profesional. Puede aparecer como fondo con overlay oscuro
               * (opacity ~30-40%) o como imagen al costado del texto.
               *
               * Alternativa válida: foto del técnico/instalador en campo.
               * ─────────────────────────────────────────────────────────────────
               */}

                            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-blue-950 p-10 md:p-14 overflow-hidden">
                                {/* Background pattern */}
                                <div
                                    className="absolute inset-0 opacity-[0.04]"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)',
                                        backgroundSize: '32px 32px',
                                    }}
                                />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

                                {/* Decorative quote mark */}
                                <span
                                    className="absolute top-6 left-8 text-[8rem] font-fraunces text-blue-400/15 leading-none select-none"
                                    aria-hidden="true"
                                >
                                    "
                                </span>

                                <div className="relative z-10">
                                    <blockquote className="text-2xl md:text-3xl font-fraunces font-bold text-white leading-snug max-w-2xl">
                                        La diferencia no está en lo que vendemos.
                                        Está en lo que recomendamos cuando podrías
                                        comprar menos.
                                    </blockquote>
                                    <p className="mt-6 text-blue-300 text-sm font-medium uppercase tracking-widest font-dm-mono">
                                        — Martín Betancor, La Aldea desde 1999
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            MAIN CTA — WHATSAPP
            ═══════════════════════════════════════ */}
                <section className="py-16 lg:py-20 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-[2.5rem] shadow-[0_20px_60px_rgba(34,197,94,0.15)] hover:shadow-[0_30px_70px_rgba(34,197,94,0.25)] transition-all duration-500">
                                {/* Glow effects */}
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/15 blur-[100px] rounded-full pointer-events-none" />
                                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-400/15 blur-[80px] rounded-full pointer-events-none" />

                                <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 mb-5">
                                            <span className="flex h-1.5 w-1.5 rounded-full bg-green-200 animate-pulse" />
                                            <span className="text-[10px] font-dm-mono text-green-100 tracking-[0.2em] uppercase">
                                                Presupuesto sin cargo
                                            </span>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-barlow font-bold text-white leading-tight">
                                            Hablemos de tu proyecto.
                                        </h2>
                                        <p className="mt-3 text-green-50/90 text-lg leading-relaxed max-w-lg">
                                            Contanos qué necesitás: tipo de cultivo, superficie, fuente de agua o el
                                            problema que estás tratando de resolver. Te respondemos en minutos.
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-5 text-sm text-green-100">
                                            <span className="flex items-center gap-2">
                                                <MessageCircle className="h-4 w-4" />
                                                WhatsApp directo
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                {WHATSAPP_DISPLAY}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        <a
                                            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20quiero%20consultar%20sobre%20un%20servicio%20de%20instalaci%C3%B3n%20h%C3%ADdrica...`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4.5 font-bold text-green-700 shadow-xl hover:bg-green-50 transition-all duration-300 active:scale-[0.98] whitespace-nowrap text-base"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            Pedir presupuesto
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            SECONDARY NAV
            ═══════════════════════════════════════ */}
                <section className="py-10 bg-white border-t border-slate-200">
                    <div className="container mx-auto px-4">
                        <p className="text-center text-xs font-dm-mono text-slate-400 uppercase tracking-widest mb-6">
                            También puede interesarte
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center flex-wrap">
                            <Link
                                href="/productos"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all"
                            >
                                Catálogo completo de productos <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all"
                            >
                                Guías técnicas de instalación <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/contacto"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all"
                            >
                                Todas las formas de contacto <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
        </>
    );
}