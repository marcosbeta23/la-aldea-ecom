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
            <p className="text-slate-500 mb-8">Última actualización: Febrero 2026</p>
            
            <div className="prose prose-slate max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Introducción</h2>
                <p className="text-slate-600 mb-4">
                  En La Aldea Agroinsumos y Riego (&quot;La Aldea&quot;, &quot;nosotros&quot;, &quot;nuestro&quot;), respetamos tu privacidad 
                  y nos comprometemos a proteger tus datos personales. Esta política de privacidad explica cómo 
                  recopilamos, usamos y protegemos tu información cuando utilizas nuestro sitio web laaldeatala.com.uy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Datos que Recopilamos</h2>
                <p className="text-slate-600 mb-4">Recopilamos la siguiente información cuando realizás una compra o interactuás con nuestro sitio:</p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li><strong>Datos de contacto:</strong> Nombre, email, teléfono</li>
                  <li><strong>Datos de envío:</strong> Dirección, ciudad, departamento</li>
                  <li><strong>Datos de facturación:</strong> RUT y razón social (si solicitás factura)</li>
                  <li><strong>Datos de pago:</strong> No almacenamos datos de tarjetas. Los pagos son procesados de forma segura por MercadoPago</li>
                  <li><strong>Datos de uso:</strong> Páginas visitadas, productos vistos, para mejorar tu experiencia</li>
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
                  <li>Mejorar nuestro sitio web y servicios</li>
                  <li>Cumplir con obligaciones legales y fiscales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Compartir Datos</h2>
                <p className="text-slate-600 mb-4">
                  No vendemos ni compartimos tus datos personales con terceros para fines de marketing. 
                  Podemos compartir información con:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li><strong>MercadoPago:</strong> Para procesar pagos de forma segura</li>
                  <li><strong>Servicios de envío:</strong> Para entregar tus pedidos (DAC, flete)</li>
                  <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Seguridad</h2>
                <p className="text-slate-600 mb-4">
                  Implementamos medidas de seguridad para proteger tus datos:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Conexión segura HTTPS en todo el sitio</li>
                  <li>Los pagos se procesan a través de MercadoPago (certificado PCI DSS)</li>
                  <li>Acceso restringido a datos personales solo a personal autorizado</li>
                  <li>Base de datos protegida con autenticación y encriptación</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Tus Derechos</h2>
                <p className="text-slate-600 mb-4">
                  Tenés derecho a:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Acceder a tus datos personales</li>
                  <li>Solicitar corrección de datos incorrectos</li>
                  <li>Solicitar eliminación de tus datos (sujeto a obligaciones legales)</li>
                  <li>Oponerte al uso de tus datos para ciertos fines</li>
                </ul>
                <p className="text-slate-600 mt-4">
                  Para ejercer estos derechos, contactanos a: info@laaldeatala.com.uy
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Cookies</h2>
                <p className="text-slate-600 mb-4">
                  Utilizamos cookies esenciales para el funcionamiento del sitio (carrito de compras, sesión).
                  También usamos Google Analytics para entender cómo usás el sitio y mejorar la experiencia.
                  Podés configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Retención de Datos</h2>
                <p className="text-slate-600 mb-4">
                  Conservamos tus datos de pedidos por un mínimo de 5 años para cumplir con obligaciones fiscales. 
                  Los datos de cuenta se mantienen mientras tu cuenta esté activa.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Cambios a esta Política</h2>
                <p className="text-slate-600 mb-4">
                  Podemos actualizar esta política ocasionalmente. Te notificaremos cambios significativos 
                  publicando la nueva versión en el sitio con la fecha de actualización.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Contacto</h2>
                <p className="text-slate-600 mb-4">
                  Para consultas sobre privacidad, contactanos:
                </p>
                <ul className="list-none text-slate-600 space-y-1">
                  <li><strong>Email:</strong> info@laaldeatala.com.uy</li>
                  <li><strong>WhatsApp:</strong> 099 123 456</li>
                  <li><strong>Dirección:</strong> Tala, Canelones, Uruguay</li>
                </ul>
              </section>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
