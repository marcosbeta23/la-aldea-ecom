import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import {
    MessageCircle,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Phone,
    MapPin,
    Truck,
    ArrowRight,
    Droplets,
    CloudRain,
    Gauge,
    Timer,
    Sun,
    Database,
    Leaf,
    Shield,
    Lightbulb,
    ClipboardList,
    HardHat,
    Headphones,
} from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY, buildWhatsAppUrl } from '@/lib/constants';
import { DEPARTMENTS, getDepartmentBySlug, type Department, type TechnicalRecommendation } from '@/lib/departments';
import { departmentBreadcrumb, BUSINESS_ID } from '@/lib/schema';
import ServicesCarousel from '@/components/services/ServicesCarousel';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export const revalidate = false;

/* ─────────────────────────────────────────────
   ICON RESOLVER
───────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
    Droplets,
    CloudRain,
    Gauge,
    Timer,
    Sun,
    Database,
    Leaf,
    Shield,
    Lightbulb,
    MapPin,
    Truck,
};

function getIcon(name: string): React.ElementType {
    return ICON_MAP[name] || Lightbulb;
}

/* ─────────────────────────────────────────────
   STATIC PARAMS — pre-render all published departments
───────────────────────────────────────────── */
export function generateStaticParams() {
    return DEPARTMENTS.filter((d) => d.published).map((d) => ({
        departamento: d.slug,
    }));
}

/* ─────────────────────────────────────────────
   METADATA
───────────────────────────────────────────── */
type PageProps = {
    params: Promise<{ departamento: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { departamento } = await params;
    const dept = getDepartmentBySlug(departamento);
    if (!dept) return {};

    return {
        title: dept.metaTitle,
        description: dept.metaDescription,
        keywords: dept.keywords,
        openGraph: {
            title: `${dept.metaTitle} | La Aldea`,
            description: dept.metaDescription,
            type: 'website',
            url: `${siteUrl}/servicios/${dept.slug}`,
            images: [
                {
                    url: `${siteUrl}/assets/images/og-image.webp`,
                    width: 1200,
                    height: 630,
                    alt: `Servicios de riego y bombeo en ${dept.name} — La Aldea`,
                },
            ],
        },
        alternates: { canonical: `${siteUrl}/servicios/${dept.slug}` },
    };
}

/* ─────────────────────────────────────────────
   SCHEMA — LocalBusiness + Service + Breadcrumb
───────────────────────────────────────────── */
function buildDepartmentSchema(dept: Department) {
    return {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': BUSINESS_ID,
        name: 'La Aldea',
        url: siteUrl,
        logo: `${siteUrl}/assets/images/logo.webp`,
        image: `${siteUrl}/assets/images/og-image.webp`,
        telephone: `+${WHATSAPP_PHONE}`,
        email: 'contacto@laaldeatala.com.uy',
        foundingDate: '2002',
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
        areaServed: {
            '@type': 'AdministrativeArea',
            name: dept.name,
            containedInPlace: {
                '@type': 'Country',
                name: 'Uruguay',
            },
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `Servicios de Riego y Bombeo en ${dept.name}`,
            itemListElement: [
                'Diseño e Instalación de Riego por Goteo',
                'Riego por Aspersión y Microaspersión',
                'Instalación de Sistemas de Bombeo',
                'Automatización de Riego',
                'Bombeo Solar Fotovoltaico',
                'Almacenamiento de Agua',
                'Instalaciones Ganaderas',
                'Arcos Sanitarios de Desinfección',
                'Asesoramiento Técnico Hídrico',
            ].map((name) => ({
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name,
                    areaServed: {
                        '@type': 'AdministrativeArea',
                        name: dept.name,
                    },
                },
            })),
        },
    };
}

function buildDepartmentServiceSchema(dept: Department) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${siteUrl}/servicios/${dept.slug}#service`,
        serviceType: 'Venta e Instalacion de Riego Agricola',
        provider: {
            '@type': 'LocalBusiness',
            '@id': BUSINESS_ID,
            name: 'La Aldea',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Tala',
                addressRegion: 'Canelones',
                addressCountry: 'UY',
            },
        },
        areaServed: {
            '@type': 'State',
            name: dept.name,
            geo: {
                '@type': 'GeoCoordinates',
                latitude: dept.geoCoordinates.latitude,
                longitude: dept.geoCoordinates.longitude,
            },
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `Soluciones Hidricas en ${dept.name}`,
            itemListElement: dept.agriculturalFocus.crops.map((crop) => ({
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: `Riego para ${crop}`,
                },
            })),
        },
    };
}

