import type { Metadata } from 'next';
import Header from '@/components/Header';
import FAQAccordion from '@/components/faq/FAQAccordion';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { HelpCircle, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: 'Respondemos tus dudas sobre bombas de agua, sistemas de riego, instalaciones hidráulicas, envíos y más. La Aldea - Tala, Uruguay.',
  openGraph: {
    title: 'Preguntas Frecuentes | La Aldea',
    description: 'Respondemos tus dudas sobre bombas de agua, sistemas de riego, instalaciones hidráulicas, envíos y más.',
    type: 'website',
  },
};

// FAQ data organized by category
const faqData = {
  instalaciones: {
    title: 'Instalaciones Hidráulicas',
    icon: '🔧',
    faqs: [
      {
        question: '¿Qué tipos de instalaciones hidráulicas ofrece La Aldea?',
        answer: 'Ofrecemos instalaciones completas de sistemas hidráulicos residenciales, comerciales y agrícolas, incluyendo tanques de almacenamiento, cañerías, bombas de agua y sistemas de automatización.',
      },
      {
        question: '¿En qué zonas realizan instalaciones?',
        answer: 'Realizamos instalaciones en todo Uruguay. Nuestro equipo técnico se desplaza a cualquier punto del país para garantizar una instalación profesional.',
      },
      {
        question: '¿Ofrecen garantía en las instalaciones?',
        answer: 'Sí, todas nuestras instalaciones cuentan con garantía. El período de garantía varía según el tipo de trabajo realizado. Consultá con nuestro equipo para más detalles.',
      },
    ],
  },
  riego: {
    title: 'Sistemas de Riego',
    icon: '💧',
    faqs: [
      {
        question: '¿Cómo se realiza el diseño e instalación de un sistema de riego?',
        answer: 'Evaluamos el terreno, determinamos necesidades hídricas, diseñamos el sistema más eficiente (goteo, aspersión o microaspersión) y realizamos la instalación completa con garantía.',
      },
      {
        question: '¿Qué beneficios tiene un sistema de riego bien instalado?',
        answer: 'Ahorro de hasta 50% de agua, distribución uniforme, automatización programable, reducción de mano de obra y mejor desarrollo de cultivos.',
      },
      {
        question: '¿Qué tipo de riego es mejor para mi terreno?',
        answer: 'Depende del cultivo, tamaño del terreno y disponibilidad de agua. El riego por goteo es ideal para huertos y viñedos, mientras que la aspersión es mejor para praderas y cultivos extensivos. Te asesoramos sin costo.',
      },
    ],
  },
  bombas: {
    title: 'Bombas de Agua',
    icon: '⚡',
    faqs: [
      {
        question: '¿Qué diferencia hay entre una bomba sumergible y una bomba de superficie?',
        answer: 'Las bombas sumergibles van dentro del agua (pozos, tanques) y son más eficientes para grandes profundidades. Las de superficie van fuera del agua y son ideales para cisternas, ríos o arroyos poco profundos.',
      },
      {
        question: '¿Cómo elegir la bomba de agua adecuada?',
        answer: 'Debes considerar: profundidad del agua, caudal necesario (litros/hora), presión requerida, tipo de uso (doméstico/agrícola) y alimentación eléctrica disponible. Nuestros técnicos te asesoran sin costo.',
      },
      {
        question: '¿Ofrecen servicio técnico para bombas?',
        answer: 'Sí, contamos con servicio técnico especializado para reparación y mantenimiento de bombas de todas las marcas que vendemos.',
      },
    ],
  },
  envios: {
    title: 'Envíos y Entregas',
    icon: '🚚',
    faqs: [
      {
        question: '¿Hacen envíos a todo Uruguay?',
        answer: 'Sí, enviamos productos a todo el país. Los tiempos de entrega varían según la zona. Montevideo y áreas cercanas: 24-48 horas. Interior: 3-5 días hábiles.',
      },
      {
        question: '¿Cuánto cuesta el envío?',
        answer: 'El costo de envío depende del peso, volumen y destino. Para productos pequeños usamos DAC o similar. Para equipos pesados (bombas, tanques) coordinamos envíos especiales.',
      },
      {
        question: '¿Puedo retirar en el local?',
        answer: 'Sí, podés retirar tu pedido sin costo en nuestro local de Tala. Te notificamos cuando esté listo para retirar.',
      },
    ],
  },
  pagos: {
    title: 'Formas de Pago',
    icon: '💳',
    faqs: [
      {
        question: '¿Qué formas de pago aceptan?',
        answer: 'Aceptamos MercadoPago (tarjetas de crédito/débito), transferencia bancaria y efectivo en el local. Para compras online, el pago se procesa de forma segura a través de MercadoPago.',
      },
      {
        question: '¿Puedo pagar en cuotas?',
        answer: 'Sí, a través de MercadoPago podés pagar en hasta 12 cuotas con tarjeta de crédito. El número de cuotas disponibles depende de tu banco.',
      },
      {
        question: '¿Emiten factura?',
        answer: 'Sí, emitimos factura electrónica (e-factura) por todas las compras. Indicá tus datos fiscales al momento de la compra.',
      },
    ],
  },
  productos: {
    title: 'Productos',
    icon: '📦',
    faqs: [
      {
        question: '¿Qué marcas de productos manejan?',
        answer: 'Trabajamos con marcas líderes: Gianni, DIU, Tigre, Nicoll, Hidroservice, Pacifil, Cablinur, Lesa, Ramasil, Balaguer, Armco y Lusqtoff.',
      },
      {
        question: '¿Los productos tienen garantía?',
        answer: 'Sí, todos los productos tienen la garantía del fabricante. El período varía según el producto y la marca. Guardá tu factura como comprobante.',
      },
      {
        question: '¿Puedo devolver un producto?',
        answer: 'Sí, aceptamos devoluciones dentro de los 7 días de recibido el producto, siempre que esté sin uso y en su empaque original. Contactanos para coordinar.',
      },
    ],
  },
  contacto: {
    title: 'Contacto y Horarios',
    icon: '📞',
    faqs: [
      {
        question: '¿Cuál es el horario de atención?',
        answer: 'Lunes a viernes de 08:00 a 18:00 hs. Sábados de 08:30 a 12:00 hs. Domingos cerrado.',
      },
      {
        question: '¿Cómo puedo solicitar asesoramiento técnico?',
        answer: 'Podés llamarnos al +598 92 744 725, escribirnos por WhatsApp o completar el formulario de contacto en nuestro sitio web. El asesoramiento es sin costo.',
      },
      {
        question: '¿Dónde están ubicados?',
        answer: 'Estamos en José Alonso y Trelles y Av Artigas, Tala, Canelones, Uruguay. Podés encontrarnos fácilmente en Google Maps buscando "La Aldea Tala".',
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
              Encontrá respuestas a las dudas más comunes sobre nuestros productos, servicios, envíos y más.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Category Navigation */}
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
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    {category.title}
                  </h2>
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
                Nuestro equipo está listo para ayudarte. Contactanos por WhatsApp o teléfono y te respondemos al instante.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/59892744725"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-colors"
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
