import type { Metadata } from 'next';
import Header from '@/components/Header';
import FAQAccordion from '@/components/faq/FAQAccordion';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Phone, MessageCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import { autoLinkBlogContent } from '@/lib/auto-link';
import { supabase } from '@/lib/supabase';
import type { SeoCluster } from '@/lib/seo-clusters';
import FAQNav from '@/components/faq/FAQNav';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

// Cache the FAQ page for 1 hour — reduces Supabase calls for dynamic clusters
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: 'Respuestas a las preguntas mas frecuentes sobre envios, formas de pago, bombas de agua, riego, agroquimicos, piscinas y mas. La Aldea - Tala, Uruguay.',
  openGraph: {
    title: 'Preguntas Frecuentes | La Aldea',
    description: 'Respuestas a las preguntas mas frecuentes sobre envios, formas de pago, bombas de agua, riego, agroquimicos, piscinas y mas. La Aldea Agroinsumos, Tala, Uruguay.',
    type: 'website',
    url: `${siteUrl}/faq`,
    siteName: 'La Aldea',
    locale: 'es_UY',
    images: [
      {
        url: `${siteUrl}/assets/images/og-image.webp`,
        width: 1200,
        height: 630,
        alt: 'Preguntas Frecuentes — La Aldea, Tala, Uruguay',
      },
    ],
  },
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export interface FAQItem {
  question: string;
  answer: string;
  answerShort?: string; // max ~29 words, optimized for voice search schema
  relatedGuide?: {
    slug: string;
    label: string;
  };
}

