import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import {
    MessageCircle,
    CheckCircle,
    ChevronRight,
    Phone,
    ClipboardList,
    HardHat,
    Headphones,
    ArrowDown,
    Calculator,
    Star,
    Globe,
    LifeBuoy,
} from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '@/lib/constants';
import ServicesCarousel from '@/components/services/ServicesCarousel';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

/* ─────────────────────────────────────────────
   SEO METADATA
───────────────────────────────────────────── */
export const metadata: Metadata = {
    title: 'Servicios de Riego, Bombeo y Soluciones Hídricas',
    description:
        'Diseño e instalación de riego por goteo, aspersión, bombeo y energía solar en todo Uruguay. Relevamiento técnico y presupuesto sin cargo.',
    openGraph: {
        title: 'Servicios de Riego, Bombeo y Soluciones Hídricas | La Aldea',
        description:
            'Diseño e instalación de riego por goteo, aspersión, bombeo y energía solar en todo Uruguay. Relevamiento técnico y presupuesto sin cargo.',
        type: 'website',
        url: `${siteUrl}/servicios`,
        images: [
            {
                url: `${siteUrl}/assets/images/og-image.webp`,
                width: 1200,
                height: 630,
                alt: 'La Aldea — Tala, Uruguay',
            },
        ],
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
            'Diseño e Instalación de Riego por Goteo',
            'Riego por Aspersión y Microaspersión',
            'Instalación de Sistemas de Bombeo',
            'Automatización de Riego',
            'Bombeo Solar Fotovoltaico',
            'Almacenamiento de Agua — Represas y Cisternas',
            'Instalaciones Ganaderas',
            'Arcos Sanitarios de Desinfección',
            'Asesoramiento Técnico Hídrico',
        ].map((name) => ({
            '@type': 'Offer',
            itemOffered: {
                '@type': 'Service',
                name,
                areaServed: { '@type': 'Country', name: 'Uruguay' },
            },
        })),
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
        title: 'Instalación',
        description:
            'Realizamos el montaje completo con materiales de primer nivel. Entregamos el sistema en marcha, verificado y documentado.',
    },
    {
        icon: Headphones,
        step: '04',
        title: 'Soporte técnico',
        description:
            'Proveemos asistencia post-instalación, gestión de garantías y repuestos de los equipos que instalamos.',
    },
];

