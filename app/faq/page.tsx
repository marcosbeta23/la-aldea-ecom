import type { Metadata } from 'next';
import Header from '@/components/Header';
import FAQAccordion from '@/components/faq/FAQAccordion';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { HelpCircle, Phone, MessageCircle, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FAQ_ARTICLES } from '@/lib/faq-articles';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes y Guias',
  description: 'Guias tecnicas y respuestas a preguntas frecuentes sobre bombas de agua, sistemas de riego, instalaciones hidraulicas, piscinas, filtros y mas. La Aldea - Tala, Uruguay.',
  openGraph: {
    title: 'Preguntas Frecuentes y Guias | La Aldea',
    description: 'Guias tecnicas y respuestas a preguntas frecuentes sobre bombas de agua, sistemas de riego, instalaciones hidraulicas y mas.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://laaldeatala.com.uy/faq',
  },
};

// FAQ data organized by category — answers include inline links to articles
const faqData = {
  instalaciones: {
    title: 'Instalaciones Hidraulicas',
    icon: '🔧',
    faqs: [
      {
        question: '¿Que tipos de instalaciones hidraulicas ofrece La Aldea?',
        answer: 'Ofrecemos instalaciones completas de sistemas hidraulicos residenciales, comerciales y agricolas, incluyendo tanques de almacenamiento, cañerias, bombas de agua y sistemas de automatizacion. Lee nuestra guia completa de instalaciones hidraulicas para mas detalles.',
      },
      {
        question: '¿En que zonas realizan instalaciones?',
        answer: 'Realizamos instalaciones en todo Uruguay. Nuestro equipo tecnico se desplaza a cualquier punto del pais para garantizar una instalacion profesional.',
      },
      {
        question: '¿Ofrecen garantia en las instalaciones?',
        answer: 'Si, todas nuestras instalaciones cuentan con garantia. El periodo de garantia varia segun el tipo de trabajo realizado. Consulta con nuestro equipo para mas detalles.',
      },
    ],
  },
  riego: {
    title: 'Sistemas de Riego',
    icon: '💧',
    faqs: [
      {
        question: '¿Como se realiza el diseño e instalacion de un sistema de riego?',
        answer: 'Evaluamos el terreno, determinamos necesidades hidricas, diseñamos el sistema mas eficiente (goteo, aspersion o microaspersion) y realizamos la instalacion completa con garantia. Lee nuestra guia de diseño e instalacion de riego para conocer el proceso completo.',
      },
      {
        question: '¿Que beneficios tiene un sistema de riego bien instalado?',
        answer: 'Ahorro de hasta 50% de agua, distribucion uniforme, automatizacion programable, reduccion de mano de obra y mejor desarrollo de cultivos. Conoce todos los beneficios del riego en nuestra guia especializada.',
      },
      {
        question: '¿Que tipo de riego es mejor para mi terreno?',
        answer: 'Depende del cultivo, tamaño del terreno y disponibilidad de agua. El riego por goteo es ideal para huertos y viñedos, mientras que la aspersion es mejor para praderas y cultivos extensivos. Te asesoramos sin costo.',
      },
    ],
  },
  bombas: {
    title: 'Bombas de Agua',
    icon: '⚡',
    faqs: [
      {
        question: '¿Que diferencia hay entre una bomba sumergible y una bomba de superficie?',
        answer: 'Las bombas sumergibles van dentro del agua (pozos, tanques) y son mas eficientes para grandes profundidades. Las de superficie van fuera del agua y son ideales para cisternas, rios o arroyos poco profundos. Lee nuestra guia completa de tipos de bombas para una comparacion detallada.',
      },
      {
        question: '¿Como elegir la bomba de agua adecuada?',
        answer: 'Debes considerar: profundidad del agua, caudal necesario (litros/hora), presion requerida, tipo de uso (domestico/agricola) y alimentacion electrica disponible. Consulta nuestra guia de seleccion de bombas para un analisis tecnico completo.',
      },
      {
        question: '¿Ofrecen servicio tecnico para bombas?',
        answer: 'Si, contamos con servicio tecnico especializado para reparacion y mantenimiento de bombas de todas las marcas que vendemos.',
      },
    ],
  },
  envios: {
    title: 'Envios y Entregas',
    icon: '🚚',
    faqs: [
      {
        question: '¿Hacen envios a todo Uruguay?',
        answer: 'Si, enviamos productos a todo el pais. Los tiempos de entrega varian segun la zona. Montevideo y areas cercanas: 24-48 horas. Interior: 3-5 dias habiles.',
      },
      {
        question: '¿Cuanto cuesta el envio?',
        answer: 'El costo de envio depende del peso, volumen y destino. Para productos pequeños usamos DAC o similar. Para equipos pesados (bombas, tanques) coordinamos envios especiales.',
      },
      {
        question: '¿Puedo retirar en el local?',
        answer: 'Si, podes retirar tu pedido sin costo en nuestro local de Tala. Te notificamos cuando este listo para retirar.',
      },
    ],
  },
  pagos: {
    title: 'Formas de Pago',
    icon: '💳',
    faqs: [
      {
        question: '¿Que formas de pago aceptan?',
        answer: 'Aceptamos MercadoPago (tarjetas de credito/debito), transferencia bancaria y efectivo en el local. Para compras online, el pago se procesa de forma segura a traves de MercadoPago.',
      },
      {
        question: '¿Puedo pagar en cuotas?',
        answer: 'Si, a traves de MercadoPago podes pagar en hasta 12 cuotas con tarjeta de credito. El numero de cuotas disponibles depende de tu banco.',
      },
      {
        question: '¿Emiten factura?',
        answer: 'Si, emitimos factura electronica (e-factura) por todas las compras. Indica tus datos fiscales al momento de la compra.',
      },
    ],
  },
  productos: {
    title: 'Productos',
    icon: '📦',
    faqs: [
      {
        question: '¿Que marcas de productos manejan?',
        answer: 'Trabajamos con marcas lideres: Gianni, DIU, Tigre, Nicoll, Hidroservice, Pacifil, Cablinur, Lesa, Ramasil, Balaguer, Armco y Lusqtoff.',
      },
      {
        question: '¿Los productos tienen garantia?',
        answer: 'Si, todos los productos tienen la garantia del fabricante. El periodo varia segun el producto y la marca. Guarda tu factura como comprobante.',
      },
      {
        question: '¿Puedo devolver un producto?',
        answer: 'Si, aceptamos devoluciones dentro de los 7 dias de recibido el producto, siempre que este sin uso y en su empaque original. Contactanos para coordinar.',
      },
    ],
  },
  riegoAgricola: {
    title: 'Riego Agricola',
    icon: '🌾',
    faqs: [
      {
        question: '¿Cuanta agua necesita una hectarea de cultivo?',
        answer: 'Depende del cultivo: una hectarea de soja necesita entre 3.000 y 5.000 m3 por temporada, mientras que la papa puede requerir 4.000 a 6.000 m3. Con riego por goteo se reduce el consumo un 30-40% frente a la aspersion. Consulta nuestra guia de calculo de agua por hectarea.',
      },
      {
        question: '¿Cual es la diferencia entre riego por goteo y aspersion?',
        answer: 'El goteo aplica agua directamente en la zona radicular con 90-95% de eficiencia, ideal para hortalizas, frutales y viñedos. La aspersion distribuye agua en area extensiva con 70-85% de eficiencia, ideal para praderas y cultivos extensivos. Lee nuestra comparativa completa de goteo vs aspersion.',
      },
      {
        question: '¿Instalan sistemas de riego en todo Uruguay?',
        answer: 'Si, instalamos en todo el territorio uruguayo. Atendemos especialmente Canelones, Montevideo, San Jose, Maldonado y Soriano. Para zonas del interior coordinamos con anticipacion. El asesoramiento inicial es sin costo.',
      },
    ],
  },
  drogueria: {
    title: 'Drogueria',
    icon: '🧴',
    faqs: [
      {
        question: '¿Que productos de drogueria venden?',
        answer: 'Vendemos productos de limpieza e higiene del hogar, cuidado personal y capilar, agroquimicos, productos para piscinas y tratamiento de agua, pinturas y solventes, equipos de proteccion personal (EPP) y productos quimicos industriales.',
      },
      {
        question: '¿Cual es la diferencia entre una drogueria y una farmacia?',
        answer: 'Una drogueria vende productos de limpieza, higiene, agroquimicos y quimicos industriales, pero no despacha medicamentos con receta medica. Las farmacias estan habilitadas por el MSP para dispensar medicamentos. En La Aldea somos una drogueria industrial y de consumo.',
      },
      {
        question: '¿Los productos quimicos tienen ficha de seguridad?',
        answer: 'Si, todos los productos quimicos que vendemos incluyen o tienen disponible su Ficha de Datos de Seguridad (SDS/FDS). Te la facilitamos al momento de la compra o por WhatsApp. Lee nuestra guia de seguridad para productos quimicos.',
      },
    ],
  },
  agroquimicos: {
    title: 'Agroquimicos',
    icon: '🌿',
    faqs: [
      {
        question: '¿Que herbicidas venden para cultivos en Uruguay?',
        answer: 'Tenemos herbicidas selectivos y totales para soja, maiz, papa, hortalizas y praderas, con stock permanente y envio a todo Uruguay. Consultanos por WhatsApp para asesoramiento tecnico segun tu cultivo.',
      },
      {
        question: '¿Puedo comprar agroquimicos online con envio al interior?',
        answer: 'Si, enviamos con embalaje adecuado para transporte seguro de productos quimicos. Montevideo y Canelones: 24-48hs. Interior: 3-5 dias habiles.',
      },
      {
        question: '¿Ofrecen asesoramiento tecnico sobre dosis y aplicacion?',
        answer: 'Si, el asesoramiento es sin costo. Te orientamos sobre dosis, momento de aplicacion y compatibilidad de productos segun tu cultivo especifico. Escribinos por WhatsApp.',
      },
    ],
  },
  piscinas: {
    title: 'Piscinas',
    icon: '🏊',
    faqs: [
      {
        question: '¿Que productos para piscinas venden online?',
        answer: 'Cloro granulado y en pastillas, algicidas, clarificantes, floculantes, reguladores de pH y kits de analisis. Todo disponible online con envio a todo Uruguay.',
      },
      {
        question: '¿Cuanto cloro necesita una piscina de 50.000 litros?',
        answer: 'Aproximadamente 250-500g de cloro granulado por aplicacion para alcanzar 1-3 ppm. La dosis exacta depende del pH actual y la temperatura del agua. Consulta nuestra guia completa de mantenimiento de piscinas.',
      },
      {
        question: '¿Cada cuanto hay que tratar el agua de la piscina?',
        answer: 'En verano con uso frecuente, chequea cloro y pH cada 2-3 dias. En invierno, una vez por semana es suficiente. Consulta nuestra guia de mantenimiento de piscinas para un calendario completo.',
      },
    ],
  },
  limpiezaIndustrial: {
    title: 'Limpieza Industrial',
    icon: '🧴',
    faqs: [
      {
        question: '¿Venden productos de limpieza en cantidad industrial?',
        answer: 'Si, manejamos desinfectantes, detergentes y desengrasantes en bidones de 5, 20 y 200 litros. Ideal para tambos, galpones, frigorificos y uso agropecuario intensivo. Consultanos por volumen y precio.',
      },
      {
        question: '¿Los productos son aptos para uso agropecuario?',
        answer: 'Si, contamos con productos especificos para la industria agropecuaria: desinfectantes para tambos, detergentes para maquinaria, hipoclorito de sodio a granel y mas. Todos con ficha tecnica disponible.',
      },
      {
        question: '¿Realizan envios de productos industriales al interior?',
        answer: 'Si, coordinamos envios especiales para productos a granel y bidones de gran volumen. El transporte cumple con normas de seguridad para quimicos. Consulta por logistica y costos.',
      },
    ],
  },
  contacto: {
    title: 'Contacto y Horarios',
    icon: '📞',
    faqs: [
      {
        question: '¿Cual es el horario de atencion?',
        answer: 'Lunes a viernes de 08:00 a 18:00 hs. Sabados de 08:30 a 12:00 hs. Domingos cerrado.',
      },
      {
        question: '¿Como puedo solicitar asesoramiento tecnico?',
        answer: 'Podes llamarnos al +598 92 744 725, escribirnos por WhatsApp o completar el formulario de contacto en nuestro sitio web. El asesoramiento es sin costo.',
      },
      {
        question: '¿Donde estan ubicados?',
        answer: 'Estamos en Jose Alonso y Trelles y Av Artigas, Tala, Canelones, Uruguay. Podes encontrarnos facilmente en Google Maps buscando "La Aldea Tala".',
      },
    ],
  },
};