// FAQ data organized by category — answers include inline links to articles
const faqData: Record<string, { title: string; icon: string; faqs: FAQItem[] }> = {
  instalaciones: {
    title: 'Instalaciones Hidraulicas',
    icon: '🔧',
    faqs: [
      {
        question: '¿Que tipos de instalaciones hidraulicas ofrece La Aldea?',
        answerShort: 'Instalaciones hidraulicas residenciales, comerciales y agricolas con tanques, cañerias, bombas y automatizacion en todo Uruguay.',
        answer: 'Ofrecemos instalaciones completas de sistemas hidraulicos residenciales, comerciales y agricolas, incluyendo tanques de almacenamiento, cañerias, bombas de agua y sistemas de automatizacion. Lee nuestra guia completa de instalaciones hidraulicas para mas detalles.',
      },
      {
        question: '¿En que zonas realizan instalaciones?',
        answerShort: 'Realizamos instalaciones en todo Uruguay. Nuestro equipo tecnico se desplaza a cualquier punto del pais.',
        answer: 'Realizamos instalaciones en todo Uruguay. Nuestro equipo tecnico se desplaza a cualquier punto del pais para garantizar una instalacion profesional.',
      },
      {
        question: '¿Ofrecen garantia en las instalaciones?',
        answerShort: 'Si, todas las instalaciones tienen garantia. El periodo varia segun el tipo de trabajo. Consulta con nuestro equipo.',
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
        answerShort: 'Evaluamos el terreno, diseñamos el sistema mas eficiente y realizamos la instalacion completa con garantia.',
        answer: 'Evaluamos el terreno, determinamos necesidades hidricas, diseñamos el sistema mas eficiente (goteo, aspersion o microaspersion) y realizamos la instalacion completa con garantia. Lee nuestra guia de diseño e instalacion de riego para conocer el proceso completo.',
      },
      {
        question: '¿Que beneficios tiene un sistema de riego bien instalado?',
        answerShort: 'Ahorro de hasta 50% de agua, distribucion uniforme, automatizacion programable y mejor desarrollo de cultivos.',
        answer: 'Ahorro de hasta 50% de agua, distribucion uniforme, automatizacion programable, reduccion de mano de obra y mejor desarrollo de cultivos. Conoce todos los beneficios del riego en nuestra guia especializada.',
      },
      {
        question: '¿Que tipo de riego es mejor para mi terreno?',
        answerShort: 'Goteo para huertos y viñedos, aspersion para praderas y extensivos. Depende del cultivo y disponibilidad de agua.',
        answer: 'Depende del cultivo, tamaño del terreno y disponibilidad de agua. El riego por goteo es ideal para huertos y viñedos, mientras que la aspersion es mejor para praderas y cultivos extensivos. Consulta nuestra comparativa de goteo vs aspersion. Te asesoramos sin costo.',
      },
      {
        question: '¿Cuanto cuesta instalar un sistema de riego en Uruguay?',
        answerShort: 'El costo varia segun el tipo de sistema y la superficie. Ofrecemos presupuesto sin cargo con visita tecnica incluida.',
        answer: 'El costo varia segun el tipo de sistema (goteo, aspersion, automatico), la superficie a cubrir y el tipo de cultivo. Ofrecemos presupuesto sin cargo con visita tecnica incluida. Consulta nuestra guia de instalacion de riego por goteo para entender el proceso.',
      },
      {
        question: '¿Es posible automatizar un sistema de riego existente?',
        answerShort: 'Si, se puede automatizar con timers, electrovalvulas y controladores. Ofrecemos desde basico hasta sensores de humedad.',
        answer: 'Si, se puede agregar automatizacion a sistemas manuales con timers, electrovalvulas y controladores. Contamos con soluciones desde sistemas basicos hasta automatizacion completa con sensores de humedad. Visita nuestra seccion de sistemas de riego.',
      },
      {
        question: '¿Cada cuanto hay que regar segun el cultivo?',
        answerShort: 'Huerta familiar en verano: diario o cada 2 dias. Cultivos extensivos: cada 5 a 7 dias segun lluvia.',
        answer: 'Varia segun el tipo de cultivo y la epoca del año. Una huerta familiar en verano necesita riego diario o cada 2 dias, cultivos extensivos como soja cada 5-7 dias dependiendo de la lluvia. Nuestros tecnicos te asesoran segun tu caso. Lee nuestra guia de riego para huerta y jardin.',
      },
    ],
  },
  bombas: {
    title: 'Bombas de Agua',
    icon: '⚡',
    faqs: [
      {
        question: '¿Que diferencia hay entre una bomba sumergible y una bomba de superficie?',
        answerShort: 'Las sumergibles van dentro del agua para grandes profundidades. Las de superficie van fuera, ideales para cisternas y arroyos.',
        answer: 'Las bombas sumergibles van dentro del agua (pozos, tanques) y son mas eficientes para grandes profundidades. Las de superficie van fuera del agua y son ideales para cisternas, rios o arroyos poco profundos. Lee nuestra guia completa de tipos de bombas para una comparacion detallada.',
        relatedGuide: {
          slug: 'seleccion-bombas',
          label: 'Ver guía completa de selección de bombas'
        }
      },
      {
        question: '¿Como elegir la bomba de agua adecuada?',
        answerShort: 'Considera profundidad, caudal necesario, presion requerida, tipo de uso y alimentacion electrica disponible.',
        answer: 'Debes considerar: profundidad del agua, caudal necesario (litros/hora), presion requerida, tipo de uso (domestico/agricola) y alimentacion electrica disponible. Consulta nuestra guia de seleccion de bombas para un analisis tecnico completo.',
        relatedGuide: {
          slug: 'seleccion-bombas',
          label: 'Guía de selección de bombas'
        }
      },
      {
        question: '¿Ofrecen servicio tecnico para bombas?',
        answerShort: 'Si, contamos con servicio tecnico especializado para reparacion y mantenimiento de todas las marcas que vendemos.',
        answer: 'Si, contamos con servicio tecnico especializado para reparacion y mantenimiento de bombas de todas las marcas que vendemos.',
      },
      {
        question: '¿Que bomba necesito para alimentar aspersores de riego?',
        answerShort: 'Para 2 a 4 aspersores, 1 HP suele ser suficiente. Para 5 o mas, necesitas 1.5 a 2 HP o superior.',
        answer: 'Depende de la cantidad de aspersores y la presion requerida. Para 2-4 aspersores una bomba de 1 HP suele ser suficiente. Para 5 o mas, necesitas 1.5-2 HP o mas. Lee nuestra guia completa de bombas para aspersores con tablas de seleccion por HP.',
      },
      {
        question: '¿Las bombas solares sirven para riego agricola?',
        answerShort: 'Si, son excelentes para zonas sin red electrica. Mueven entre 2.000 y 20.000 litros por hora segun el modelo.',
        answer: 'Si, las bombas solares son una excelente opcion para riego en zonas rurales sin acceso a red electrica. Funcionan con paneles solares y pueden mover entre 2.000 y 20.000 litros por hora segun el modelo. Consulta nuestro catalogo de bombas y sistemas solares.',
      },
    ],
  },
  envios: {
    title: 'Envios y Entregas',
    icon: '🚚',
    faqs: [
      {
        question: '¿Hacen envios a todo Uruguay?',
        answerShort: 'Si, enviamos a todo Uruguay. Montevideo y zona metro: 24 a 48 horas. Interior: 3 a 5 dias habiles.',
        answer: 'Si, enviamos productos a todo el pais. Los tiempos de entrega varian segun la zona. Montevideo y areas cercanas: 24-48 horas. Interior: 3-5 dias habiles.',
      },
      {
        question: '¿Cuanto cuesta el envio?',
        answerShort: 'Depende del peso, volumen y destino. Productos pequeños por DAC. Equipos pesados con envio especial coordinado.',
        answer: 'El costo de envio depende del peso, volumen y destino. Para productos pequeños usamos DAC o similar. Para equipos pesados (bombas, tanques) coordinamos envios especiales.',
      },
      {
        question: '¿Puedo retirar en el local?',
        answerShort: 'Si, retiro sin costo en nuestro local de Tala. Te notificamos cuando tu pedido este listo.',
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
        answer: 'Tenemos herbicidas selectivos y totales, con stock permanente y envio a todo Uruguay. Consultanos por WhatsApp para asesoramiento tecnico segun tu cultivo.',
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
        relatedGuide: {
          slug: 'mantenimiento-piscinas',
          label: 'Guía completa de mantenimiento'
        }
      },
      {
        question: '¿Cada cuanto hay que tratar el agua de la piscina?',
        answer: 'En verano con uso frecuente, chequea cloro y pH cada 2-3 dias. En invierno, una vez por semana es suficiente. Consulta nuestra guia de mantenimiento de piscinas para un calendario completo.',
      },
    ],
  },
  limpiezaIndustrial: {
    title: 'Limpieza',
    icon: '🧴',
    faqs: [
      {
        question: '¿Venden productos de limpieza ?',
        answer: 'Si, manejamos desinfectantes, detergentes y desengrasantes en bidones de 1, 5, 10 litros.  Consultanos por volumen y precio.',
      },
      {
        question: '¿Los productos son aptos para uso agropecuario?',
        answer: 'Si, contamos con productos especificos para la industria agropecuaria: desinfectantes, detergentes, hipoclorito de y mas. Todos con ficha tecnica disponible.',
      },
      {
        question: '¿Realizan envios de productos  al interior?',
        answer: 'Si, coordinamos envios especiales para productos. El transporte cumple con normas de seguridad para quimicos. Consulta por logistica y costos.',
      },
    ],
  },
  contacto: {
    title: 'Contacto y Horarios',
    icon: '📞',
    faqs: [
      {
        question: '¿Cual es el horario de atencion?',
        answerShort: 'Lunes a viernes de 8 a 18 horas. Sabados de 8:30 a 12. Domingos cerrado.',
        answer: 'Lunes a viernes de 08:00 a 18:00 hs. Sabados de 08:30 a 12:00 hs. Domingos cerrado.',
      },
      {
        question: '¿Como puedo solicitar asesoramiento tecnico?',
        answer: `Podes llamarnos al +${WHATSAPP_PHONE}, escribirnos por WhatsApp o completar el formulario de contacto en nuestro sitio web. El asesoramiento es sin costo.`,
      },
      {
        question: '¿Donde estan ubicados?',
        answer: 'Estamos en Jose Alonso y Trelles y Av Artigas, Tala, Canelones, Uruguay. Podes encontrarnos facilmente en Google Maps buscando "La Aldea Tala".',
      },
    ],
  },
};

