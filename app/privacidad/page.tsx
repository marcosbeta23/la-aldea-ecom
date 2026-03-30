import type { Metadata } from 'next';
import Header from '@/components/Header';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad | La Aldea',
  description: 'Política de privacidad y protección de datos personales de La Aldea.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
            <p className="text-slate-500 mb-8">Última actualización: Marzo 2026</p>

            <div className="prose prose-slate max-w-none">

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Introducción</h2>
                <p className="text-slate-600 mb-4">
                  En La Aldea Agroinsumos y Riego (&quot;La Aldea&quot;, &quot;nosotros&quot;, &quot;nuestro&quot;), respetamos tu
                  privacidad y nos comprometemos a proteger tus datos personales. Esta política explica
                  cómo recopilamos, usamos y protegemos tu información cuando utilizás nuestro sitio web
                  laaldeatala.com.uy, de conformidad con la Ley N.° 18.331 de Protección de Datos
                  Personales de la República Oriental del Uruguay.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Datos que Recopilamos</h2>
                <p className="text-slate-600 mb-4">
                  Recopilamos la siguiente información cuando realizás una compra o interactuás con nuestro sitio:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li><strong>Datos de contacto:</strong> Nombre, email, teléfono</li>
                  <li><strong>Datos de envío:</strong> Dirección, ciudad, departamento</li>
                  <li><strong>Datos de facturación:</strong> RUT y razón social (si solicitás factura)</li>
                  <li>
                    <strong>Datos de pago:</strong> No almacenamos datos de tarjetas. Los pagos son
                    procesados de forma segura por MercadoPago
                  </li>
                  <li>
                    <strong>Datos de uso y comportamiento:</strong> Páginas visitadas, productos vistos,
                    búsquedas realizadas, tiempo en el sitio y eventos de navegación. Estos datos se
                    recopilan de forma agregada o seudónima para mejorar la experiencia y el funcionamiento
                    del sitio
                  </li>
                  <li>
                    <strong>Datos técnicos de diagnóstico:</strong> Información sobre errores,
                    rendimiento del sitio y tipo de dispositivo/navegador, utilizados exclusivamente
                    para detectar y corregir problemas técnicos
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Uso de los Datos</h2>
                <p className="text-slate-600 mb-4">Utilizamos tus datos para:</p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Procesar y entregar tus pedidos</li>
                  <li>Enviarte confirmaciones y actualizaciones de tu compra por email</li>
                  <li>Emitir facturas cuando las solicites</li>
                  <li>Responder a tus consultas</li>
                  <li>Mejorar nuestro sitio web, funcionalidades y catálogo de productos</li>
                  <li>Detectar y corregir errores técnicos que afecten tu experiencia</li>
                  <li>Cumplir con obligaciones legales y fiscales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Proveedores de Servicio</h2>
                <p className="text-slate-600 mb-4">
                  Para operar el sitio y brindarte el servicio, trabajamos con los siguientes
                  proveedores de confianza. No vendemos ni compartimos tus datos personales
                  con terceros para fines de marketing:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>
                    <strong>MercadoPago:</strong> Procesamiento seguro de pagos (certificado PCI DSS)
                  </li>
                  <li>
                    <strong>Servicios de envío (DAC, flete):</strong> Datos de entrega necesarios
                    para coordinar la logística de tu pedido
                  </li>
                  <li>
                    <strong>Brevo (ex Sendinblue):</strong> Plataforma de envío de emails transaccionales.
                    Recibe tu dirección de correo para enviarte confirmaciones de pedido,
                    actualizaciones de estado y notificaciones relacionadas con tu compra
                  </li>
                  <li>
                    <strong>PostHog:</strong> Herramienta de análisis de comportamiento en el sitio.
                    Recopila datos de navegación de forma seudónima (páginas visitadas, eventos de
                    interacción) para ayudarnos a entender cómo se usa el sitio y mejorar la experiencia
                  </li>
                  <li>
                    <strong>Google Analytics 4 (GA4):</strong> Herramienta de análisis de tráfico web.
                    Recopila datos estadísticos agregados de visitas y comportamiento de navegación
                  </li>
                  <li>
                    <strong>Sentry:</strong> Servicio de monitoreo de errores técnicos. Recopila
                    información sobre fallos en el sitio (mensajes de error, traza técnica, tipo de
                    dispositivo) exclusivamente para permitirnos detectar y solucionar problemas.
                    No recopila datos personales identificables
                  </li>
                  <li>
                    <strong>Autoridades competentes:</strong> Cuando sea requerido por ley o
                    resolución judicial
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Seguridad</h2>
                <p className="text-slate-600 mb-4">
                  Implementamos medidas técnicas y organizativas para proteger tus datos:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Conexión segura HTTPS en todo el sitio (TLS)</li>
                  <li>Los pagos se procesan a través de MercadoPago (certificado PCI DSS)</li>
                  <li>Acceso restringido a datos personales solo a personal autorizado</li>
                  <li>Base de datos protegida con autenticación, encriptación en tránsito y en reposo</li>
                  <li>Protección ante tráfico malicioso mediante Cloudflare</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Tus Derechos</h2>
                <p className="text-slate-600 mb-4">
                  De acuerdo con la Ley 18.331, tenés derecho a:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Acceder a tus datos personales que tengamos registrados</li>
                  <li>Solicitar la rectificación de datos incorrectos o desactualizados</li>
                  <li>Solicitar la eliminación de tus datos (sujeto a obligaciones legales vigentes)</li>
                  <li>Oponerte al uso de tus datos para análisis de comportamiento o marketing</li>
                </ul>
                <p className="text-slate-600 mt-4">
                  Para ejercer estos derechos, contactanos a:{' '}
                  <a href="mailto:info@laaldeatala.com.uy" className="text-blue-600 hover:underline">
                    info@laaldeatala.com.uy
                  </a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Cookies y Tecnologías de Seguimiento</h2>
                <p className="text-slate-600 mb-4">
                  Utilizamos los siguientes tipos de cookies y tecnologías similares:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>
                    <strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico
                    del sitio (carrito de compras, preferencias de sesión). No pueden desactivarse
                  </li>
                  <li>
                    <strong>Cookies de análisis (PostHog y Google Analytics):</strong> Nos ayudan a
                    entender cómo los visitantes usan el sitio, qué productos generan más interés y
                    cómo mejorar la experiencia general. Los datos se procesan de forma agregada o
                    seudónima
                  </li>
                  <li>
                    <strong>Cookies de diagnóstico (Sentry):</strong> Registran errores técnicos
                    para permitirnos detectar y corregir problemas. No contienen datos personales
                    identificables
                  </li>
                </ul>
                <p className="text-slate-600 mt-4">
                  Al continuar usando el sitio, aceptás el uso de estas cookies. Podés configurar
                  tu navegador para bloquear o eliminar cookies, aunque esto puede afectar algunas
                  funcionalidades del carrito y el proceso de compra.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Retención de Datos</h2>
                <p className="text-slate-600 mb-4">
                  Conservamos tus datos de pedidos e información fiscal por un mínimo de 5 años para
                  cumplir con las obligaciones de la DGI y la legislación vigente. Los datos de
                  análisis de comportamiento (PostHog, GA4) se retienen según las políticas de cada
                  proveedor, generalmente entre 12 y 24 meses.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Cambios a esta Política</h2>
                <p className="text-slate-600 mb-4">
                  Podemos actualizar esta política ocasionalmente. Te notificaremos cambios
                  significativos publicando la nueva versión en el sitio con la fecha de actualización.
                  El uso continuado del sitio tras la publicación implica aceptación de los cambios.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Contacto</h2>
                <p className="text-slate-600 mb-4">
                  Para consultas sobre privacidad o para ejercer tus derechos:
                </p>
                <ul className="list-none text-slate-600 space-y-1">
                  <li><strong>Email:</strong> info@laaldeatala.com.uy</li>
                  <li><strong>WhatsApp:</strong> 099 123 456</li>
                  <li><strong>Dirección:</strong> Tala, Canelones, Uruguay</li>
                </ul>
              </section>

            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
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