// Flatten FAQs for JSON-LD schema
const allFaqs = Object.values(faqData).flatMap((category) => category.faqs);

export default function FAQPage() {
  // JSON-LD Schema for FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { name: 'Inicio', url: '/' },
                { name: 'Preguntas Frecuentes' },
              ]}
              className="mb-6 text-blue-200"
            />

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold">Preguntas Frecuentes</h1>
            </div>
            <p className="text-blue-100 text-lg max-w-2xl">
              Encontra respuestas a las dudas mas comunes y guias tecnicas sobre nuestros productos y servicios.
            </p>
          </div>
        </section>

        {/* Guides & Articles Section */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Guias y Articulos</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {FAQ_ARTICLES.map((article) => (
                <Link
                  key={article.slug}
                  href={`/guias/${article.slug}`}
                  className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-3">
                    {article.category}
                  </span>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 text-sm leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {article.description}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all">
                    Leer mas <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>

            {/* Category Navigation */}
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Preguntas Rapidas</h2>
            </div>
            <nav className="flex flex-wrap gap-2 mb-8">
              {Object.entries(faqData).map(([key, category]) => (
                <a
                  key={key}
                  href={`#${key}`}
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200"
                >
                  {category.icon} {category.title}
                </a>
              ))}
            </nav>

            {/* FAQ Categories */}
            <div className="space-y-8">
              {Object.entries(faqData).map(([key, category]) => (
                <div key={key} id={key} className="scroll-mt-24">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    {category.title}
                  </h3>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <FAQAccordion faqs={category.faqs} />
                  </div>
                </div>
              ))}
            </div>

            {/* Still have questions? */}
            <div className="mt-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">¿No encontraste lo que buscabas?</h3>
              <p className="text-green-100 mb-6 max-w-lg mx-auto">
                Nuestro equipo esta listo para ayudarte. Contactanos por WhatsApp o telefono y te respondemos al instante.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/59892744725"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
                <a
                  href="tel:+59892744725"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  +598 92 744 725
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
