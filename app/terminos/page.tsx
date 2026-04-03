import type { Metadata } from 'next';
import Header from '@/components/Header';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso y compra en La Aldea. Información sobre envíos, devoluciones, garantías y métodos de pago.',
  alternates: {
    canonical: `${siteUrl}/terminos`,
  },
  openGraph: {
    title: 'Términos y Condiciones | La Aldea',
    description: 'Términos y condiciones de uso y compra en La Aldea Agroinsumos y Riego.',
    type: 'website',
    url: `${siteUrl}/terminos`,
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

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Términos y Condiciones</h1>
            <p className="text-slate-500 mb-8">Última actualización: Marzo 2026</p>

            <div className="prose prose-slate max-w-none">

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Información General</h2>
                <p className="text-slate-600 mb-4">
                  Este sitio web es operado por La Aldea Agroinsumos y Riego, con domicilio en
                  Tala, Canelones, Uruguay. Al acceder y utilizar este sitio, aceptás estos términos
                  y condiciones en su totalidad. Si no estás de acuerdo con alguna parte, no deberías
                  usar el sitio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Productos y Precios</h2>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Los precios están expresados en Pesos Uruguayos (UYU) e incluyen IVA</li>
                  <li>Nos reservamos el derecho de modificar precios sin previo aviso</li>
                  <li>Las imágenes son ilustrativas y pueden variar del producto real</li>
                  <li>La disponibilidad de productos está sujeta a stock</li>
                  <li>Nos reservamos el derecho de limitar cantidades por pedido</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Contenido Asistido por Inteligencia Artificial</h2>
                <p className="text-slate-600 mb-4">
                  Algunas descripciones de productos pueden haber sido redactadas o complementadas
                  con la asistencia de herramientas de inteligencia artificial, con el objetivo de
                  brindar información más detallada y útil sobre cada artículo.
                </p>
                <p className="text-slate-600 mb-4">
                  Si bien revisamos el contenido generado para asegurar su exactitud, te recomendamos:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>
                    Verificar las especificaciones técnicas críticas (dimensiones, presiones de
                    trabajo, materiales, compatibilidades) directamente en la ficha técnica del
                    fabricante antes de realizar tu compra
                  </li>
                  <li>
                    Consultarnos ante cualquier duda técnica específica antes de confirmar el pedido.
                    Estamos disponibles por WhatsApp y email para asesorarte
                  </li>
                </ul>
                <p className="text-slate-600 mt-4">
                  La Aldea no se responsabiliza por decisiones de compra basadas en descripciones
                  sin la verificación previa de las especificaciones técnicas del fabricante cuando
                  estas sean críticas para la aplicación prevista.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Proceso de Compra</h2>
                <ol className="list-decimal pl-6 text-slate-600 space-y-2">
                  <li>Agregás productos al carrito</li>
                  <li>Completás tus datos de envío y facturación</li>
                  <li>Elegís el método de pago (MercadoPago o transferencia bancaria)</li>
                  <li>Confirmás la compra</li>
                  <li>Recibís confirmación por email</li>
                </ol>
                <p className="text-slate-600 mt-4">
                  El contrato de compraventa se perfecciona cuando confirmamos la recepción del pago.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Métodos de Pago</h2>
                <p className="text-slate-600 mb-4">Aceptamos:</p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li><strong>MercadoPago:</strong> Tarjetas de crédito/débito y otros medios disponibles</li>
                  <li>
                    <strong>Transferencia bancaria:</strong> Al confirmar el pedido se envían los
                    datos bancarios por email
                  </li>
                </ul>
                <p className="text-slate-600 mt-4">
                  Los pedidos abonados por transferencia se procesan una vez confirmado el crédito
                  en cuenta (1–2 días hábiles).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Envíos</h2>
                <h3 className="text-lg font-medium text-slate-800 mb-2">Zonas de cobertura:</h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                  <li><strong>Zona local (Tala):</strong> Envío gratis o retiro en local</li>
                  <li><strong>Canelones:</strong> Envío por DAC o flete según producto</li>
                  <li><strong>Montevideo:</strong> Envío por DAC o flete según producto</li>
                  <li><strong>Interior:</strong> Disponible, consultar costo</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-800 mb-2">Tipos de envío:</h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                  <li><strong>DAC:</strong> Para productos pequeños/medianos. 2–5 días hábiles</li>
                  <li><strong>Flete:</strong> Para productos grandes o voluminosos. Coordinar entrega</li>
                  <li><strong>Retiro en local:</strong> Disponible en Tala, Canelones</li>
                </ul>

                <p className="text-slate-600">
                  Los plazos de entrega son estimados y pueden variar según disponibilidad y zona.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Devoluciones y Cambios</h2>
                <h3 className="text-lg font-medium text-slate-800 mb-2">Derecho de arrepentimiento:</h3>
                <p className="text-slate-600 mb-4">
                  Tenés 7 días corridos desde la recepción para arrepentirte de la compra, siempre que:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                  <li>El producto esté sin usar y en su empaque original</li>
                  <li>No sea un producto personalizado o cortado a medida</li>
                  <li>No sea un químico o producto sellado por razones de higiene o seguridad</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-800 mb-2">Productos defectuosos:</h3>
                <p className="text-slate-600">
                  Si recibís un producto defectuoso o dañado durante el transporte, contactanos
                  dentro de las 48 horas de recibido. Evaluaremos el caso y ofreceremos cambio,
                  reparación o reembolso según corresponda.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Garantías</h2>
                <p className="text-slate-600 mb-4">
                  Los productos cuentan con la garantía del fabricante según corresponda.
                  Para hacer uso de la garantía:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Conservá la factura de compra</li>
                  <li>Contactanos indicando el problema con detalle</li>
                  <li>Seguir las instrucciones de uso del fabricante</li>
                </ul>
                <p className="text-slate-600 mt-4">
                  La garantía no cubre daños por mal uso, desgaste normal o modificaciones no
                  autorizadas.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Facturación</h2>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li><strong>Consumidor final:</strong> Se emite e-ticket automáticamente</li>
                  <li>
                    <strong>Con RUT:</strong> Indicá tus datos fiscales al momento de la compra
                    para recibir factura a nombre de tu empresa o actividad
                  </li>
                </ul>
                <p className="text-slate-600 mt-4">
                  Las facturas se envían por email una vez procesada la compra.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Propiedad Intelectual</h2>
                <p className="text-slate-600">
                  Todo el contenido del sitio (textos, imágenes, logos, diseño) es propiedad de
                  La Aldea o sus proveedores y está protegido por derechos de autor. No se permite
                  su reproducción, distribución o uso comercial sin autorización expresa por escrito.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Limitación de Responsabilidad</h2>
                <p className="text-slate-600">
                  La Aldea no será responsable por daños indirectos, pérdida de datos, lucro cesante
                  o cualquier otro daño derivado del uso de nuestros productos más allá del valor
                  abonado en la compra. Esto no afecta tus derechos legales como consumidor bajo
                  la legislación uruguaya vigente.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Modificaciones</h2>
                <p className="text-slate-600">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento.
                  Los cambios entran en vigencia al publicarse en el sitio con la fecha de
                  actualización correspondiente. El uso continuado del sitio implica aceptación
                  de los nuevos términos.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">13. Ley Aplicable</h2>
                <p className="text-slate-600">
                  Estos términos se rigen por las leyes de la República Oriental del Uruguay,
                  incluyendo la Ley de Relaciones de Consumo N.° 17.250 y la Ley de Protección de
                  Datos Personales N.° 18.331. Cualquier disputa será sometida a los tribunales
                  competentes del departamento de Canelones, Uruguay.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">14. Contacto</h2>
                <p className="text-slate-600 mb-4">
                  Para consultas sobre estos términos o sobre cualquier aspecto de tu compra:
                </p>
                <ul className="list-none text-slate-600 space-y-1">
                  <li><strong>Email:</strong> info@laaldeatala.com.uy</li>
                  <li><strong>WhatsApp:</strong> 099 123 456</li>
                  <li><strong>Dirección:</strong> Tala, Canelones, Uruguay</li>
                </ul>
              </section>

            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-wrap gap-4">
              <Link href="/privacidad" className="text-blue-600 hover:text-blue-700 font-medium">
                Ver Política de Privacidad
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