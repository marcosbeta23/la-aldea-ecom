import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Droplets,
  Wrench,
  Users,
  Shield,
  Truck,
  Sparkles,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description:
    'Conoce La Aldea: mas de 24 años en Tala, Canelones, especializados en sistemas de riego, bombas de agua, agroquimicos y soluciones hidricas para Uruguay.',
  openGraph: {
    title: 'Sobre Nosotros | La Aldea',
    description:
      'Conoce La Aldea: mas de 24 años en Tala, Canelones, especializados en sistemas de riego, bombas de agua, agroquimicos y soluciones hidricas para Uruguay.',
    type: 'website',
    url: `${siteUrl}/nosotros`,
    images: [
      {
        url: `${siteUrl}/assets/images/og-image.webp`,
        width: 1200,
        height: 630,
        alt: 'La Aldea — Tala, Uruguay',
      },
    ],
  },
  alternates: { canonical: `${siteUrl}/nosotros` },
};

const values = [
  {
    icon: Sparkles,
    title: 'Experiencia Tecnica',
    description: 'Mas de 24 años asesorando sobre bombas, riego e instalaciones hidricas nos respaldan.',
  },
  {
    icon: Shield,
    title: 'Calidad Garantizada',
    description: 'Trabajamos con marcas reconocidas como Gianni, DIU, Lusqtoff, Tigre, Nicoll y mas.',
  },
  {
    icon: Users,
    title: 'Atencion Personalizada',
    description: 'Cada proyecto es unico. Asesoramos sin costo y diseñamos la solucion que necesitas.',
  },
  {
    icon: Truck,
    title: 'Envio a Todo Uruguay',
    description: 'Llegamos a los 19 departamentos con embalaje adecuado para cada tipo de producto.',
  },
];

const services = [
  { icon: Droplets, name: 'Sistemas de Riego', description: 'Goteo, aspersion, automatizado' },
  { icon: Wrench, name: 'Bombas de Agua', description: 'Sumergibles, perifericas, solares' },
  { icon: Wrench, name: 'Instalaciones Hidricas', description: 'Diseño y montaje profesional' },
  { icon: Award, name: 'Agroquimicos', description: 'Herbicidas, fungicidas, insecticidas' },
];

// Organization schema for /nosotros
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'La Aldea',
  url: siteUrl,
  logo: `${siteUrl}/assets/images/logo.webp`,
  description:
    'Especialistas en bombas de agua, sistemas de riego, instalaciones hidricas, agroquimicos, productos para piscinas y drogueria industrial en Tala, Canelones, Uruguay.',
  foundingDate: '2002',
  founder: {
    '@type': 'Person',
    name: 'Martin Betancor Peregalli',
    jobTitle: 'Fundador y Director Tecnico',
    image: `${siteUrl}/assets/images/martin-betancor.webp`,
    sameAs: [
      `${siteUrl}/nosotros`,
    ],
    worksFor: { '@type': 'Organization', name: 'La Aldea' },
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jose Alonso y Trelles y Av Artigas',
    addressLocality: 'Tala',
    addressRegion: 'Canelones',
    postalCode: '91800',
    addressCountry: 'UY',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: `+${WHATSAPP_PHONE}`,
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
    {
      '@type': 'ContactPoint',
      telephone: '+59843154393',
      contactType: 'technical support',
      availableLanguage: 'Spanish',
    },
  ],
  sameAs: [
    'https://www.facebook.com/profile.php?id=61561171162882',
    'https://www.instagram.com/laaldeatala/',
    'https://maps.app.goo.gl/4oUish4o13iMrJ2c9',
    `https://wa.me/${WHATSAPP_PHONE}`,
  ],
  areaServed: { '@type': 'Country', name: 'Uruguay' },
  numberOfEmployees: { '@type': 'QuantitativeValue', value: '5-10' },
};