const differentiators = [
    {
        icon: Calculator,
        badge: 'Ingeniería',
        title: 'Diseño hidráulico propio',
        description:
            'Calculamos caudales, presiones y diámetros de cañería para cada proyecto antes de seleccionar un equipo. El dimensionamiento correcto define el resultado a largo plazo.',
    },
    {
        icon: Star,
        badge: 'Materiales',
        title: 'Equipos de primer nivel',
        description:
            'Seleccionamos y garantizamos cada componente que instalamos. Trabajamos exclusivamente con marcas líderes del mercado, verificadas por su desempeño en las condiciones del Uruguay.',
    },
    {
        icon: Globe,
        badge: 'Trayectoria',
        title: '25 años. Más de 500 proyectos.',
        description:
            'Agricultura, ganadería, industria y uso doméstico en todo el país. La experiencia acumulada en campo es parte del servicio que entregamos con cada proyecto.',
    },
    {
        icon: LifeBuoy,
        badge: 'Post-instalación',
        title: 'Soporte técnico extendido',
        description:
            'Gestionamos garantías, suministramos repuestos y brindamos asistencia técnica después de la entrega del proyecto. El vínculo no termina con la instalación.',
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

                <HeroSection className="relative w-full flex flex-col overflow-hidden touch-pan-y bg-slate-900">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/assets/images/services/hero-servicios.avif"
                            alt="Sistemas de riego instalados en campo uruguayo"
                            fill
                            priority
                            fetchPriority="high"
                            sizes="100vw"
                            quality={55}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-[#050b14]/90 via-[#050b14]/70 to-[#050b14]/25" />
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-3/4 bg-linear-to-t from-[#050b14]/95 via-[#050b14]/30 to-transparent" />

                    <div className="relative z-20 flex flex-1 flex-col justify-end pb-10 pt-24 sm:pb-12 sm:pt-28 lg:pb-16 lg:pt-32">
                        <div className="container mx-auto px-4">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                                <span className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.2em] text-blue-300">
                                    Instalación · Diseño · Asesoramiento
                                </span>
                            </div>
                            <div className="max-w-4xl">
                                <p className="mb-3 font-dm-mono text-[10px] uppercase tracking-[0.24em] text-slate-300/85 sm:text-[11px]">
                                    Soluciones profesionales en todo Uruguay
                                </p>
                                <h1 className="font-epilogue text-[clamp(2.2rem,7vw,4.8rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-white">
                                    <span className="block">Riego e Ingeniería</span>
                                    <span className="block bg-linear-to-r from-blue-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                                        Hidráulica
                                    </span>
                                    <span className="mt-1 block text-[clamp(1.15rem,2.9vw,2rem)] font-semibold tracking-[0.02em] text-slate-200">
                                        Diseño, instalación y puesta en marcha.
                                    </span>
                                </h1>
                            </div>

                            <p className="mt-5 max-w-lg text-[15px] font-light leading-snug text-slate-300 sm:text-[17px]">
                                Instalamos, diseñamos y ponemos en marcha sistemas hídricos en todo Uruguay.
                                25 años de trayectoria nos respaldan.
                            </p>

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <a
                                    href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20quiero%20consultar%20sobre%20un%20servicio%20de%20instalaci%C3%B3n...`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 font-epilogue font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(37,99,235,0.45)] active:scale-[0.98]"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Consultar instalación
                                </a>
                                <a
                                    href="#servicios"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-6 py-3.5 font-epilogue font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/12"
                                >
                                    Ver servicios
                                    <ArrowDown className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-20 mb-4 flex flex-col items-center gap-1">
                        <span className="font-dm-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                            Deslizá para descubrir
                        </span>
                        <ChevronRight className="h-4 w-4 rotate-90 animate-bounce text-white/50" />
                    </div>
                </HeroSection>

                <section className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto px-4 py-5">
                        <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 overflow-hidden rounded-[1.75rem] border border-slate-200 shadow-sm md:grid-cols-4 md:divide-y-0">
                            {[
                                { value: '25+', label: 'Años de experiencia' },
                                { value: '9', label: 'Tipos de servicio' },
                                { value: 'Uruguay', label: 'Cobertura completa' },
                                { value: 'Sin cargo', label: 'Consulta y presupuesto' },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center justify-center bg-white px-4 py-5 text-center">
                                    <p className="font-barlow text-2xl font-bold text-blue-600 md:text-3xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="servicios" className="bg-white py-16 lg:py-20">
                    <div className="container mx-auto px-4 mb-8">
                        <div className="max-w-3xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-blue-700">
                                    Lo que hacemos
                                </span>
                            </div>
                            <h2 className="font-barlow text-3xl font-bold leading-tight text-slate-900 md:text-4xl lg:text-5xl">
                                Servicios de instalación
                                <br />
                                <span className="text-blue-600">para cualquier proyecto hídrico.</span>
                            </h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-500 lg:text-lg">
                                Relevamos, diseñamos, instalamos y quedamos disponibles.
                                Deslizá para explorar los nueve servicios que ofrecemos.
                            </p>
                        </div>
                    </div>

                    {/* Carousel — full width, bleeds past container padding */}
                    <div className="pb-6 sm:pb-8 lg:pb-10">
                        <ServicesCarousel whatsappPhone={WHATSAPP_PHONE} />
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            HOW WE WORK — dark section
            ═══════════════════════════════════════ */}
                <section className="bg-slate-900 py-16 lg:py-20">
                    <div className="container mx-auto px-4">

                        <div className="mb-12 text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-slate-400">
                                    Proceso
                                </span>
                            </div>
                            <h2 className="font-barlow text-3xl font-bold text-white md:text-4xl">
                                Cómo trabajamos.
                            </h2>
                            <p className="mt-3 mx-auto max-w-xl text-slate-400">
                                Del primer contacto al sistema en marcha, sin intermediarios ni subcontratistas.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
                            {processSteps.map((step, i) => {
                                const Icon = step.icon;
                                return (
                                    <div
                                        key={i}
                                        className="relative rounded-[1.75rem] border border-slate-700/50 bg-slate-800/60 p-6 hover:border-slate-600 hover:bg-slate-800 transition-all duration-300"
                                    >
                                        {/* Desktop connector */}
                                        {i < processSteps.length - 1 && (
                                            <div className="absolute right-0 top-[2.5rem] hidden w-4 translate-x-full border-t border-dashed border-slate-700 lg:block" />
                                        )}
                                        <span className="mb-4 block font-dm-mono text-5xl font-bold leading-none text-slate-700 select-none">
                                            {step.step}
                                        </span>
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-barlow text-lg font-bold text-white mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-slate-400">
                                            {step.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-10 text-center">
                            <a
                                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20quiero%20consultar%20sobre%20un%20servicio%20de%20instalaci%C3%B3n...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 rounded-2xl bg-green-500 px-8 py-4 font-bold text-white shadow-[0_8px_30px_rgba(34,197,94,0.2)] hover:bg-green-400 transition-all duration-300"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Empezar una consulta
                            </a>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            DIFFERENTIATORS + COVERAGE — two columns
            ═══════════════════════════════════════ */}
                <section className="bg-slate-50 py-16 lg:py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">

                            {/* ─── Differentiators ─── */}
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-blue-700">
                                        Diferencial técnico
                                    </span>
                                </div>

                                <h2 className="font-barlow text-3xl font-bold leading-tight text-slate-900 md:text-4xl mb-8">
                                    Por qué La Aldea.
                                </h2>

                                <div className="space-y-4">
                                    {differentiators.map((item, i) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={i}
                                                className="group flex items-start gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm hover:border-blue-100 hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 mt-0.5">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-dm-mono text-[9px] uppercase tracking-[0.13em] text-blue-400 mb-1">
                                                        {item.badge}
                                                    </p>
                                                    <h3 className="font-bold text-slate-900 mb-1.5">{item.title}</h3>
                                                    <p className="text-sm leading-relaxed text-slate-500">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ─── Coverage ─── */}
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-blue-700">
                                        Cobertura
                                    </span>
                                </div>

                                <h2 className="font-barlow text-3xl font-bold leading-tight text-slate-900 md:text-4xl mb-4">
                                    Donde esté tu proyecto,
                                    <br />
                                    <span className="text-blue-600">llegamos.</span>
                                </h2>

                                <p className="text-slate-600 leading-relaxed mb-7">
                                    Décadas de trabajo en todo el territorio nacional nos dieron el conocimiento real
                                    de los suelos, los cultivos y las condiciones hídricas del Uruguay. La distancia
                                    es simplemente logística.
                                </p>

                                {/*
                 * ─────────────────────────────────────────────────────────────
                 * 📸 IMAGEN OPCIONAL — COBERTURA
                 * Ruta: /public/assets/images/servicios/cobertura.webp
                 *
                 * TIPO: Foto representativa de un proyecto terminado en el
                 * interior del país — campo abierto, sin referencia a ciudad
                 * específica. O mapa ilustrativo de Uruguay con puntos de
                 * instalación marcados.
                 *
                 * import Image from 'next/image';
                 * <div className="mb-7 aspect-video overflow-hidden rounded-2xl">
                 *   <Image
                 *     src="/assets/images/servicios/cobertura.webp"
                 *     alt="Proyectos de riego en todo Uruguay — La Aldea"
                 *     width={700}
                 *     height={400}
                 *     className="h-full w-full object-cover"
                 *   />
                 * </div>
                 * ─────────────────────────────────────────────────────────────
                 */}

                                <div className="space-y-3 mb-6">
                                    {[
                                        {
                                            title: 'Relevamiento en cualquier departamento',
                                            sub: 'Coordinamos la visita al predio sin importar la ubicación.',
                                        },
                                        {
                                            title: 'Materiales enviados a los 19 departamentos',
                                            sub: 'Embalaje especializado para cada tipo de equipo y producto.',
                                        },
                                        {
                                            title: 'Soporte remoto y presencial post-instalación',
                                            sub: 'Asistencia técnica disponible después de la entrega del proyecto.',
                                        },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4 rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm"
                                        >
                                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                                <p className="mt-0.5 text-sm text-slate-500">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Materials-only callout */}
                                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                    <p className="text-sm text-slate-600">
                                        <strong className="text-blue-700">¿Solo necesitás los materiales?</strong>{' '}
                                        Enviamos a todo el país con embalaje adecuado para cada tipo de equipo.{' '}
                                        <Link href="/productos" className="font-semibold text-blue-600 hover:underline">
                                            Explorar catálogo →
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            MAIN CTA — WHATSAPP
            ═══════════════════════════════════════ */}
                <section className="bg-white py-16 lg:py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 shadow-[0_20px_60px_rgba(34,197,94,0.15)] transition-all duration-500 hover:shadow-[0_30px_70px_rgba(34,197,94,0.25)]">
                                <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/15 blur-[100px]" />
                                <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-400/15 blur-[80px]" />

                                <div className="relative z-10 flex flex-col gap-8 p-10 md:flex-row md:items-center md:justify-between md:p-14">
                                    <div>
                                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-200" />
                                            <span className="font-dm-mono text-[10px] uppercase tracking-[0.2em] text-green-100">
                                                Presupuesto sin cargo
                                            </span>
                                        </div>

                                        <h2 className="font-barlow text-3xl font-bold leading-tight text-white md:text-4xl">
                                            Hablemos de tu proyecto.
                                        </h2>
                                        <p className="mt-3 max-w-lg text-lg leading-relaxed text-green-50/90">
                                            Contanos qué necesitás: tipo de cultivo, superficie, fuente de agua o el
                                            problema que estás queriendo resolver.
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-5 text-sm text-green-100">
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
                                            className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 font-bold text-green-700 shadow-xl transition-all duration-300 hover:bg-green-50 hover:gap-5 active:scale-[0.98] whitespace-nowrap"
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
            SECONDARY LINKS
            ═══════════════════════════════════════ */}
                <section className="border-t border-slate-200 bg-white py-10">
                    <div className="container mx-auto px-4">
                        <p className="mb-5 text-center font-dm-mono text-[10px] uppercase tracking-widest text-slate-400">
                            También puede interesarte
                        </p>
                        <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
                            <Link
                                href="/productos"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                            >
                                Catálogo completo de productos <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                            >
                                Guías técnicas de instalación <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/contacto"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
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