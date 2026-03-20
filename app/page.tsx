
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { supabaseAdmin } from "@/lib/supabase";
import type { Product } from "@/types/database";
// import FeaturedCarousel from "@/components/products/FeaturedCarousel";
import {
  Droplets,
  Wrench,
  Phone,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  Shield,
  Truck,
  Filter,
  Zap,
  Waves,
  FlaskConical,
  Quote,
  MessageCircle,
  Star,
  ExternalLink,
  TrendingUp,
  Users,
  Award,
  Settings
} from "lucide-react";
import HomeHero from "@/components/home/HomeHero";
import ClientHomePageElements from "@/components/home/ClientHomePageElements";
import PartnersCarouselWrapper from "@/components/ui/PartnersCarouselWrapper";
import HomeMapSection from "@/components/home/HomeMapSection";


export const revalidate = 300; // Cache homepage for 5 minutes at the edge

// LocalBusiness JSON-LD Schema (Complete)
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  "@id": "https://laaldeatala.com.uy/#business",
  name: "La Aldea",
  alternateName: "La Aldea Tala",
  description: "Especialistas en bombas de agua, sistemas de riego, instalaciones hidráulicas e insumos agrícolas en Tala, Canelones, Uruguay. Más de 25 años de experiencia.",
  url: "https://laaldeatala.com.uy",
  telephone: "+59892744725",
  email: "contacto@laaldeatala.com.uy",
  image: "https://laaldeatala.com.uy/assets/images/og-image.webp",
  logo: {
    "@type": "ImageObject",
    url: "https://laaldeatala.com.uy/assets/images/logo.webp",
    width: 260,
    height: 80,
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "José Alonso y Trelles y Av Artigas",
    addressLocality: "Tala",
    addressRegion: "Canelones",
    postalCode: "91800",
    addressCountry: "UY"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -34.346943768995686,
    longitude: -55.76359424741334
  },
  hasMap: "https://www.google.com/maps?q=-34.346943768995686,-55.76359424741334",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "12:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "14:00",
      closes: "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:30",
      closes: "12:00"
    }
  ],
  priceRange: "$$",
  paymentAccepted: "Cash, Credit Card, Debit Card, Bank Transfer, MercadoPago",
  currenciesAccepted: ["UYU", "USD"],
  foundingDate: "2000 ",
  founder: {
    "@type": "Person",
    name: "Martín Betancor Peregalli"
  },
  areaServed: {
    "@type": "Country",
    name: "Uruguay"
  },
  knowsAbout: [
    "Bombas de agua",
    "Sistemas de riego",
    "Instalaciones hidráulicas",
    "Bombas sumergibles",
    "Riego por goteo",
    "Riego por aspersión",
    "Agroquímicos",
    "Energía solar",
    "Herramientas",
    "Tratamiento de agua",
    "Piscinas",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+59892744725",
      contactType: "customer service",
      contactOption: "TollFree",
      availableLanguage: "Spanish",
      areaServed: "UY"
    },
    {
      "@type": "ContactPoint",
      telephone: "+59892744725",
      contactType: "sales",
      availableLanguage: "Spanish",
      areaServed: "UY"
    },
    {
      "@type": "ContactPoint",
      telephone: "+59843154393",
      contactType: "technical support",
      availableLanguage: "Spanish",
      areaServed: "UY"
    }
  ],
  sameAs: [
    "https://www.facebook.com/laaldeatala",
    "https://www.instagram.com/laaldeatala/",
    "https://maps.app.goo.gl/4oUish4o13iMrJ2c9"
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Productos y Servicios",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Instalaciones Hidráulicas",
          description: "Diseño e instalación de sistemas hidráulicos completos"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Bombas de Agua",
          description: "Bombas sumergibles, de superficie y centrífugas"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Sistemas de Riego",
          description: "Riego por goteo, aspersión y automatización"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Droguería Industrial",
          description: "Productos de limpieza y químicos industriales DIU"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Filtros de Agua",
          description: "Filtros Gianni para agua potable"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Productos para Piscinas",
          description: "Bombas, filtros, cloro y mantenimiento"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Herramientas",
          description: "Herramientas manuales y eléctricas profesionales"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Energías Renovables",
          description: "Paneles solares e inversores para sistemas de bombeo"
        }
      }
    ]
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    bestRating: "5",
    worstRating: "1"
  }
};

