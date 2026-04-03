import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="La Aldea"
                className="h-10 w-auto sm:h-12 lg:h-14"
                style={{ maxWidth: '200px' }}
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-slate-600">
              Especialistas en bombas de agua, sistemas de riego e instalaciones hidráulicas
              en Tala, Canelones, Uruguay.
            </p>
            <div className="mt-5 flex gap-3">
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
                <Link href="/productos" className="text-sm text-slate-600 hover:text-blue-600">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="text-sm text-slate-600 hover:text-blue-600">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-slate-600 hover:text-blue-600">
                  Guías y Blog
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-sm text-slate-600 hover:text-blue-600">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-slate-600 hover:text-blue-600">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sm text-slate-600 hover:text-blue-600">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-sm text-slate-600 hover:text-blue-600">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica-de-devoluciones" className="text-sm text-slate-600 hover:text-blue-600">
                  Política de Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/mapa-del-sitio" className="sr-only">
                  Mapa del sitio
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-slate-900">Contacto</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:+${WHATSAPP_PHONE}`} className="text-sm hover:text-blue-600">{WHATSAPP_DISPLAY}</a>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+59843154393" className="text-sm hover:text-blue-600">4315 4393</a>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:contacto@laaldeatala.com.uy" className="text-sm hover:text-blue-600 break-all">
                  contacto@laaldeatala.com.uy
                </a>
              </li>
            </ul>
            <div className="mt-6 rounded-xl overflow-hidden shadow-sm border border-slate-200 h-32 brightness-90 hover:brightness-100 transition-all hidden md:block">
              <iframe
                title="Ubicacion de La Aldea en Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.458!2d-55.76359424741334!3d-34.346943768995686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zLTM0LjM0Njk0NCwtNTUuNzYzNTk0!5e0!3m2!1ses!2suy!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} La Aldea. Todos los derechos reservados.
          </p>
          <p className="text-sm text-slate-500">
            Tala, Canelones, Uruguay
          </p>
        </div>
      </div>
    </footer>
  );
}
