import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ChevronRight,
  Instagram,
  Facebook,
  ExternalLink,
} from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import QuoteRequestForm from '@/components/contact/QuoteRequestForm';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contacta a La Aldea en Tala, Canelones. WhatsApp, telefono, email y direccion. Asesoramiento tecnico sin costo en bombas de agua, riego y agroquimicos.',
  openGraph: {
    title: 'Contacto | La Aldea',
    description:
      'Contacta a La Aldea en Tala, Canelones. WhatsApp, telefono, email y direccion. Asesoramiento tecnico sin costo.',
    type: 'website',
    url: `${siteUrl}/contacto`,
    images: [
      {
        url: `${siteUrl}/assets/images/og-image.webp`,
        width: 1200,
        height: 630,
        alt: 'La Aldea — Tala, Uruguay',
      },
    ],
  },
  alternates: { canonical: `${siteUrl}/contacto` },
};

// app/contacto/page.tsx 
const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contacto — La Aldea",
  url: `${siteUrl}/contacto`,
  description: "Contactá a La Aldea en Tala, Canelones. Asesoramiento técnico sin costo en bombas de agua, riego y agroquímicos.",
  mainEntity: {
    "@type": "HardwareStore",
    "@id": "https://laaldeatala.com.uy/#business",
    name: "La Aldea",
    alternateName: "La Aldea Tala",
    priceRange: "$$",
    image: "https://laaldeatala.com.uy/assets/images/og-image.webp",
    logo: {
      "@type": "ImageObject",
      url: "https://laaldeatala.com.uy/assets/images/logo.webp",
      width: 260,
      height: 80,
    },
    telephone: `+${WHATSAPP_PHONE}`,
    email: "la.aldeamartinbetancor@gmail.com",
    url: "https://laaldeatala.com.uy",
    address: {
      "@type": "PostalAddress",
      streetAddress: "José Alonso y Trelles y Av Artigas",
      addressLocality: "Tala",
      addressRegion: "Canelones",
      postalCode: "91800",
      addressCountry: "UY",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -34.346943768995686,
      longitude: -55.76359424741334,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "12:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "14:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:30",
        closes: "12:00",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: `+${WHATSAPP_PHONE}`,
        contactType: "customer service",
        availableLanguage: "Spanish",
      },
    ],
    sameAs: [
      "https://www.instagram.com/laaldeatala/",
      "https://www.facebook.com/profile.php?id=61561171162882",
    ],
  },
};

export default function ContactoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      <Header />

      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <PageHeader 
          title="Contactanos" 
          description="Asesoramiento técnico sin costo. Escribinos por WhatsApp, llamanos o visitanos en nuestro local en Tala."
          className="text-center [&_div.max-w-4xl]:mx-auto"
        />

        <section className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main CTA — WhatsApp */}
            <div className="lg:col-span-2 space-y-6">
              {/* WhatsApp card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-[0_20px_50px_rgba(34,197,94,0.15)] hover:shadow-[0_30px_60px_rgba(34,197,94,0.3)] transition-all duration-500 hover:-translate-y-1 ring-1 ring-white/20">
                {/* Glow effects inside the panel */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-white/30 transition-colors duration-700" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/20 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-start h-full">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white/10 backdrop-blur-xl shadow-2xl border border-white/30 ring-4 ring-white/10">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">WhatsApp</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                        <p className="text-green-50/90 text-[15px] font-medium uppercase tracking-wider">Asistencia Inmediata</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-green-50 text-lg md:text-xl mb-10 leading-relaxed max-w-xl font-medium opacity-90">
                    ¿Buscás una solución específica? Respondemos en minutos. Manda tu consulta, planos o presupuesto y te asesoramos personalmente.
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20necesito%20asesoramiento%20sobre...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-whatsapp-source="contact_whatsapp_card"
                    className="mt-auto inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4.5 font-bold text-green-700 shadow-xl hover:bg-green-50 hover:gap-5 transition-all duration-300 active:scale-[0.98]"
                  >
                    <MessageCircle className="h-6 w-6" />
                    Abrir WhatsApp directo
                  </a>
                </div>
              </div>

              {/* Contact cards grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Phone */}
              <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Telefonos</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href={`tel:+${WHATSAPP_PHONE}`}
                        data-phone-source="contact_mobile_phone"
                        className="text-slate-700 hover:text-blue-600"
                      >
                        {WHATSAPP_DISPLAY}
                      </a>
                      <span className="text-slate-400 ml-1">(celular)</span>
                    </li>
                    <li>
                      <a
                        href="tel:+59843154393"
                        data-phone-source="contact_landline_phone"
                        className="text-slate-700 hover:text-blue-600"
                      >
                        4315 4393
                      </a>
                      <span className="text-slate-400 ml-1">(fijo)</span>
                    </li>
                  </ul>
                </div>

                {/* Email */}
              <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Email</h3>
                  </div>
                  <a
                    href="mailto:contacto@laaldeatala.com.uy"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    contacto@laaldeatala.com.uy
                  </a>
                  <p className="text-xs text-slate-400 mt-2">Respondemos en 24-48 horas habiles</p>
                </div>

                {/* Hours */}
              <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Horarios</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li className="flex justify-between">
                      <span>Lunes a Viernes</span>
                      <span className="font-medium text-slate-900">8:00-12:00 / 14:00-18:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sabados</span>
                      <span className="font-medium text-slate-900">8:30-12:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Domingos</span>
                      <span className="text-slate-400">Cerrado</span>
                    </li>
                  </ul>
                </div>

                {/* Social */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <ExternalLink className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Redes Sociales</h3>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="https://www.instagram.com/laaldeatala/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-pink-100 hover:text-pink-600 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61561171162882"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              <QuoteRequestForm />
            </div>

            {/* Sidebar — Address + Map */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Direccion</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Jose Alonso y Trelles y Av Artigas
                </p>
                <p className="text-sm text-slate-600">Tala, Canelones, Uruguay</p>
                <p className="text-sm text-slate-400">CP 91800</p>
                <a
                  href="https://maps.app.goo.gl/4oUish4o13iMrJ2c9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-3"
                >
                  Abrir en Google Maps <ChevronRight className="h-3 w-3" />
                </a>
              </div>

              <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm">
                <iframe
                  title="Ubicacion de La Aldea"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.458!2d-55.76359424741334!3d-34.346943768995686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zLTM0LjM0Njk0NCwtNTUuNzYzNTk0!5e0!3m2!1ses!2suy!4v1"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Accesos rapidos</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/productos" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
                      <ChevronRight className="h-3 w-3" /> Ver productos
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
                      <ChevronRight className="h-3 w-3" /> Preguntas frecuentes
                    </Link>
                  </li>
                  <li>
                    <Link href="/nosotros" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
                      <ChevronRight className="h-3 w-3" /> Sobre nosotros
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
