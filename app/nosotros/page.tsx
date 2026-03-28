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
    'Conoce La Aldea: mas de 25 años en Tala, Canelones, especializados en sistemas de riego, bombas de agua, agroquimicos y soluciones hidricas para Uruguay.',
  openGraph: {
    title: 'Sobre Nosotros | La Aldea',
    description:
      'Conoce La Aldea: mas de 25 años en Tala, Canelones, especializados en sistemas de riego, bombas de agua, agroquimicos y soluciones hidricas para Uruguay.',
    type: 'website',
    url: `${siteUrl}/nosotros`,
  },
  alternates: { canonical: `${siteUrl}/nosotros` },
};

const values = [
  {
    icon: Sparkles,
    title: 'Experiencia Tecnica',
    description: 'Mas de 25 años asesorando sobre bombas, riego e instalaciones hidricas nos respaldan.',
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
  foundingDate: '1999',
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
      telephone: '+${WHATSAPP_PHONE}',
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
    'https://wa.me/${WHATSAPP_PHONE}',
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

      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        {/* Hero */}
        <PageHeader
          badge="Desde el 2000 en Tala, Canelones"
          title="Conocé La Aldea"
          description="Más de 25 años ofreciendo soluciones en riego, bombas de agua, agroquímicos y productos hídricos para productores, hogares y empresas de todo Uruguay."
          className="text-center [&_div.max-w-4xl]:mx-auto [&_.inline-flex]:mx-auto [&_p]:mx-auto"
        />

        {/* Stats bar */}
        <section className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200">
              {[
                { value: '25+', label: 'Años de Experiencia' },
                { value: '500+', label: 'Proyectos Realizados' },
                { value: '12', label: 'Marcas Asociadas' },
                { value: '19', label: 'Departamentos Cubiertos' },
              ].map((stat, i) => (
                <div key={i} className="py-6 text-center bg-white">
                  <p className="text-2xl font-bold text-blue-600 md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story + Photo */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              {/* Photo */}
              <div className="relative overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 shadow-xl">
                  <Image
                    src="/assets/images/laaldeaedificio.webp"
                    alt="La Aldea - Local comercial en Tala, Canelones, Uruguay"
                    width={800}
                    height={600}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 right-2 flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl sm:h-28 sm:w-28 sm:right-0 lg:-right-4 lg:h-32 lg:w-32">
                  <span className="text-2xl font-bold sm:text-3xl lg:text-4xl">25+</span>
                  <span className="text-[10px] font-medium sm:text-xs lg:text-sm">Años</span>
                </div>
              </div>

              {/* Text */}
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                  Nuestra Historia
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  La Aldea
                </h2>
                <p className="mt-6 text-slate-600 leading-relaxed">
                  La Aldea nacio en el 2000 de la mano de <strong>Martin Betancor Peregalli</strong>, con
                  la idea de ofrecer soluciones hidricas de calidad a los productores de Tala y
                  alrededores. Lo que empezo como una barraca de insumos agricolas fue creciendo con
                  el compromiso de dar asesoramiento tecnico real, no solo vender productos.
                </p>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  Con el tiempo, sumamos lineas completas de riego, bombas de agua, herramientas, agroquimicos,
                  productos para piscinas y drogueria. Hoy atendemos desde Tala a todo el
                  pais, con la misma filosofia de trabajo: escuchar la necesidad del cliente y
                  recomendar la solucion que realmente va a funcionar.
                  Ese es nuestro diferencial: <strong>honestidad tecnica</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                Por que elegirnos
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Nuestros valores
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <value.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we do */}
        <section className="bg-white py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                Servicios
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                ¿Que hacemos?
              </h2>
              <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
                Vendemos productos, pero sobre todo brindamos soluciones. Desde diseñar un sistema de riego hasta
                elegir el agroquimico correcto para tu cultivo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s, i) => (
                <Link
                  key={i}
                  href="/productos"
                  className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <s.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-slate-900 text-sm">{s.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{s.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Location / Contact Info */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Info */}
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                  Visitanos
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Donde encontrarnos
                </h2>

                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Direccion</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Jose Alonso y Trelles y Av Artigas, Tala, Canelones, Uruguay (91800)
                      </p>
                      <a
                        href="https://maps.app.goo.gl/4oUish4o13iMrJ2c9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                      >
                        Ver en Google Maps <ChevronRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Horarios</h3>
                      <ul className="text-sm text-slate-600 mt-1 space-y-1">
                        <li>Lunes a Viernes: 8:00 - 12:00 y 14:00 - 18:00</li>
                        <li>Sabados: 8:30 - 12:00</li>
                        <li>Domingos y feriados: cerrado</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Telefonos</h3>
                      <ul className="text-sm text-slate-600 mt-1 space-y-1">
                        <li>
                          <a href="tel:+${WHATSAPP_PHONE}" className="hover:text-blue-600">{WHATSAPP_DISPLAY}</a>
                          <span className="text-slate-400 ml-1">(celular / WhatsApp)</span>
                        </li>
                        <li>
                          <a href="tel:+59843154393" className="hover:text-blue-600">4315 4393</a>
                          <span className="text-slate-400 ml-1">(fijo)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Email</h3>
                      <a href="mailto:contacto@laaldeatala.com.uy" className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block">
                        contacto@laaldeatala.com.uy
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <iframe
                  title="Ubicacion de La Aldea en Google Maps"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.458!2d-55.76359424741334!3d-34.346943768995686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zLTM0LjM0Njk0NCwtNTUuNzYzNTk0!5e0!3m2!1ses!2suy!4v1"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 lg:pb-20">
          <div className="container mx-auto px-4">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 text-center sm:p-8 md:p-16">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
              <div className="relative">
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  ¿Tenes un proyecto? Te ayudamos
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-blue-100">
                  Asesoramiento tecnico sin cargo. Contanos lo que necesitas y te recomendamos la
                  mejor solucion.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <a
                    href="https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20necesito%20asesoramiento%20sobre..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-blue-700 shadow-lg hover:bg-blue-50 transition-colors sm:px-8"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Escribinos por WhatsApp
                  </a>
                  <Link
                    href="/productos"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 px-6 py-3.5 font-semibold text-white backdrop-blur hover:bg-white/10 transition-colors sm:px-8"
                  >
                    Ver Productos
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