/** Fetch all published guides to create dynamic SEO clusters */
async function getDynamicClusters(): Promise<SeoCluster[]> {
  const { data, error } = await supabase
    .from('guides')
    .select('slug, title, keywords, category')
    .eq('is_published', true);

  if (error || !data) {
    console.error('[SEO Clusters] Error fetching guides:', error?.message);
    return [];
  }

  return (data as any[]).map(guide => ({
    url: `/guias/${guide.slug}`,
    cluster: String(guide.category || 'general').toLowerCase(),
    type: 'guide',
    keywords: [
      { term: guide.title, weight: 10 },
      ...(Array.isArray(guide.keywords) ? guide.keywords : []).map((k: any) => ({
        term: String(k),
        weight: 9
      }))
    ]
  }));
}

export default async function FAQPage() {
  const dynamicClusters = await getDynamicClusters();

  // Process all FAQ answers with auto-linking
  const processedFaqData = Object.entries(faqData).reduce((acc, [key, category]) => {
    acc[key] = {
      ...category,
      faqs: category.faqs.map(faq => ({
        ...faq,
        answer: autoLinkBlogContent(faq.answer, 'faq', {
          maxLinks: 2,
          additionalClusters: dynamicClusters
        })
      }))
    };
    return acc;
  }, {} as typeof faqData);

  // Flatten FAQs for JSON-LD schema
  const allFaqs = Object.values(processedFaqData).flatMap((category) => category.faqs);

  // JSON-LD Schema for FAQPage — uses answerShort for voice search when available
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: (faq.answerShort || faq.answer).replace(/<[^>]*>/g, ''), // Prefer short answer for voice search
      },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Preguntas Frecuentes' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Header />

      <main className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <PageHeader
          title="Preguntas Frecuentes"
          description="Respuestas rápidas a las dudas más comunes sobre nuestros productos, envíos, pagos y servicios."
        >
          <Breadcrumbs
            items={[
              { name: 'Inicio', url: '/' },
              { name: 'Preguntas Frecuentes' },
            ]}
            className="text-blue-200"
          />
        </PageHeader>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Blog/Guides banner */}
            <Link
              href="/blog"
              className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 hover:bg-blue-100 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                < BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-blue-900 text-sm">¿Buscas guias tecnicas?</p>
                <p className="text-xs text-blue-600">Visita nuestro blog con guias completas sobre riego, bombas, piscinas y agroquimicos.</p>
              </div>
              <span className="text-blue-600 font-medium text-sm shrink-0 group-hover:underline">Ver guias →</span>
            </Link>

            {/* Category Navigation (Client Side Tracking) */}
            <FAQNav 
              categories={Object.entries(processedFaqData).map(([key, cat]) => ({
                id: key,
                title: cat.title,
                icon: cat.icon
              }))} 
            />

            {/* FAQ Categories */}
            <div className="space-y-8">
              {Object.entries(processedFaqData).map(([key, category]) => (
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
            <div className="mt-12 relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl ring-1 ring-black/5">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">¿No encontraste lo que buscabas?</h3>
                <p className="text-green-50 text-[16px] mb-8 max-w-xl mx-auto leading-relaxed">
                  Nuestro equipo está listo para ayudarte en lo que necesites. Contactanos por WhatsApp o teléfono y te respondemos al instante.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white text-green-700 font-bold rounded-2xl hover:bg-green-50 hover:-translate-y-0.5 hover:shadow-lg transition-all shadow-md"
                >
                  <MessageCircle className="h-5 w-5" />
                  Abrir WhatsApp
                </a>
                <a
                  href={`tel:+${WHATSAPP_PHONE}`}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white/10 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <Phone className="h-5 w-5" />
                  Llamar: {WHATSAPP_DISPLAY}
                </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