// Product categories with images
const productCategories = [
  {
    icon: Droplets,
    title: "Hidráulica",
    description: "Bombas de riego, tuberías PVC, conectores y automatización",
    href: "/productos?categoria=Hidráulica",
    color: "from-blue-500 to-blue-600",
    image: "/assets/images/products/agricultural.webp",
  },
  {
    icon: FlaskConical,
    title: "Droguería",
    description: "Productos químicos industriales DIU para limpieza y mantenimiento",
    href: "/productos?categoria=Droguería",
    color: "from-purple-500 to-purple-600",
    image: "/assets/images/products/drogueria.webp",
  },
  {
    icon: Wrench,
    title: "Herramientas",
    description: "Herramientas manuales y eléctricas de calidad profesional",
    href: "/productos?categoria=Herramientas",
    color: "from-orange-500 to-orange-600",
    image: "/assets/images/products/tools.webp",
  },
  {
    icon: Waves,
    title: "Piscinas",
    description: "Filtros, bombas, cloro y productos de mantenimiento",
    href: "/productos?categoria=Piscinas",
    color: "from-cyan-500 to-cyan-600",
    image: "/assets/images/products/pool.webp",
  },
  {
    icon: Filter,
    title: "Filtros de Agua",
    description: "Sistemas de filtración Gianni para agua potable segura",
    href: "/productos?categoria=Filtros",
    color: "from-teal-500 to-teal-600",
    image: "/assets/images/products/filters.webp",
  },
  {
    icon: Zap,
    title: "Energías Renovables",
    description: "Paneles solares y bombas solares para instalaciones autónomas",
    href: "/productos?categoria=Energía Solar",
    color: "from-yellow-500 to-yellow-600",
    image: "/assets/images/products/renewable.webp",
  },
];

// Brand partners (fallback — DB used when available)
const partners = [
  { name: "Gianni", logo: "/assets/images/partners/gianni.webp" },
  { name: "DIU", logo: "/assets/images/partners/diu.webp" },
  { name: "Tigre", logo: "/assets/images/partners/tigre1.webp" },
  { name: "Nicoll", logo: "/assets/images/partners/nicoll.webp" },
  { name: "Hidroservice", logo: "/assets/images/partners/hidroservice.webp" },
  { name: "Pacifil", logo: "/assets/images/partners/pacifil.webp" },
  { name: "Cablinur", logo: "/assets/images/partners/cablinur.webp" },
  { name: "Lesa", logo: "/assets/images/partners/lesa.webp" },
  { name: "Ramasil", logo: "/assets/images/partners/ramasil.webp" },
  { name: "Balaguer", logo: "/assets/images/partners/balaguer.webp" },
  { name: "Armco", logo: "/assets/images/partners/armco.webp" },
  { name: "Lusqtoff", logo: "/assets/images/partners/lusqtoff.webp" },
];

// Testimonials
const testimonials = [
  {
    name: "Sebastián Velázquez",
    role: "Productor Rural",
    content: "Excelente servicio técnico y calidad en productos para riego. El asesoramiento fue fundamental para mi proyecto.",
    rating: 5,
  },
  {
    name: "Juan Pablo Fernández",
    role: "Establecimiento Ganadero",
    content: "Instalaron un sistema completo de riego con bomba solar en mi campo. El ahorro en energía es notable y el sistema funciona perfectamente.",
    rating: 5,
    featured: true,
  },
  {
    name: "Luis Rodríguez",
    role: "Cliente Particular",
    content: "Gran variedad de productos para el mantenimiento de piscinas. Buenos precios y excelente asesoramiento técnico.",
    rating: 5,
  },
  {
    name: "María González",
    role: "Pequeña Productora",
    content: "Siempre encuentro las herramientas que necesito y a buen precio. La atención es muy buena y el personal conoce bien los productos.",
    rating: 5,
  },
];

// Features
const features = [
  {
    icon: Sparkles,
    title: "25+ Años de Experiencia",
    description: "Asesoramiento técnico profesional respaldado por décadas de trabajo en el rubro.",
  },
  {
    icon: Shield,
    title: "Garantía de Calidad",
    description: "Trabajamos con las mejores marcas: Tigre, Gianni, DIU, Nicoll, Lusqtoff.",
  },
  {
    icon: Truck,
    title: "Envíos a Todo Uruguay",
    description: "Cobertura en los 19 departamentos con instalación profesional disponible.",
  },
];

