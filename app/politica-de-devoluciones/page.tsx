import type { Metadata } from 'next';
import Header from '@/components/Header';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export const metadata: Metadata = {
  title: 'Política de Devoluciones',
  description:
    'Política de devoluciones, cambios y garantías de La Aldea. Plazos y condiciones para productos defectuosos y devoluciones por arrepentimiento.',
  alternates: {
    canonical: `${siteUrl}/politica-de-devoluciones`,
  },
  openGraph: {
    title: 'Política de Devoluciones | La Aldea',
    description: 'Política de devoluciones y garantías de La Aldea Agroinsumos y Riego.',
    type: 'website',
    url: `${siteUrl}/politica-de-devoluciones`,
    images: [
      {
        url: `${siteUrl}/assets/images/og-image.webp`,
        width: 1200,
        height: 630,
        alt: 'La Aldea - Tala, Uruguay',
      },
    ],
  },
};

export default function PoliticaDevolucionesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Devoluciones</h1>
            <p className="text-slate-500 mb-8">Última actualización: abril de 2026</p>

            <section className="space-y-6 text-base leading-relaxed text-slate-600">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">1. Productos defectuosos</h2>
                <p>
                  Aceptamos devoluciones de productos que presenten defectos de fabricación
                  o daños producidos durante el transporte. El cliente deberá comunicarse
                  con nosotros dentro de los <strong>7 días corridos</strong> desde la
                  recepción del pedido, indicando el problema y adjuntando fotografías del
                  producto.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">2. Cómo iniciar una devolución</h2>
                <p>
                  Para solicitar una devolución, envíe un correo a{' '}
                  <a href="mailto:ventas@laaldeatala.com.uy" className="underline text-blue-600 hover:text-blue-700">
                    ventas@laaldeatala.com.uy
                  </a>{' '}
                  con:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Número de pedido</li>
                  <li>Descripción del defecto o problema</li>
                  <li>Fotografías del producto y del embalaje</li>
                </ul>
                <p className="mt-2">
                  Nos comunicaremos dentro de las <strong>48 horas hábiles</strong> para
                  coordinar el proceso.
                </p>
                <p className="mt-2">
                  El producto puede devolverse de las siguientes formas:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Personalmente en nuestro local en Tala, Canelones</li>
                  <li>En un punto de entrega habilitado del servicio de mensajería</li>
                </ul>
                <p className="mt-2">
                  Una vez recibido e inspeccionado el producto, el reembolso se procesará
                  dentro de los <strong>7 días hábiles</strong>.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">3. Devoluciones por arrepentimiento</h2>
                <p>
                  Aceptamos devoluciones por arrepentimiento siempre que el producto se encuentre{' '}
                  <strong>en su embalaje original, sin abrir y sin uso</strong>. El cliente deberá
                  comunicarse dentro de los <strong>7 días corridos</strong> desde la recepción
                  del pedido.
                </p>
                <p className="mt-2">
                  No se aceptan devoluciones de productos que hayan sido abiertos, utilizados
                  o que no conserven su embalaje original.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">4. Cambios de producto</h2>
                <p>
                  Aceptamos cambios de producto siempre que se cumplan los mismos requisitos
                  que para las devoluciones: el producto debe estar{' '}
                  <strong>en su embalaje original, sin abrir y sin uso</strong>, dentro de los{' '}
                  <strong>7 días corridos</strong> desde la recepción del pedido.
                </p>
                <p className="mt-2">
                  El cliente puede elegir cualquier otro producto disponible en nuestro catálogo.
                  En caso de diferencia de precio:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Si el nuevo producto es más caro, el cliente abona la diferencia.</li>
                  <li>Si el nuevo producto es más barato, devolvemos la diferencia al cliente.</li>
                </ul>
                <p className="mt-2">
                  Para iniciar un cambio, contáctenos a{' '}
                  <a href="mailto:ventas@laaldeatala.com.uy" className="underline text-blue-600 hover:text-blue-700">
                    ventas@laaldeatala.com.uy
                  </a>{' '}
                  indicando el número de pedido y el producto que desea recibir a cambio.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">5. Garantía legal</h2>
                <p>
                  Todos nuestros productos cuentan con la garantía mínima legal establecida
                  por la legislación uruguaya vigente. En caso de productos con garantía de
                  fabricante, coordinaremos el contacto con el proveedor correspondiente.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">6. Costos de envío</h2>
                <p>
                  En caso de devolución por defecto de fabricación o error nuestro, los
                  costos de envío de retorno corren por nuestra cuenta. En otros casos,
                  el costo es responsabilidad del cliente.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">7. Contacto</h2>
                <p>
                  Para cualquier consulta sobre devoluciones:{' '}
                  <a href="mailto:ventas@laaldeatala.com.uy" className="underline text-blue-600 hover:text-blue-700">
                    ventas@laaldeatala.com.uy
                  </a>
                </p>
              </div>
            </section>

            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-wrap gap-4">
              <Link href="/terminos" className="text-blue-600 hover:text-blue-700 font-medium">
                Ver Términos y Condiciones
              </Link>
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}