export default function NosotrosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <Header />

      {/* Editorial Cream Background for completely different feel */}
      <main className="min-h-screen bg-[#FDFBF7] text-slate-800 font-epilogue selection:bg-blue-100 selection:text-blue-900">
        
        {/* 1. EDITORIAL HERO */}
        <section className="pt-32 lg:pt-48 pb-16 px-4 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-end">
            <div className="lg:col-span-8">
              <p className="text-xs md:text-sm font-bold tracking-widest text-[#B3A394] uppercase mb-6">Desde el 2002 en Tala</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-fraunces font-light leading-[0.9] text-slate-900 tracking-tight">
                La experiencia <br className="hidden sm:block" />
                <span className="italic text-slate-500">hace la diferencia.</span>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-4 lg:border-l pl-0 lg:pl-6 border-slate-200 mt-8 lg:mt-0">
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light">
                Más de 24 años ofreciendo soluciones en riego, bombas de agua, agroquímicos y productos hídricos para productores rurales y hogares de todo Uruguay.
              </p>
            </div>
          </div>
        </section>

        {/* 2. THE STORY - MAGAZINE LAYOUT */}
        <section className="py-16 md:py-24 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left: Sticky Image */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="sticky top-28">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-sm bg-slate-200">
                  <Image
                    src="/assets/images/laaldeaedificiodia.avif"
                    alt="Local de La Aldea en Tala, Uruguay"
                    width={800}
                    height={1000}
                    priority
                    className="h-full w-full object-cover filter grayscale-[40%] hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="mt-8 relative max-w-[90%]">
                  <span className="absolute -top-6 -left-3 text-[80px] text-slate-200 font-fraunces leading-none opacity-50">&ldquo;</span>
                  <p className="text-2xl md:text-3xl font-fraunces italic text-slate-900 leading-snug pl-4 relative z-10">
                    Vendemos productos, pero sobre todo brindamos soluciones que perduran.
                  </p>
                  <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#B3A394] pl-4">— Martín Betancor, Fundador</p>
                </div>
              </div>
            </div>

            {/* Right: Flowing Editorial Text */}
            <div className="lg:col-span-7 lg:pt-8 prose prose-lg prose-slate h-auto text-slate-700 font-light leading-loose order-1 lg:order-2">
              <p className="first-letter:text-7xl md:first-letter:text-8xl first-letter:font-fraunces first-letter:font-light first-letter:text-slate-900 first-letter:mr-2 first-letter:-mt-2 first-letter:float-left first-letter:leading-[0.8]">
                La Aldea nació en el año 2002 en la ciudad de Tala, Canelones, con el impulso de Martín Betancor Peregalli y el objetivo claro de acercar soluciones hídricas concretas a los productores de la zona. Lo que comenzó siendo una clásica barraca de insumos agrícolas fue adaptándose y expandiéndose.
              </p>
              <br/>
              <p>
                El rubro hídrico no tolera la improvisación ni las decisiones a medias. Nos percatamos rápido de que un cliente del campo, el encargado de una planta o aquel que emprende la construcción de su casa, no solo necesita acceder al producto: necesita <strong>certeza sobre qué comprar y cómo dimensionarlo</strong> para no malgastar su dinero.
              </p>
              <br/>
              <div className="my-10 bg-white border border-slate-100 p-8 md:p-10 rounded-sm shadow-sm italic text-slate-800 font-fraunces text-xl md:text-2xl leading-normal">
                Un equipo que falla en pleno verano o en el medio de una cosecha es un problema enorme. Por eso mantenemos alianzas con marcas de primera línea en bombeo e hidráulica como Gianni, Tigre y Nicoll, junto a insumos y herramientas de confianza para completar cada obra.
              </div>
              <br/>
              <p>
                A lo largo de 24 años, las líneas de riego automatizado, las silenciosas y potentes bombas de agua, la energía solar y los productos para piscinas se fueron sumando progresivamente a nuestro catálogo de forma natural, siempre impulsados por la demanda y confianza de nuestros clientes.
              </p>
              <br/>
              <p>
                Hoy nuestra labor atraviesa las fronteras de Tala para alcanzar los 19 departamentos del país. La filosofía es inamovible: escuchar a detalle la necesidad del cliente y prescribirle una solución que, por encima de todo, va a funcionar. Vendemos productos, pero sobre todo brindamos soluciones que perduran. — Martín Betancor, Fundador
              </p>

              {/* Minimal Numbers Layout */}
              <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 gap-y-12 border-y border-slate-200 py-12">
                {[
                  { v: '24+', l: 'Años' },
                  { v: '500+', l: 'Proyectos' },
                  { v: '12+', l: 'Marcas' },
                  { v: '19', l: 'Deptos' },
                ].map((stat, i) => (
                  <div key={i} className="text-center md:text-left flex flex-col items-center md:items-start group">
                    <div className="text-5xl font-fraunces font-light text-slate-900 mb-3 group-hover:text-[#B3A394] transition-colors">{stat.v}</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors">{stat.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. REFINED EXPERTISE / VALUES */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 lg:mb-24 gap-6">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-[#B3A394] uppercase mb-4">La Diferencia</p>
                <h2 className="text-4xl md:text-6xl font-fraunces font-light text-slate-900">
                  Nuestros pilares
                </h2>
              </div>
              <div className="md:max-w-md text-slate-500 font-light text-sm md:text-base leading-relaxed md:border-l-2 border-slate-200 md:pl-6 pt-4 md:pt-0 border-t-2 md:border-t-0">
                Nos regimos por una forma muy específica de hacer nuestro trabajo. No buscamos soluciones a corto plazo; buscamos integridad técnica, componentes de calidad y confianza duradera.
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-12 lg:gap-x-20 lg:gap-y-16">
              {values.map((val, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-6 items-start group">
                  <div className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110">
                     <val.icon className="h-8 w-8 text-[#B3A394] opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-fraunces font-light text-slate-900 mb-3">{val.title}</h3>
                    <p className="text-slate-600 font-light leading-relaxed">{val.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. ELEGANT LOCATION / CONTACT Grid */}
        <section className="py-0 flex flex-col lg:flex-row bg-slate-900 text-white">
          {/* Info Side */}
          <div className="w-full lg:w-1/2 py-20 px-8 lg:px-20 xl:px-24 flex flex-col justify-center border-t lg:border-t-0 border-slate-800 order-2 lg:order-1 relative overflow-hidden">
            {/* Background noise / texture can go here if needed */}
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-fraunces font-light text-white mb-16">Visitanos en Tala</h2>
              
               <div className="space-y-12">
                  <div className="group">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B3A394] mb-3 flex items-center gap-3">
                      <MapPin className="w-3 h-3 group-hover:text-white transition-colors" /> Dirección Central
                    </div>
                    <p className="text-xl text-slate-300 font-light leading-relaxed">José Alonso y Trelles y Av Artigas<br/>Tala, Canelones, Uruguay (91800)</p>
                    <a href="https://maps.app.goo.gl/4oUish4o13iMrJ2c9" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase border-b border-transparent hover:border-white text-slate-400 hover:text-white transition-all py-1 mt-6">
                      Abrir en Google Maps <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="group">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B3A394] mb-3 flex items-center gap-3">
                      <Clock className="w-3 h-3 group-hover:text-white transition-colors" /> Horarios de Atención
                    </div>
                    <p className="text-lg text-slate-300 font-light mb-1">Lunes a Viernes: 8:00 - 12:00, 14:00 - 18:00</p>
                    <p className="text-lg text-slate-300 font-light">Sábados: 8:30 - 12:00</p>
                  </div>

                  <div className="group">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B3A394] mb-3 flex items-center gap-3">
                      <Phone className="w-3 h-3 group-hover:text-white transition-colors" /> Vías de Contacto
                    </div>
                    <div className="space-y-4 font-light text-lg text-slate-300 flex flex-col items-start mt-4">
                      <a href={`https://wa.me/${WHATSAPP_PHONE}`} className="hover:text-white transition-colors border-b border-slate-700 hover:border-white pb-0.5 inline-flex items-center gap-2">WhatsApp: {WHATSAPP_DISPLAY}</a>
                      <a href="tel:+59843154393" className="hover:text-white transition-colors border-b border-slate-700 hover:border-white pb-0.5 inline-flex items-center gap-2">Línea Fija: 4315 4393</a>
                      <a href="mailto:contacto@laaldeatala.com.uy" className="hover:text-white transition-colors border-b border-slate-700 hover:border-white pb-0.5 inline-flex items-center gap-2 mt-2">contacto@laaldeatala.com.uy</a>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Map Side */}
          <div className="w-full lg:w-1/2 h-[500px] lg:h-auto overflow-hidden relative order-1 lg:order-2 filter grayscale-[70%] hover:grayscale-0 transition-all duration-1000 bg-slate-900">
             <iframe
                  title="Ubicación de La Aldea en Google Maps"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.458!2d-55.76359424741334!3d-34.346943768995686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zLTM0LjM0Njk0NCwtNTUuNzYzNTk0!5e0!3m2!1ses!2suy!4v1"
                  width="100%"
                  height="100%"
                  className="absolute inset-0"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
          </div>
        </section>

      </main>
    </>
  );
}