// Services for lead generation
const services = [
  {
    icon: Droplets,
    title: "Instalación de Bombas",
    description: "Bombas centrífugas, periféricas, sumergibles y solares. Sistemas de presurización para pozos, cisternas y distribución de agua.",
    features: ["Todo tipo de bombas", "Instalación profesional", "Garantía incluida"],
  },
  {
    icon: Settings,
    title: "Sistemas de Riego",
    description: "Diseño e instalación de riego por goteo, aspersión y automatización para agricultura, jardines y praderas.",
    features: ["Diseño personalizado", "Riego por goteo", "Automatización"],
  },
  {
    icon: Filter,
    title: "Almacenamiento de Agua",
    description: "Instalación de tanques de polietileno y australianos con sistemas de filtración de disco y distribución.",
    features: ["Tanques de todo tipo", "Filtros de disco", "Distribución de agua"],
  },
  {
    icon: Wrench,
    title: "Soluciones a Medida",
    description: "Agua para ganado, arcos de desinfección, bombas de calor para piscinas y proyectos personalizados.",
    features: ["Proyectos especiales", "Asesoramiento técnico", "Consultas sin cargo"],
  },
];

// Stats for credibility
const stats = [
  { value: "25+", label: "Años de Experiencia" },
  { value: "500+", label: "Proyectos Realizados" },
  { value: "12", label: "Marcas Asociadas" },
  { value: "19", label: "Departamentos Cubiertos" },
];

