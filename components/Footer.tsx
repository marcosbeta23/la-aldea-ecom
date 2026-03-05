import Link from 'next/link';
import { Droplets, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">La Aldea</span>
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
                <Link href="/faq" className="text-sm text-slate-600 hover:text-blue-600">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-slate-600 hover:text-blue-600">
                  Blog
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
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-slate-900">Contacto</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+59892744725" className="text-sm hover:text-blue-600">+598 92 744 725</a>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+59843154393" className="text-sm hover:text-blue-600">4315 4393</a>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:la.aldeamartinbetancor@gmail.com" className="text-sm hover:text-blue-600 break-all">
                  la.aldeamartinbetancor@gmail.com
                </a>
              </li>
            </ul>
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
