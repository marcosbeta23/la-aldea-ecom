import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import {
    Droplets,
    CloudRain,
    Gauge,
    Timer,
    Lightbulb,
    MessageCircle,
    CheckCircle,
    MapPin,
    ChevronRight,
    Phone,
    ClipboardList,
    HardHat,
    Headphones,
} from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export const metadata: Metadata = {
    title: 'Servicios de Riego e Instalaciones Hídricas | La Aldea Tala',
    description:
        'Diseño e instalación de sistemas de riego por goteo, aspersión y riego automatizado en Tala, Canelones. Instalación de bombas de agua. Presupuesto sin cargo. 25 años de experiencia.',
    openGraph: {
        title: 'Servicios de Riego e Instalaciones Hídricas | La Aldea Tala',
        description:
            'Diseño e instalación de sistemas de riego por goteo, aspersión y riego automatizado en Tala, Canelones. Instalación de bombas de agua. Presupuesto sin cargo.',
        type: 'website',
        url: `${siteUrl}/servicios`,
    },
    alternates: { canonical: `${siteUrl}/servicios` },
    keywords: [
        'instalación de riego Tala',
        'sistema de riego por goteo Canelones',
        'instalación riego goteo Uruguay',
        'riego por aspersión Uruguay',
        'instalación bomba de agua Tala',
        'servicio de riego Canelones',
        'riego automatizado Uruguay',
        'sistemas hídricos Tala',
        'instalación riego por goteo',
        'servicio instalación riego Uruguay',
    ],
};

// LocalBusiness + Service structured data
const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#business`,
    name: 'La Aldea',
    url: siteUrl,
    logo: `${siteUrl}/assets/images/logo.webp`,
    image: `${siteUrl}/assets/images/og-image.webp`,
    telephone: `+${WHATSAPP_PHONE}`,
    email: 'contacto@laaldeatala.com.uy',
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
    areaServed: [
        { '@type': 'State', name: 'Canelones' },
        { '@type': 'State', name: 'Montevideo' },
        { '@type': 'Country', name: 'Uruguay' },
    ],
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios de Riego e Instalaciones Hídricas',
        itemListElement: [
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Diseño e Instalación de Riego por Goteo',
                    description:
                        'Relevamiento, diseño hidráulico y montaje de sistemas de riego por goteo para huertas, cultivos hortícolas, frutales y viñedos en Uruguay.',
                    provider: { '@type': 'Organization', name: 'La Aldea', url: siteUrl },
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Sistemas de Riego por Aspersión',
                    description:
                        'Diseño e instalación de sistemas de aspersión y microaspersión para pasturas, praderas y áreas extensas en Uruguay.',
                    provider: { '@type': 'Organization', name: 'La Aldea', url: siteUrl },
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Instalación de Bombas de Agua',
                    description:
                        'Instalación y puesta en marcha de bombas periféricas, sumergibles y solares para hogares, chacras y establecimientos rurales.',
                    provider: { '@type': 'Organization', name: 'La Aldea', url: siteUrl },
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Riego Automatizado',
                    description:
                        'Programación e instalación de controladores digitales y electroválvulas para automatizar el riego en chacras y jardines.',
                    provider: { '@type': 'Organization', name: 'La Aldea', url: siteUrl },
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Asesoramiento Técnico en Riego y Bombeo',
                    description:
                        'Consultoría sin cargo para dimensionar y seleccionar el sistema de riego o bombeo más adecuado para cada proyecto. 25 años de experiencia.',
                    provider: { '@type': 'Organization', name: 'La Aldea', url: siteUrl },
                    areaServed: { '@type': 'Country', name: 'Uruguay' },
                },
            },
        ],
    },
};

const services = [
    {
        icon: Droplets,
        subtitle: 'Diseño e instalación',
        title: 'Riego por Goteo',
        description:
            'Relevamos tu predio, calculamos caudales y presiones, y montamos el sistema completo. Ideal para huertas, cultivos hortícolas, frutales y viñedos.',
        tags: ['Goteo estándar', 'Goteo subsuperficial', 'Fertirrigación'],
    },
    {
        icon: CloudRain,
        subtitle: 'Pasturas y jardines',
        title: 'Riego por Aspersión',
        description:
            'Sistemas de aspersión y microaspersión para pasturas, praderas y áreas extensas. Diseñamos la red hidráulica desde cero según tu fuente de agua.',
        tags: ['Aspersores giratorios', 'Microaspersión', 'Cañones de riego'],
    },
    {
        icon: Gauge,
        subtitle: 'Instalación y puesta en marcha',
        title: 'Bombeo de Agua',
        description:
            'Instalamos bombas periféricas, sumergibles y solares. Dimensionamos el equipo según caudal, profundidad de pozo y altura manométrica necesaria.',
        tags: ['Bombas periféricas', 'Sumergibles', 'Bombas solares'],
    },
    {
        icon: Timer,
        subtitle: 'Programadores y electroválvulas',
        title: 'Riego Automatizado',
        description:
            'Sumamos controladores digitales y electroválvulas a sistemas nuevos o existentes para que el riego funcione solo, en el horario que necesites.',
        tags: ['Controladores digitales', 'Electroválvulas', 'Sensores de humedad'],
    },
    {
        icon: Lightbulb,
        subtitle: 'Sin cargo, sin compromiso',
        title: 'Asesoramiento Técnico',
        description:
            '25 años de experiencia nos permiten orientarte sin rodeos. Si tenés dudas antes de comprar o instalar, consultanos: te decimos la verdad, no lo más caro.',
        tags: ['Dimensionamiento', 'Selección de equipos', 'Presupuesto'],
    },
];

