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
    telephone: "+59892744725",
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
        telephone: "+59892744725",
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

      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12 lg:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contactanos</h1>
            <p className="mt-3 text-blue-100 max-w-xl mx-auto">
              Asesoramiento tecnico sin costo. Escribinos por WhatsApp, llamanos o visitanos en Tala.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main CTA — WhatsApp */}
            <div className="lg:col-span-2 space-y-6">
              {/* WhatsApp card */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">WhatsApp</h2>
                    <p className="text-green-100 text-sm">La forma mas rapida de contactarnos</p>
                  </div>
                </div>
                <p className="text-green-50 mb-6">
                  Respondemos en minutos durante horario comercial. Manda foto de tu proyecto,
                  consulta, presupuesto o lo que necesites.
                </p>
                <a
                  href="https://wa.me/59892744725?text=Hola,%20necesito%20asesoramiento%20sobre..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-green-700 shadow hover:bg-green-50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Abrir WhatsApp
                </a>
              </div>

              {/* Contact cards grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Phone */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Telefonos</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="tel:+59892744725" className="text-slate-700 hover:text-blue-600">
                        +598 92 744 725
                      </a>
                      <span className="text-slate-400 ml-1">(celular)</span>
                    </li>
                    <li>
                      <a href="tel:+59843154393" className="text-slate-700 hover:text-blue-600">
                        4315 4393
                      </a>
                      <span className="text-slate-400 ml-1">(fijo)</span>
                    </li>
                  </ul>
                </div>

                {/* Email */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
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
                <div className="bg-white rounded-xl border border-slate-200 p-5">
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

              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
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
