import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Starting guides update...');

  // 1. UPDATE: "Agua Piscina Verde" (Improve CTR)
  const { error: err1 } = await supabase
    .from('guides')
    .update({
      title: '¿Piscina Verde? Cómo Recuperarla en 24h | Guía Paso a Paso',
      description: 'Guía rápida y paso a paso para recuperar el agua verde de tu piscina. Eliminá algas y bacterias en 24 horas con el tratamiento de shock adecuado. Consejos y productos.',
    })
    .eq('slug', 'agua-piscina-verde');
  
  if (err1) console.error('Error updating agua-piscina-verde:', err1);
  else console.log('✅ Updated "agua-piscina-verde"');

  // 2. UPDATE: "Cuanto Cloro Piscina" (Inject Calculator and Product)
  const { data: cloroGuide } = await supabase
    .from('guides')
    .select('sections')
    .eq('slug', 'cuanto-cloro-piscina')
    .single();

  if (cloroGuide && cloroGuide.sections) {
    const existingSections = typeof cloroGuide.sections === 'string' 
      ? JSON.parse(cloroGuide.sections) 
      : cloroGuide.sections;

    // Check if we already added it to avoid duplicates
    const hasCalculator = existingSections.some((s: any) => s.type === 'calculator-cloro');
    
    if (!hasCalculator) {
      const newSections = [
        {
          type: 'calculator-cloro',
          title: 'Calculadora de Dosificación de Cloro',
          content: ''
        },
        ...existingSections,
        {
          type: 'product-card',
          title: 'Producto Recomendado para Mantenimiento',
          content: 'cloro-instantaneo-shock-x-35-kg-cis-diu-1246'
        }
      ];

      const { error: err2 } = await supabase
        .from('guides')
        .update({ sections: newSections })
        .eq('slug', 'cuanto-cloro-piscina');

      if (err2) console.error('Error updating cuanto-cloro-piscina:', err2);
      else console.log('✅ Injected Cloro Calculator into "cuanto-cloro-piscina"');
    } else {
      console.log('⚠️ Calculator already exists in "cuanto-cloro-piscina"');
    }
  }

  // 3. UPSERT: New Guides
  const newGuides = [
    {
      slug: 'bomba-para-pozo',
      title: '¿Qué bomba necesito para mi pozo?',
      description: 'Guía y calculadora para saber exactamente qué bomba de agua (sumergible o de superficie) necesitás para tu pozo según profundidad y caudal.',
      breadcrumb_label: 'Bomba para Pozo',
      category: 'Bombas de Agua',
      keywords: ['bomba pozo', 'calcular hp bomba', 'bomba sumergible', 'bomba agua', 'calculadora bombas'],
      related_categories: [{ label: 'Bombas de Agua', value: 'Bombas' }],
      related_articles: ['tipos-bombas', 'seleccion-bombas'],
      sections: [
        {
          type: 'text',
          title: 'El tamaño de la bomba sí importa',
          content: 'Elegir una bomba demasiado pequeña significa que no tendrás agua suficiente. Elegir una muy grande genera exceso de presión, mayor gasto eléctrico y puede dañar tus cañerías. La clave está en conocer dos datos: la profundidad de succión y el caudal deseado.'
        },
        {
          type: 'calculator-pump',
          title: 'Calculá la potencia de tu bomba',
          content: ''
        },
        {
          type: 'text',
          title: 'Factores adicionales a tener en cuenta',
          content: 'Además de la potencia en HP, tenés que considerar el diámetro del pozo (para sumergibles, usualmente 4 pulgadas), el tipo de alimentación (monofásica o trifásica) y la distancia horizontal hacia el tanque de destino. Consultá siempre con un técnico antes de realizar la compra definitiva.'
        }
      ],
      is_published: true,
      date_published: new Date().toISOString().split('T')[0],
      date_modified: new Date().toISOString().split('T')[0]
    },
    {
      slug: 'como-clorar-piscina-paso-a-paso',
      title: 'Cómo clorar una piscina paso a paso',
      description: 'Guía definitiva para mantener tu piscina impecable. Aprendé a medir el pH, calcular la dosis exacta de cloro y aplicar un tratamiento de shock.',
      breadcrumb_label: 'Clorar Piscina',
      category: 'Piscinas',
      keywords: ['clorar piscina', 'mantenimiento piscina', 'tratamiento shock', 'ph piscina', 'cloro'],
      related_categories: [{ label: 'Piscinas', value: 'Piscinas' }],
      related_articles: ['cuanto-cloro-piscina', 'agua-piscina-verde'],
      sections: [
        {
          type: 'steps',
          title: 'Paso 1: Medir y Ajustar el pH',
          content: '<ul><li>Utilizá un kit de testeo (gotas o tiras reactivas) para medir el pH del agua.</li><li>El nivel ideal debe estar entre 7.2 y 7.6.</li><li>Si está fuera de este rango, el cloro pierde hasta un 80% de su efectividad. Utilizá un incrementador o reductor de pH según corresponda.</li></ul>'
        },
        {
          type: 'steps',
          title: 'Paso 2: Calcular la dosis de cloro',
          content: '<ul><li>Determiná el volumen de tu piscina (largo x ancho x profundidad media).</li><li>Para mantenimiento diario en verano: 10 gramos de cloro granulado por cada 10.000 litros.</li><li>Para tratamientos de shock: triplicá la dosis de mantenimiento.</li></ul>'
        },
        {
          type: 'calculator-cloro',
          title: 'Calculá tu dosis exacta aquí',
          content: ''
        },
        {
          type: 'steps',
          title: 'Paso 3: Aplicación',
          content: '<ul><li>Disolvé siempre el cloro granulado en un balde con agua antes de echarlo a la piscina (para evitar decolorar la pintura o el liner).</li><li>Esparcí la mezcla por todo el perímetro de la piscina.</li><li>Encendé el filtro en modo recirculación durante al menos 2 horas para asegurar una mezcla homogénea.</li><li>Realizá este proceso preferentemente al atardecer para que el sol no evapore el cloro.</li></ul>'
        },
        {
          type: 'product-card',
          title: 'Kit Recomendado',
          content: 'test-kit-ph-y-cloro-tkp-gia-3045'
        }
      ],
      is_published: true,
      date_published: new Date().toISOString().split('T')[0],
      date_modified: new Date().toISOString().split('T')[0]
    },
    {
      slug: 'riego-aspersion-vs-goteo',
      title: 'Riego por aspersión vs goteo: cuál elegir',
      description: 'Comparativa completa entre sistemas de riego por goteo y aspersión. Ventajas, desventajas y cuál es mejor para tu jardín, huerta o cultivo.',
      breadcrumb_label: 'Aspersión vs Goteo',
      category: 'Riego',
      keywords: ['riego aspersion', 'riego goteo', 'comparativa riego', 'mejor sistema riego'],
      related_categories: [{ label: 'Riego', value: 'Riego' }],
      related_articles: ['diseno-riego', 'instalar-riego-goteo'],
      sections: [
        {
          type: 'text',
          title: 'Diferencias Fundamentales',
          content: 'El riego por aspersión imita la lluvia, distribuyendo el agua por el aire a presión, lo que lo hace ideal para cubrir grandes áreas uniformemente como el césped. Por otro lado, el riego por goteo aplica el agua directamente en la raíz de la planta, gota a gota, maximizando la eficiencia hídrica y minimizando las malezas.'
        },
        {
          type: 'comparison',
          title: 'Ventajas de cada sistema',
          content: '<div><div><h4>Riego por Aspersión</h4><ul><li>Cobertura total del terreno</li><li>Ideal para césped y forrajes</li><li>Refresca el microclima</li><li>Lava el polvo de las hojas</li></ul></div><div><h4>Riego por Goteo</h4><ul><li>Ahorra hasta un 50% de agua</li><li>Menor crecimiento de malezas</li><li>Evita hongos en las hojas</li><li>Requiere menor presión de bomba</li><li>Permite fertirrigación precisa</li></ul></div></div>'
        },
        {
          type: 'text',
          title: '¿Cuál elegir?',
          content: 'Si estás armando el jardín de tu casa, lo ideal es un <strong>sistema mixto</strong>: aspersores o toberas retráctiles para el césped, y una línea de goteo oculta bajo el mantillo para los canteros, arbustos y la huerta. Esto garantiza que cada tipo de planta reciba el agua de la forma más eficiente.'
        }
      ],
      is_published: true,
      date_published: new Date().toISOString().split('T')[0],
      date_modified: new Date().toISOString().split('T')[0]
    }
  ];

  const { error: err3 } = await supabase
    .from('guides')
    .upsert(newGuides, { onConflict: 'slug' });

  if (err3) console.error('Error inserting new guides:', err3);
  else console.log('✅ Inserted 3 new high-intent guides');

  console.log('Update process complete.');
}

main();