/* ─────────────────────────────────────────────
   PROCESS STEPS (shared across pages)
───────────────────────────────────────────── */
const processSteps = [
    {
        icon: MessageCircle,
        step: '01',
        title: 'Consulta inicial',
        description:
            'Contanos tu proyecto por WhatsApp o teléfono: tipo de cultivo o uso, superficie, fuente de agua disponible.',
    },
    {
        icon: ClipboardList,
        step: '02',
        title: 'Relevamiento técnico',
        description:
            'Analizamos tu información y calculamos caudales, presiones y materiales. Si hace falta, visitamos tu predio.',
    },
    {
        icon: HardHat,
        step: '03',
        title: 'Instalación',
        description:
            'Montaje completo con materiales de primer nivel. Entregamos el sistema en marcha, verificado y documentado.',
    },
    {
        icon: Headphones,
        step: '04',
        title: 'Soporte post-obra',
        description:
            'Asistencia post-instalación, gestión de garantías y repuestos de los equipos que instalamos.',
    },
];

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default async function DepartamentoPage({ params }: PageProps) {
    const { departamento } = await params;
    const dept = getDepartmentBySlug(departamento);
    if (!dept || !dept.published) return notFound();

    const breadcrumb = departmentBreadcrumb(dept.name);
    const departmentSchema = buildDepartmentSchema(dept);
    const departmentServiceSchema = buildDepartmentServiceSchema(dept);

    // Get nearby departments data for cross-linking
    const nearbyDepts = dept.nearbyDepartments
        .map((slug) => getDepartmentBySlug(slug))
        .filter((d): d is Department => !!d && d.published);

    const waMessage = `Hola, soy de ${dept.name} y quiero consultar sobre servicios de riego o bombeo.`;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(departmentSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(departmentServiceSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
            />

            <Header />

            <main className="min-h-screen bg-slate-50">
                {/* ══════════════════════════════════════════
                    HERO — Compact with dept name
                ═══════════════════════════════════════ */}
                <HeroSection className="services-hero-shell relative w-full flex flex-col pt-14 sm:pt-16 lg:pt-20 2xl:pt-24 touch-pan-y bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/assets/images/services/hero-servicios.avif"
                            alt={`Servicios de riego y bombeo en ${dept.name}`}
                            fill
                            priority
                            fetchPriority="high"
                            sizes="100vw"
                            quality={55}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-[#050b14]/90 via-[#050b14]/75 to-[#050b14]/40" />
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/3 bg-linear-to-t from-[#050b14]/95 via-[#050b14]/40 to-transparent" />

                    <div className="relative z-20 flex w-full flex-1 flex-col">
                        <div className="services-hero-grid flex-1 grid grid-cols-1 items-center w-full mx-0 gap-2 md:gap-4 lg:gap-8 xl:gap-12 2xl:gap-16 px-4 lg:px-8 xl:px-12 pb-16 lg:pb-8">
                            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000 py-12 sm:py-16 lg:py-20">
                            {/* Breadcrumb */}
                            <nav aria-label="Breadcrumb" className="mb-6">
                                <ol className="flex items-center gap-1.5 font-dm-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-white/50">
                                    <li>
                                        <Link href="/" className="hover:text-white/80 transition-colors">Inicio</Link>
                                    </li>
                                    <li><ChevronRight className="h-3 w-3" /></li>
                                    <li>
                                        <Link href="/servicios" className="hover:text-white/80 transition-colors">Servicios</Link>
                                    </li>
                                    <li><ChevronRight className="h-3 w-3" /></li>
                                    <li className="text-white/80">{dept.name}</li>
                                </ol>
                            </nav>

                            <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 backdrop-blur-sm">
                                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                                <span className="font-dm-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                                    {dept.name}, Uruguay
                                </span>
                            </div>

                            <h1 className="font-barlow text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.01em] text-white">
                                <span className="block">Servicios de Riego y Bombeo</span>
                                <span className="block mt-1 bg-linear-to-r from-blue-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                                    en {dept.name}
                                </span>
                            </h1>

                            <p className="mt-4 max-w-2xl text-[15px] sm:text-[16px] font-light leading-relaxed text-slate-300">
                                {dept.heroSubtitle}
                            </p>

                            <div className="mt-6 flex flex-col sm:flex-row items-stretch gap-3 max-w-md">
                                <a
                                    href={buildWhatsAppUrl(WHATSAPP_PHONE, waMessage)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-whatsapp-source={`dept_${dept.slug}_hero`}
                                    className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-green-500 px-5 py-3.5 font-epilogue text-[14px] font-bold text-white shadow-[0_8px_30px_rgba(34,197,94,0.3)] transition-all duration-300 hover:bg-green-400 hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    WhatsApp
                                </a>
                                <a
                                    href="#servicios-scroll"
                                    className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 font-epilogue text-[14px] font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/15"
                                >
                                    Ver servicios
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                            </div>
                        </div>
                    </div>

                    <a href="#servicios-scroll" className="services-hero-scroll-mobile absolute bottom-[max(3rem,env(safe-area-inset-bottom))] inset-x-0 mx-auto w-max z-20 flex flex-col items-center justify-center gap-1 lg:hidden pointer-events-auto transition-opacity hover:opacity-75">
                        <span className="font-dm-mono text-[10px] uppercase tracking-[0.2em] text-white/70 text-center whitespace-nowrap">
                            Desliza para ver mas
                        </span>
                        <ChevronDown className="h-4 w-4 animate-bounce text-white/70" />
                    </a>

                    <a href="#servicios-scroll" className="services-hero-scroll pointer-events-auto absolute bottom-4 inset-x-0 mx-auto w-max z-30 hidden flex-col items-center justify-center gap-1 lg:flex transition-opacity hover:opacity-75">
                        <span className="font-dm-mono text-[10px] uppercase tracking-[0.2em] text-white/50 text-center whitespace-nowrap">
                            Desliza para ver mas
                        </span>
                        <ChevronDown className="h-4 w-4 animate-bounce text-white/50" />
                    </a>
                </HeroSection>

                {/* ══════════════════════════════════════════
                    STATS BAR
                ═══════════════════════════════════════ */}
                <section id="servicios-scroll" className="border-b border-slate-200 bg-white scroll-mt-16">
                    <div className="container mx-auto px-4 py-5">
                        <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 overflow-hidden rounded-[1.75rem] border border-slate-200 shadow-sm md:grid-cols-4 md:divide-y-0">
                            {[
                                { value: '24+', label: 'Años de experiencia' },
                                { value: '9', label: 'Tipos de servicio' },
                                { value: dept.name, label: 'Departamento' },
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

                {/* ══════════════════════════════════════════
                    INTRO TEXT — unique per department
                ═══════════════════════════════════════ */}
                <section className="cv-auto bg-white py-12 lg:py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-blue-700">
                                    Servicios en {dept.name}
                                </span>
                            </div>
                            <h2 className="font-barlow text-2xl font-bold leading-tight text-slate-900 md:text-3xl mb-6">
                                Riego, bombeo e instalaciones hídricas en {dept.name}.
                            </h2>
                            <div
                                className="prose prose-slate prose-lg max-w-none [&>p]:text-slate-600 [&>p]:leading-relaxed [&>p]:mb-4"
                                dangerouslySetInnerHTML={{ __html: dept.introText }}
                            />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    AGRICULTURAL FOCUS — unique per department
                ═══════════════════════════════════════ */}
                <section className="cv-auto bg-slate-50 py-12 lg:py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16 items-start">
                            {/* Left: Title + crops */}
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-blue-700">
                                        Perfil productivo
                                    </span>
                                </div>
                                <h2 className="font-barlow text-2xl font-bold leading-tight text-slate-900 md:text-3xl mb-6">
                                    {dept.agriculturalFocus.title}
                                </h2>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {dept.agriculturalFocus.crops.map((crop, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 shadow-sm"
                                        >
                                            <Leaf className="h-3.5 w-3.5 text-green-500" />
                                            {crop}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Description */}
                            <div
                                className="prose prose-slate max-w-none [&>p]:text-slate-600 [&>p]:leading-relaxed [&>p]:mb-4"
                                dangerouslySetInnerHTML={{ __html: dept.agriculturalFocus.description }}
                            />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    SERVICES CAROUSEL — shared component
                ═══════════════════════════════════════ */}
                <section id="servicios" className="cv-auto bg-white py-16 lg:py-20">
                    <div className="container mx-auto px-4 mb-8">
                        <div className="max-w-3xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-blue-700">
                                    Servicios disponibles
                                </span>
                            </div>
                            <h2 className="font-barlow text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                                Todos nuestros servicios,{' '}
                                <span className="text-blue-600">disponibles en {dept.name}.</span>
                            </h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-500 lg:text-lg">
                                Deslizá para explorar los nueve servicios que ofrecemos.
                                Cada proyecto se adapta a las condiciones del departamento.
                            </p>
                        </div>
                    </div>
                    <div className="pb-6 sm:pb-8 lg:pb-10">
                        <ServicesCarousel whatsappPhone={WHATSAPP_PHONE} />
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    TECHNICAL RECOMMENDATIONS — unique per department
                ═══════════════════════════════════════ */}
                <section className="cv-auto bg-slate-900 py-16 lg:py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-10 text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-slate-400">
                                    Asesoramiento técnico
                                </span>
                            </div>
                            <h2 className="font-barlow text-3xl font-bold text-white md:text-4xl">
                                {dept.technicalAdvice.title}
                            </h2>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                            {dept.technicalAdvice.recommendations.map((rec: TechnicalRecommendation, i: number) => {
                                const Icon = getIcon(rec.iconName);
                                return (
                                    <div
                                        key={i}
                                        className="rounded-[1.75rem] border border-slate-700/50 bg-slate-800/60 p-6 hover:border-slate-600 hover:bg-slate-800 transition-all duration-300"
                                    >
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-barlow text-lg font-bold text-white mb-2">
                                            {rec.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-slate-400">
                                            {rec.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    LOGISTICS & COVERAGE — unique per department
                ═══════════════════════════════════════ */}
                <section className="cv-auto bg-white py-16 lg:py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                                {/* Logistics */}
                                <div>
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-blue-700">
                                            Cobertura en {dept.name}
                                        </span>
                                    </div>
                                    <h2 className="font-barlow text-2xl font-bold leading-tight text-slate-900 md:text-3xl mb-6">
                                        Cómo llegamos a {dept.name}.
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4 shadow-sm">
                                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Visitas técnicas</p>
                                                <p className="mt-0.5 text-sm text-slate-500">{dept.logistics.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4 shadow-sm">
                                            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Envío de materiales</p>
                                                <p className="mt-0.5 text-sm text-slate-500">{dept.logistics.deliveryNotes}</p>
                                            </div>
                                        </div>
                                        {dept.logistics.pickupPoints && (
                                            <div className="flex items-start gap-4 rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4 shadow-sm">
                                                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Retiro en local</p>
                                                    <p className="mt-0.5 text-sm text-slate-500">{dept.logistics.pickupPoints}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Process steps — compact */}
                                <div>
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        <span className="font-dm-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-blue-700">
                                            Proceso
                                        </span>
                                    </div>
                                    <h2 className="font-barlow text-2xl font-bold leading-tight text-slate-900 md:text-3xl mb-6">
                                        Cómo trabajamos.
                                    </h2>

                                    <div className="space-y-3">
                                        {processSteps.map((step, i) => {
                                            const Icon = step.icon;
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-4 rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4 shadow-sm"
                                                >
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            <span className="text-blue-600 font-mono mr-1.5">{step.step}</span>
                                                            {step.title}
                                                        </p>
                                                        <p className="mt-0.5 text-[13px] text-slate-500">{step.description}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    WHATSAPP CTA — dept-specific message
                ═══════════════════════════════════════ */}
                <section className="cv-auto bg-slate-50 py-16 lg:py-20">
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
                                                Consulta sin cargo
                                            </span>
                                        </div>

                                        <h2 className="font-barlow text-3xl font-bold leading-tight text-white md:text-4xl">
                                            ¿Tenés un proyecto en {dept.name}?
                                        </h2>
                                        <p className="mt-3 max-w-lg text-lg leading-relaxed text-green-50/90">
                                            Contanos qué necesitás: tipo de cultivo, superficie, fuente de agua o el problema que querés resolver.
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
                                            href={buildWhatsAppUrl(WHATSAPP_PHONE, waMessage)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            data-whatsapp-source={`dept_${dept.slug}_cta`}
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
                    NEARBY DEPARTMENTS — cross-linking
                ═══════════════════════════════════════ */}
                {nearbyDepts.length > 0 && (
                    <section className="cv-auto border-t border-slate-200 bg-white py-12">
                        <div className="container mx-auto px-4">
                            <p className="mb-5 text-center font-dm-mono text-[10px] uppercase tracking-widest text-slate-400">
                                Servicios en departamentos cercanos
                            </p>
                            <p className="mx-auto mb-6 max-w-3xl text-center text-sm leading-relaxed text-slate-600">
                                Operamos tambien en zonas limitrofes:{' '}
                                {nearbyDepts.map((nd, idx) => (
                                    <span key={nd.slug}>
                                        {idx > 0 && (idx === nearbyDepts.length - 1 ? ' y ' : ', ')}
                                        <Link
                                            href={`/servicios/${nd.slug}`}
                                            className="font-semibold text-blue-700 underline-offset-4 hover:text-blue-600 hover:underline"
                                        >
                                            ver servicios en {nd.name}
                                        </Link>
                                    </span>
                                ))}
                                .
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {nearbyDepts.map((nd) => (
                                    <Link
                                        key={nd.slug}
                                        href={`/servicios/${nd.slug}`}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                                    >
                                        <MapPin className="h-3.5 w-3.5" />
                                        {nd.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ══════════════════════════════════════════
                    SECONDARY LINKS
                ═══════════════════════════════════════ */}
                <section className="cv-auto border-t border-slate-200 bg-white py-10">
                    <div className="container mx-auto px-4">
                        <p className="mb-5 text-center font-dm-mono text-[10px] uppercase tracking-widest text-slate-400">
                            También puede interesarte
                        </p>
                        <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
                            <Link
                                href="/servicios"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                            >
                                Todos nuestros servicios <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/productos"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                            >
                                Catálogo de productos <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/contacto"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                            >
                                Contacto <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