const steps = [
    {
        icon: MessageCircle,
        step: '01',
        title: 'Consultanos',
        description:
            'Mandanos un mensaje por WhatsApp o llamanos. Describí tu proyecto: tipo de cultivo, superficie, fuente de agua disponible.',
    },
    {
        icon: ClipboardList,
        step: '02',
        title: 'Relevamiento',
        description:
            'Analizamos la información (planos, fotos, condiciones del predio) y calculamos caudales, presiones y materiales necesarios.',
    },
    {
        icon: HardHat,
        step: '03',
        title: 'Instalación',
        description:
            'Realizamos el montaje con materiales de primera calidad y en los tiempos acordados. Sin apuros ni atajos.',
    },
    {
        icon: Headphones,
        step: '04',
        title: 'Soporte',
        description:
            'Post-instalación seguimos disponibles. Si algo no funciona como esperabas, nos hacemos cargo.',
    },
];

const serviceAreas = [
    'Tala',
    'Migues',
    'Sauce',
    'Pando',
    'Canelón Grande',
    'Santa Lucía',
    'San Jacinto',
    'Minas (Lavalleja)',
    'Paso Carrasco',
    'Todo el País',
];

const whyUs = [
    {
        title: '25 años instalando en Uruguay',
        description:
            'Conocemos los suelos, los cultivos y las condiciones hídricas del país. No improvisamos.',
    },
    {
        title: 'Recomendamos lo que sirve, no lo más caro',
        description:
            'Si tu problema se resuelve con un equipo económico, te lo decimos. Eso nos diferencia.',
    },
    {
        title: 'Materiales de primera con garantía',
        description:
            'Trabajamos con Gianni, Tigre, Nicoll, DIU, Lusqtoff y marcas reconocidas en Uruguay.',
    },
    {
        title: 'Soporte post-instalación real',
        description:
            'Seguimos disponibles una vez terminado el trabajo. Si hay un problema, nos hacemos cargo.',
    },
];

