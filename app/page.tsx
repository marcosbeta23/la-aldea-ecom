import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { supabaseAdmin } from "@/lib/supabase";
import type { Product } from "@/types/database";
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
  Mail,
  Instagram,
  Facebook,
  Menu,
  ShoppingCart,
  MessageCircle,
  Star,
  ExternalLink,
  TrendingUp,
  Users,
  Award,
  Hammer,
  Settings,
  ClipboardList
} from "lucide-react";

// LocalBusiness JSON-LD Schema (Complete)
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://laaldeatala.com.uy/#organization",
  "name": "La Aldea",
  "description": "Especialistas en bombas de agua, sistemas de riego, instalaciones hidráulicas e insumos agrícolas en Tala, Canelones, Uruguay. Más de 25 años de experiencia.",
  "url": "https://laaldeatala.com.uy",
  "telephone": "+59892744725",
  "email": "contacto@laaldeatala.com.uy",
  "image": "https://laaldeatala.com.uy/assets/images/og-image.webp",
  "logo": "https://laaldeatala.com.uy/assets/images/logo.webp",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "José Alonso y Trelles y Av Artigas",
    "addressLocality": "Tala",
    "addressRegion": "Canelones",
    "postalCode": "91800",
    "addressCountry": "UY"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -34.346943768995686,
    "longitude": -55.76359424741334
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "12:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "14:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "08:30",
      "closes": "12:00"
    }
  ],
  "priceRange": "$$",
  "paymentAccepted": "Cash, Credit Card, Debit Card, Bank Transfer, MercadoPago",
  "currenciesAccepted": "UYU",
  "foundingDate": "1999",
  "founder": {
    "@type": "Person",
    "name": "Martín Betancor Peregalli"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Uruguay"
  },
  "sameAs": [
    "https://www.facebook.com/profile.php?id=61561171162882",
    "https://www.instagram.com/laaldeatala/",
    "https://maps.app.goo.gl/4oUish4o13iMrJ2c9"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Productos y Servicios",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Instalaciones Hidráulicas",
          "description": "Diseño e instalación de sistemas hidráulicos completos"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Bombas de Agua",
          "description": "Bombas sumergibles, de superficie y centrífugas"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Sistemas de Riego",
          "description": "Riego por goteo, aspersión y automatización"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Droguería Industrial",
          "description": "Productos de limpieza y químicos industriales DIU"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Filtros de Agua",
          "description": "Filtros Gianni para agua potable"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Productos para Piscinas",
          "description": "Bombas, filtros, cloro y mantenimiento"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Herramientas",
          "description": "Herramientas manuales y eléctricas profesionales"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Energías Renovables",
          "description": "Paneles solares e inversores para sistemas de bombeo"
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "47",
    "bestRating": "5",
    "worstRating": "1"
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

// Brand partners
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

// Helper to get badge based on product properties
function getProductBadge(product: Product): string {
  if (product.sold_count >= 20) return "Más Vendido";
  if (product.sold_count >= 10) return "Popular";
  return "Destacado";
}

// Helper to get gradient color based on category
function getCategoryColor(category: string[] | string | null): string {
  const colors: Record<string, string> = {
    "Bombas": "from-blue-400 to-blue-600",
    "Riego": "from-green-400 to-green-600",
    "Filtros": "from-teal-400 to-teal-600",
    "Tanques": "from-cyan-400 to-cyan-600",
    "Piscinas": "from-sky-400 to-sky-600",
    "Químicos": "from-purple-400 to-purple-600",
    "Herramientas": "from-orange-400 to-orange-600",
  };
  const key = Array.isArray(category) ? category[0] || '' : category || '';
  return colors[key] || "from-blue-400 to-blue-600";
}

export default async function Home() {
  // Fetch featured products from database
  // Priority: is_featured=true first, then by sold_count
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .gt('stock', 0)
    .order('is_featured', { ascending: false, nullsFirst: false })
    .order('sold_count', { ascending: false })
    .limit(4) as { data: any[] | null };
  
  const featuredProducts = (data || []) as Product[];

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Header with auto-hide on scroll */}
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center touch-pan-y">
          {/* Background Image */}
          <div className="absolute inset-0 will-change-transform">
            <Image
              src="/assets/images/laaldeaedificio.webp"
              alt="La Aldea - Local en Tala"
              fill
              className="object-cover object-[center_40%]"
              priority
              sizes="100vw"
              quality={90}
            />
            {/* Overlay with gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </div>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          <div className="container relative mx-auto px-4 pt-32">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-wider text-blue-200">
                Más de 25 años en Tala, Canelones
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                La Aldea
              </h1>
              <p className="mt-2 text-xl font-medium text-blue-100 md:text-2xl">
                Sistemas de Riego e Instalaciones Hidráulicas
              </p>
              <p className="mt-4 text-base text-blue-200/80 italic">
                Martín Betancor Peregalli
              </p>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100/90 md:text-xl">
                Bombas de agua, riego por goteo, tanques, droguería industrial y herramientas. 
                Todo lo que necesitas para tu campo, hogar y piscina.
              </p>
              
              {/* CTA Buttons - Services First Strategy */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <a
                  href="https://wa.me/59892744725?text=Hola,%20me%20gustaría%20más%20información"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-50 hover:shadow-2xl"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contactar por WhatsApp
                </a>
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/20 hover:border-white/30"
                >
                  Ver Productos
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
              
              {/* Social Icons */}
              <div className="mt-10 mb-12 flex justify-center gap-4">
                <a
                  href="https://www.instagram.com/laaldeatala/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61561171162882"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section - Compact horizontal row */}
        <section className="relative z-10 bg-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                  Productos Destacados
                </h2>
              </div>
              <Link
                href="/productos"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Horizontal scroll on mobile, 4 columns on desktop */}
            <div className="mt-6 -mx-4 px-4 pb-2 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-2 lg:grid lg:grid-cols-4 lg:gap-5 lg:pb-0">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/productos/${product.sku}`}
                    className="group relative flex-shrink-0 w-52 lg:w-auto overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg"
                  >
                    {/* Badge */}
                    <div className="absolute left-2 top-2 z-10 rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      {getProductBadge(product)}
                    </div>
                    
                    {/* Product Image or Gradient Fallback */}
                    <div className={`aspect-[4/3] overflow-hidden ${product.images?.[0] ? 'bg-white' : `bg-gradient-to-br ${getCategoryColor(product.category)}`} flex items-center justify-center`}>
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={300}
                          height={225}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Droplets className="h-12 w-12 text-white/40" />
                      )}
                    </div>
                    
                    {/* Content - more compact */}
                    <div className="p-3">
                      <p className="text-[10px] font-medium text-blue-600">{Array.isArray(product.category) ? product.category.join(', ') : product.category || 'Producto'}</p>
                      <h3 className="mt-0.5 text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-base font-bold text-slate-900">
                        {product.currency} {product.price_numeric.toLocaleString('es-UY')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
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
                Ver Todos los Productos
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
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className={`rounded-3xl p-6 ${
                    testimonial.featured 
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
                href="https://g.page/r/laaldeatala/review"
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

        {/* Partners Carousel - Infinite smooth scroll */}
        <section className="border-b border-slate-200 bg-white py-6 overflow-hidden">
          <div className="container mx-auto px-4 mb-4">
            <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider">
              Marcas que nos respaldan
            </p>
          </div>
          
          {/* Infinite carousel */}
          <div className="relative">
            {/* Gradient overlays for smooth fade effect */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent" />
            
            {/* Scrolling container */}
            <div className="flex animate-scroll">
              {/* First set of logos */}
              <div className="flex shrink-0 items-center gap-12 px-6">
                {partners.map((partner, i) => (
                  <div
                    key={`a-${i}`}
                    className="grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100"
                  >
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={100}
                      height={50}
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex shrink-0 items-center gap-12 px-6">
                {partners.map((partner, i) => (
                  <div
                    key={`b-${i}`}
                    className="grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100"
                  >
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={100}
                      height={50}
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
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
                    src="/assets/images/laaldeaedificio.webp"
                    alt="La Aldea - Local en Tala, Uruguay"
                    width={800}
                    height={600}
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

        {/* Hours & Location Section */}
        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
              <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Lunes a Viernes</p>
                  <p className="text-sm text-slate-600 sm:text-base">08:00 - 12:00 | 14:00 - 18:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Sábados</p>
                  <p className="text-sm text-slate-600 sm:text-base">08:30 - 12:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Ubicación</p>
                  <p className="text-sm text-slate-600 sm:text-base">José Alonso y Trelles y Av Artigas, Tala</p>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3294.1314809828673!2d-55.76369469999999!3d-34.3471317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a06b0d701e68b7%3A0x5c6ea977f048f63!2sLa%20Aldea%20-%20Mart%C3%ADn%20Betancor!5e0!3m2!1ses-419!2suy!4v1768700144456!5m2!1ses-419!2suy"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de La Aldea en Google Maps"
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-4">
              {/* Brand */}
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <Droplets className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-900">La Aldea</span>
                </Link>
                <p className="mt-4 max-w-sm text-slate-600">
                  Especialistas en bombas de agua, sistemas de riego e instalaciones hidráulicas 
                  en Tala, Canelones, Uruguay.
                </p>
                <div className="mt-6 flex gap-3">
                  <a
                    href="https://www.instagram.com/laaldeatala/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61561171162882"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Links */}
              <div>
                <h3 className="font-semibold text-slate-900">Enlaces</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link href="/productos" className="text-slate-600 hover:text-blue-600">
                      Productos
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-slate-600 hover:text-blue-600">
                      Preguntas Frecuentes
                    </Link>
                  </li>
                  <li>
                    <Link href="/contacto" className="text-slate-600 hover:text-blue-600">
                      Contacto
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacidad" className="text-slate-600 hover:text-blue-600">
                      Política de Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link href="/terminos" className="text-slate-600 hover:text-blue-600">
                      Términos y Condiciones
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-semibold text-slate-900">Contacto</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <a href="tel:+59892744725" className="hover:text-blue-600">+598 92 744 725</a>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <a href="tel:+59843154393" className="hover:text-blue-600">4315 4393</a>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    <a href="mailto:contacto@laaldeatala.com.uy" className="hover:text-blue-600">
                      contacto@laaldeatala.com.uy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} La Aldea. Todos los derechos reservados.
              </p>
              <p className="text-sm text-slate-500">
                Tala, Canelones, Uruguay
              </p>
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/59892744725"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-600 hover:scale-110 hover:shadow-xl sm:hidden"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      </div>
    </>
  );
}