export default async function Home() {
  // Fetch featured products and partners in parallel to avoid waterfalls
  const [productsRes, partnersRes] = await Promise.all([
    supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .gt('stock', 0)
      .order('featured_order', { ascending: true, nullsFirst: false })
      .order('sold_count', { ascending: false })
      .limit(20),
    supabaseAdmin
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
  ]);

  const featuredProducts = (productsRes.data || []) as Product[];
  const dbPartners = partnersRes.data;

  // Use DB partners with fallback to hardcoded array
  const activePartners = (dbPartners && dbPartners.length > 0)
    ? dbPartners.map((p: any) => ({ name: p.name, logo: p.logo_url }))
    : partners;

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Skip to content — Accessibility */}
        <a href="#main-content" className="skip-to-content">
          Ir al contenido principal
        </a>

        {/* Header with auto-hide on scroll */}
        <Header />

        {/* Hero Section */}
        <HomeHero />

        {/* Trust / Benefits Bar */}
        <section id="main-content" className="relative z-10 border-b border-slate-100 bg-white py-4">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { icon: Award, text: "25+ Años de Experiencia" },
                { icon: Truck, text: "Envío a Todo Uruguay" },
                { icon: Sparkles, text: "Asesoramiento Técnico" },
                { icon: Shield, text: "Garantía de Calidad" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-2 py-2 text-center">
                  <item.icon className="h-5 w-5 shrink-0 text-blue-600" />
                  <span className="text-xs font-medium text-slate-700 sm:text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Client elements (Carousel & Map) */}
        <ClientHomePageElements featuredProducts={featuredProducts} />

        {/* Partners Carousel - Seamless loop */}
        <section className="border-b border-slate-100 bg-white py-6 overflow-hidden">
          <div className="container mx-auto px-4 mb-4">
            <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider">
              Marcas que nos respaldan
            </p>
          </div>
          <div className="relative">
            {/* Seamless partners carousel */}
            <PartnersCarouselWrapper partners={activePartners} speed={60} />
          </div>
        </section>


        {/* Product Categories Section */}
        <section className="bg-slate-50 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                Categorías
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Todo para tu campo, hogar y piscina
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                Amplia variedad de productos de calidad con asesoramiento técnico especializado
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productCategories.map((category, i) => (
                <Link
                  key={i}
                  href={category.href}
                  className="group relative overflow-hidden rounded-3xl shadow-lg shadow-slate-200/50 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Background Image */}
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                      quality={55}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent`} />

                    {/* Icon badge */}
                    <div className={`absolute top-4 left-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} shadow-lg`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Content overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-bold text-white">{category.title}</h3>
                    <p className="mt-1 text-sm text-slate-200 line-clamp-2">{category.description}</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all group-hover:bg-white/30">
                      Ver productos
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-slate-800"
              >
                Ver Toda la Tienda
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section - with irrigation image */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            {/* Header with image */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div>
                <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
                  Servicios Profesionales
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Instalaciones y Proyectos a Medida
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Más que productos: ofrecemos soluciones completas. Si tienes una idea, problema
                  o proyecto relacionado con agua, consultanos — seguramente podamos ayudarte.
                </p>

                {/* Quick stats inline */}
                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900">25+</p>
                      <p className="text-xs text-slate-500">Años</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900">500+</p>
                      <p className="text-xs text-slate-500">Proyectos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Truck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900">19</p>
                      <p className="text-xs text-slate-500">Departamentos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Irrigation image */}
              <div className="relative">
                <div className="aspect-[16/10] overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src="/assets/images/services/irrigation.webp"
                    alt="Sistema de riego profesional - La Aldea"
                    width={800}
                    height={500}
                    sizes="(max-width: 768px) 100vw, 600px"
                    quality={55}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:border-blue-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <service.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900">{service.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                  <ul className="mt-3 space-y-1">
                    {service.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-slate-500">
                        <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Lead Gen CTA - Full width bar */}
            <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 md:p-8">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-white md:text-2xl">¿Tienes un proyecto en mente?</h3>
                  <p className="mt-1 text-blue-100">Solicita un presupuesto sin compromiso • Visita técnica gratuita</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://wa.me/59892744725?text=Hola,%20me%20gustaría%20solicitar%20un%20presupuesto%20para..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </a>
                  <a
                    href="tel:+59892744725"
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
                  >
                    <Phone className="h-5 w-5" />
                    Llamar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-slate-900 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <span className="inline-block rounded-full bg-blue-500/20 px-4 py-1.5 text-sm font-medium text-blue-300">
                Testimonios
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Lo que dicen nuestros clientes
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className={`rounded-3xl p-6 ${testimonial.featured
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                      : 'bg-slate-800 text-slate-100'
                    }`}
                >
                  <Quote className={`h-8 w-8 ${testimonial.featured ? 'text-blue-200' : 'text-slate-600'}`} />
                  <p className={`mt-4 text-sm leading-relaxed ${testimonial.featured ? 'text-blue-50' : 'text-slate-300'}`}>
                    {testimonial.content}
                  </p>
                  <div className="mt-6">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className={`text-sm ${testimonial.featured ? 'text-blue-200' : 'text-slate-400'}`}>
                      {testimonial.role}
                    </p>
                    {/* Stars */}
                    <div className="mt-2 flex gap-1">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <svg key={j} className={`h-4 w-4 ${testimonial.featured ? 'text-yellow-300' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Review CTA */}
            <div className="mt-12 text-center">
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJt2gecA1roJURY48Ef5fqxgU"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-100 hover:shadow-xl"
              >
                <Star className="h-5 w-5 text-yellow-500" />
                Dejanos tu opinión en Google
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </a>
            </div>
          </div>
        </section>

        {/* About Section - Moved down, more compact */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              {/* Image */}
              <div className="relative mx-4 lg:mx-0 order-2 lg:order-1">
                <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-slate-200 shadow-2xl">
                  <Image
                    src="/assets/images/laaldeaedificiodia.avif"
                    alt="La Aldea - Local en Tala, Uruguay"
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, 600px"
                    quality={55}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Experience Badge */}
                <div className="absolute -bottom-4 right-2 flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl sm:right-4 sm:h-28 sm:w-28 md:-bottom-6 md:right-0 lg:-right-4 lg:h-32 lg:w-32">
                  <span className="text-2xl font-bold sm:text-3xl lg:text-4xl">25+</span>
                  <span className="text-[10px] font-medium sm:text-xs lg:text-sm">Años</span>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                  Nuestra Historia
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Más de 25 años en el rubro
                </h2>
                <p className="mt-6 text-lg text-slate-600">
                  En La Aldea, ubicados en Tala, departamento de Canelones, trabajamos para ofrecer
                  soluciones confiables en sistemas de bombeo, riego y agua potable.
                </p>
                <p className="mt-4 text-slate-600">
                  Fundada por Martín Betancor Peregalli, nuestra empresa combina décadas de
                  experiencia técnica con un compromiso inquebrantable con la calidad y el
                  servicio personalizado.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                      <feature.icon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">{feature.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section id="contacto" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-center md:p-16">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
              <div className="relative">
                <h2 className="text-2xl font-bold text-white md:text-4xl">
                  ¿Necesitas asesoramiento?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                  Nuestro equipo técnico está listo para ayudarte a encontrar la solución perfecta para tu proyecto.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <a
                    href="https://wa.me/59892744725?text=Hola,%20necesito%20asesoramiento%20sobre..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp: +598 92 744 725
                  </a>
                  <a
                    href="tel:+59843154393"
                    className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
                  >
                    <Phone className="h-5 w-5" />
                    Llamar: 4315 4393
                  </a>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Map Section — bottom of page */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 pb-16">
            <HomeMapSection />
          </div>
        </section>

        {/* Footer is rendered globally via root layout */}
      </div>
    </>
  );
}