export default function ServiciosPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />

            <Header />

            <main className="min-h-screen bg-slate-50">
                {/* ── Hero ── */}
                <PageHeader
                    badge="Instalación · Diseño · Asesoramiento"
                    title="Servicios de Riego e Instalaciones Hídricas"
                    description="Diseñamos e instalamos sistemas de riego por goteo, aspersión y bombeo en Tala, Canelones y todo Uruguay. Presupuesto sin cargo."
                    className="text-center [&_div.max-w-4xl]:mx-auto [&_.inline-flex]:mx-auto [&_p]:mx-auto"
                />

                {/* ── Trust bar ── */}
                <section className="bg-white border-b border-slate-200">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200/60 rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 my-6">
                            {[
                                { value: 'Sin cargo', label: 'Presupuesto y consulta inicial' },
                                { value: '25+', label: 'Años de experiencia técnica' },
                                { value: 'Uruguay', label: 'Área de servicio completa' },
                            ].map((item, i) => (
                                <div key={i} className="py-6 text-center bg-white">
                                    <p className="text-2xl font-bold text-blue-600 md:text-3xl">{item.value}</p>
                                    <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Services grid ── */}
                <section className="py-16 lg:py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                                Lo que hacemos
                            </span>
                            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                Nuestros servicios
                            </h2>
                            <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
                                No solo vendemos los materiales — también los instalamos. Desde el primer relevamiento hasta la puesta en marcha.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {services.map((service, i) => (
                                <div
                                    key={i}
                                    className="group bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200 transition-all duration-500 shadow-sm relative overflow-hidden flex flex-col"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <div className="relative z-10 flex flex-col flex-1">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-inner mb-5">
                                            <service.icon className="h-7 w-7" />
                                        </div>
                                        <p className="text-xs font-medium text-blue-500 uppercase tracking-wider mb-1">
                                            {service.subtitle}
                                        </p>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-3">
                                            {service.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-grow">
                                            {service.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {service.tags.map((tag, j) => (
                                                <span
                                                    key={j}
                                                    className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* CTA card */}
                            <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col justify-between shadow-lg">
                                <div>
                                    <p className="text-blue-400 text-xs font-medium uppercase tracking-wider mb-2">
                                        ¿Algo más específico?
                                    </p>
                                    <h3 className="text-xl font-bold text-white mb-3">Consultanos gratis</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Si tu proyecto no encaja exactamente en estas categorías o necesitás una solución a medida,
                                        contanos el caso. Te orientamos sin compromiso.
                                    </p>
                                </div>
                                <a
                                    href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20necesito%20asesoramiento%20sobre%20instalaci%C3%B3n%20de%20riego...`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-3.5 font-bold text-white hover:bg-green-400 transition-colors"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Escribir por WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── How it works ── */}
                <section className="bg-white py-16 lg:py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                                Proceso
                            </span>
                            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                ¿Cómo funciona?
                            </h2>
                            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                                Simple y sin burocracia. Desde la primera consulta hasta que el agua fluye.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
                            {steps.map((step, i) => (
                                <div
                                    key={i}
                                    className="relative flex flex-col items-start bg-slate-50 rounded-[2rem] p-6 border border-slate-100"
                                >
                                    {/* Connector line (desktop only) */}
                                    {i < steps.length - 1 && (
                                        <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px bg-blue-200 z-10" />
                                    )}
                                    <span className="font-dm-mono text-4xl font-bold text-blue-100 mb-3 select-none leading-none">
                                        {step.step}
                                    </span>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4">
                                        <step.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Service area + Why us ── */}
                <section className="py-16 lg:py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

                            {/* Service area */}
                            <div>
                                <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                                    Cobertura
                                </span>
                                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                    ¿Dónde trabajamos?
                                </h2>
                                <p className="mt-3 text-slate-600 leading-relaxed">
                                    Estamos en Tala, Canelones, pero operamos en todo el interior y el área metropolitana.
                                    Si tu proyecto queda lejos, coordinamos el traslado.
                                </p>

                                <div className="mt-6 flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-3">Zonas de instalación frecuente</p>
                                        <div className="flex flex-wrap gap-2">
                                            {serviceAreas.map((area, i) => (
                                                <span
                                                    key={i}
                                                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${area === 'Todo el País'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                >
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-sm text-slate-600">
                                    <strong className="text-blue-700">¿Solo necesitás los materiales?</strong>{' '}
                                    Los enviamos a los 19 departamentos del país con embalaje adecuado.{' '}
                                    <Link href="/productos" className="text-blue-600 hover:underline font-medium">
                                        Ver catálogo →
                                    </Link>
                                </div>
                            </div>

                            {/* Why us */}
                            <div>
                                <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                                    Por qué elegirnos
                                </span>
                                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                    Técnica + honestidad
                                </h2>

                                <div className="mt-6 space-y-4">
                                    {whyUs.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4 bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm"
                                        >
                                            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                                                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── WhatsApp CTA ── */}
                <section className="py-16 lg:py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-[2.5rem] p-10 md:p-14 text-white shadow-[0_20px_50px_rgba(34,197,94,0.15)] hover:shadow-[0_30px_60px_rgba(34,197,94,0.3)] transition-all duration-500">
                                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 blur-[100px] rounded-full pointer-events-none" />
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/20 blur-[80px] rounded-full pointer-events-none" />

                                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                                    <div>
                                        <p className="text-green-100 text-xs font-medium uppercase tracking-wider mb-2">
                                            Presupuesto sin cargo
                                        </p>
                                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                                            Hablemos de tu proyecto
                                        </h2>
                                        <p className="mt-3 text-green-50/90 text-lg leading-relaxed max-w-xl">
                                            Contanos qué necesitás: tipo de cultivo, superficie, fuente de agua. Te respondemos en minutos.
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-6 text-sm text-green-100">
                                            <span className="flex items-center gap-2">
                                                <MessageCircle className="h-4 w-4" /> WhatsApp inmediato
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" /> {WHATSAPP_DISPLAY}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <a
                                            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20quiero%20cotizar%20un%20servicio%20de%20instalaci%C3%B3n%20de%20riego...`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 font-bold text-green-700 shadow-xl hover:bg-green-50 hover:gap-5 transition-all duration-300 active:scale-[0.98] whitespace-nowrap"
                                        >
                                            <MessageCircle className="h-6 w-6" />
                                            Pedir presupuesto
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Secondary nav links ── */}
                <section className="py-10 lg:py-14">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                            <Link
                                href="/productos"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all"
                            >
                                <ChevronRight className="h-4 w-4" /> Ver catálogo de productos
                            </Link>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all"
                            >
                                <ChevronRight className="h-4 w-4" /> Guías técnicas de instalación
                            </Link>
                            <Link
                                href="/contacto"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all"
                            >
                                <ChevronRight className="h-4 w-4" /> Todas las formas de contacto
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}