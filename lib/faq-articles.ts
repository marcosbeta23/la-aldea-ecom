// lib/faq-articles.ts
// FAQ article data for /faq/[slug] pages
// Content adapted from old La Aldea website

export interface ArticleSection {
  title: string;
  content: string; // HTML-safe string (rendered with dangerouslySetInnerHTML)
  type: 'text' | 'list' | 'steps' | 'stats' | 'table' | 'comparison';
}

export interface FaqArticle {
  slug: string;
  title: string;
  description: string; // SEO meta description
  breadcrumbLabel: string;
  category: string; // display category
  keywords: string[];
  relatedCategories: Array<{ label: string; value: string }>; // link to /productos?categoria=X
  relatedArticles: string[]; // other article slugs
  sections: ArticleSection[];
}

export const FAQ_ARTICLES: FaqArticle[] = [
  // ── 1. Beneficios del Riego ──────────────────────────────────────────────
  {
    slug: 'beneficios-riego',
    title: 'Beneficios de un Sistema de Riego Bien Instalado',
    description: 'Descubri los beneficios de un sistema de riego profesional: ahorro de agua del 30%, mayor productividad y reduccion de costos. Guia completa de La Aldea, Tala.',
    breadcrumbLabel: 'Beneficios del Riego',
    category: 'Sistemas de Riego',
    keywords: ['beneficios riego', 'ahorro agua', 'riego eficiente', 'productividad cultivos', 'sistema riego Uruguay'],
    relatedCategories: [
      { label: 'Sistemas de Riego', value: 'Riego' },
    ],
    relatedArticles: ['diseno-riego', 'instalaciones-hidraulicas', 'energias-renovables'],
    sections: [
      {
        title: 'Eficiencia en el Uso del Agua',
        type: 'text',
        content: `Un sistema de riego profesionalmente instalado puede reducir el consumo de agua hasta un <strong>30%</strong> comparado con metodos tradicionales. Esto se logra mediante la distribucion precisa del agua, el control de perdidas por evaporacion, la aplicacion localizada en la zona radicular y la programacion inteligente segun las necesidades del cultivo. En Uruguay, donde los recursos hidricos son valiosos, esta eficiencia se traduce directamente en ahorro economico y sustentabilidad ambiental.`,
      },
      {
        title: 'Beneficios Economicos',
        type: 'list',
        content: `<ul>
<li><strong>Reduccion del 40% en costos operativos</strong> frente al riego manual o por inundacion</li>
<li><strong>Reduccion del 60% en horas de mano de obra</strong> dedicadas al riego</li>
<li>Menor consumo energetico gracias a bombas correctamente dimensionadas</li>
<li>Optimizacion en el uso de fertilizantes mediante fertirrigacion</li>
<li>Retorno de inversion estimado en <strong>2 a 4 años</strong></li>
</ul>`,
      },
      {
        title: 'Mejora del Cultivo',
        type: 'table',
        content: `<table>
<thead><tr><th>Cultivo</th><th>Rend. Tradicional</th><th>Rend. con Riego Prof.</th><th>Mejora</th></tr></thead>
<tbody>
<tr><td>Tomate</td><td>42 ton/ha</td><td>68 ton/ha</td><td>+62%</td></tr>
<tr><td>Arandano</td><td>7 ton/ha</td><td>12 ton/ha</td><td>+71%</td></tr>
<tr><td>Pradera</td><td>8 ton MS/ha</td><td>14 ton MS/ha</td><td>+75%</td></tr>
</tbody>
</table>
<p>El rendimiento promedio aumenta un <strong>50% por hectarea</strong> con un sistema de riego correctamente diseñado e instalado.</p>`,
      },
      {
        title: 'Beneficios Ambientales',
        type: 'list',
        content: `<ul>
<li>Conservacion de recursos hidricos con uso eficiente del agua</li>
<li>Reduccion del 70% en lixiviacion de nutrientes al subsuelo</li>
<li>Menor erosion del suelo por eliminacion del riego por inundacion</li>
<li>Reduccion en el uso de agroquimicos gracias a la aplicacion precisa</li>
<li>Posibilidad de integracion con energia solar para un sistema 100% sustentable</li>
</ul>`,
      },
    ],
  },

  // ── 2. Diseño e Instalacion de Riego ─────────────────────────────────────
  {
    slug: 'diseno-riego',
    title: 'Guia Completa: Diseño e Instalacion de Sistemas de Riego',
    description: 'Proceso completo de diseño e instalacion de sistemas de riego: evaluacion, diseño tecnico, instalacion profesional y capacitacion. La Aldea, Tala, Uruguay.',
    breadcrumbLabel: 'Diseño de Riego',
    category: 'Sistemas de Riego',
    keywords: ['diseño riego', 'instalacion riego', 'sistema riego goteo', 'riego aspersion', 'riego Uruguay'],
    relatedCategories: [
      { label: 'Sistemas de Riego', value: 'Riego' },
      { label: 'Instalaciones Hidraulicas', value: 'Hidraulica' },
    ],
    relatedArticles: ['beneficios-riego', 'instalaciones-hidraulicas', 'seleccion-bombas'],
    sections: [
      {
        title: 'Proceso de Diseño e Instalacion',
        type: 'text',
        content: `El diseño e instalacion de un sistema de riego profesional sigue un proceso estructurado de 6 etapas que garantiza la maxima eficiencia y durabilidad. En La Aldea contamos con mas de 25 años de experiencia realizando estos proyectos en todo Uruguay.`,
      },
      {
        title: '6 Etapas del Proceso',
        type: 'steps',
        content: `<ol>
<li><strong>Evaluacion Inicial:</strong> Analisis del terreno (topografia, tipo de suelo), evaluacion de cultivos (necesidades hidricas, profundidad radicular), estudio de recursos hidricos (calidad, caudal disponible) y condiciones climaticas (evapotranspiracion, precipitaciones).</li>
<li><strong>Diseño Tecnico:</strong> Calculo de necesidades hidricas (ETc, Kc), diseño hidraulico (dimensionamiento de tuberias, perdidas de carga, seleccion de emisores, sectorizacion equilibrada), seleccion de componentes (bombas, filtracion, valvulas, fertirrigacion, automatizacion) y elaboracion de planos tecnicos.</li>
<li><strong>Presupuesto y Planificacion:</strong> Desglose de materiales, costos de mano de obra, cronograma de ejecucion, analisis de retorno de inversion y opciones de financiamiento.</li>
<li><strong>Instalacion Profesional:</strong> Preparacion del terreno, infraestructura principal (cabezal de riego, sistemas de bombeo), red de tuberias, sistemas de control (valvulas, programadores), emisores y conexiones electricas (incluyendo solar).</li>
<li><strong>Pruebas y Ajustes:</strong> Pruebas de estanqueidad de tuberias, verificacion de presion, medicion de caudales, uniformidad de riego (CU > 90%) y pruebas de automatizacion.</li>
<li><strong>Capacitacion y Entrega:</strong> Entrenamiento al usuario, manual de operacion, instrucciones de mantenimiento, protocolos de emergencia y documentacion completa del sistema.</li>
</ol>`,
      },
      {
        title: 'Resultados Esperados',
        type: 'stats',
        content: `<div>
<span><strong>30%</strong> Ahorro de agua</span>
<span><strong>50%</strong> Mayor productividad</span>
<span><strong>40%</strong> Reduccion de costos</span>
</div>`,
      },
    ],
  },

  // ── 3. Tipos de Bombas ───────────────────────────────────────────────────
  {
    slug: 'tipos-bombas',
    title: 'Guia Completa: Tipos de Bombas de Agua',
    description: 'Comparacion detallada entre bombas sumergibles y de superficie: eficiencia, costos, aplicaciones y guia de seleccion. La Aldea, Tala, Uruguay.',
    breadcrumbLabel: 'Tipos de Bombas',
    category: 'Bombas de Agua',
    keywords: ['tipos bombas agua', 'bomba sumergible', 'bomba superficie', 'bomba centrifuga', 'bombas Uruguay'],
    relatedCategories: [
      { label: 'Bombas de Agua', value: 'Bombas' },
    ],
    relatedArticles: ['seleccion-bombas', 'instalaciones-hidraulicas', 'energias-renovables'],
    sections: [
      {
        title: 'Bombas Sumergibles',
        type: 'text',
        content: `Las bombas sumergibles se instalan dentro del agua (pozos, tanques, cisternas) y son la opcion ideal para profundidades mayores a 8 metros. Son un <strong>30% mas eficientes</strong> que las de superficie, operan de forma silenciosa, no requieren cebado y tienen una vida util de <strong>8 a 15 años</strong>. Son la mejor opcion para pozos profundos (hasta 150-600m), riego a gran escala, espacios limitados en superficie y zonas sensibles al ruido.`,
      },
      {
        title: 'Subtipos de Bombas Sumergibles',
        type: 'list',
        content: `<ul>
<li><strong>Bombas de Pozo Profundo:</strong> Diseñadas para pozos de 4" y 6", caudales altos y grandes profundidades.</li>
<li><strong>Bombas Sumergibles para Aguas Residuales:</strong> Con impulsor triturador, ideales para drenaje y aguas con solidos.</li>
<li><strong>Bombas Solares Sumergibles:</strong> Alimentadas por paneles solares, sin costo de energia electrica. Ideales para zonas rurales sin conexion a la red.</li>
</ul>`,
      },
      {
        title: 'Bombas de Superficie',
        type: 'text',
        content: `Las bombas de superficie se instalan fuera del agua y son ideales para succiones menores a 7-8 metros. Son mas economicas, faciles de mantener y reparar in situ, con vida util de <strong>5 a 10 años</strong>. Son la mejor opcion para riego domestico, presion de agua, transferencia de agua, pozos poco profundos e instalaciones temporales o moviles.`,
      },
      {
        title: 'Subtipos de Bombas de Superficie',
        type: 'list',
        content: `<ul>
<li><strong>Centrifugas Estandar:</strong> Versatiles, para uso general en riego e industria.</li>
<li><strong>Autocebantes:</strong> Ideales para instalaciones donde puede haber ingreso de aire. No requieren cebado manual.</li>
<li><strong>Multietapa:</strong> Mayor presion para edificios, riego por aspersion y aplicaciones con alta demanda de presion.</li>
</ul>`,
      },
      {
        title: 'Comparacion Sumergible vs Superficie',
        type: 'table',
        content: `<table>
<thead><tr><th>Criterio</th><th>Sumergible</th><th>Superficie</th></tr></thead>
<tbody>
<tr><td>Costo inicial</td><td>Alto ($$$)</td><td>Bajo-medio ($$)</td></tr>
<tr><td>Eficiencia energetica</td><td>85-92%</td><td>65-80%</td></tr>
<tr><td>Ruido</td><td>Silenciosa</td><td>Medio-alto</td></tr>
<tr><td>Complejidad instalacion</td><td>Alta</td><td>Baja</td></tr>
<tr><td>Acceso mantenimiento</td><td>Dificil</td><td>Facil</td></tr>
<tr><td>Profundidad maxima</td><td>200+ metros</td><td>7-8 metros</td></tr>
<tr><td>Resistencia a trabajo en seco</td><td>No</td><td>Si (algunas)</td></tr>
<tr><td>Vida util</td><td>8-15 años</td><td>5-10 años</td></tr>
</tbody>
</table>`,
      },
      {
        title: 'Guia de Decision',
        type: 'comparison',
        content: `<div>
<div>
<h4>Elegi Sumergible si:</h4>
<ul>
<li>Profundidad mayor a 8 metros</li>
<li>Necesitas silencio operativo</li>
<li>Espacio limitado en superficie</li>
<li>Buscar maxima eficiencia energetica</li>
<li>Necesitas alto caudal</li>
<li>Instalacion permanente</li>
</ul>
</div>
<div>
<h4>Elegi Superficie si:</h4>
<ul>
<li>Profundidad menor a 7 metros</li>
<li>Priorizas facil mantenimiento</li>
<li>Presupuesto limitado</li>
<li>Uso temporal o movil</li>
<li>Tanques o cisternas</li>
<li>Queres hacer reparaciones vos mismo</li>
</ul>
</div>
</div>`,
      },
    ],
  },

  // ── 4. Seleccion de Bombas ───────────────────────────────────────────────
  {
    slug: 'seleccion-bombas',
    title: 'Como Elegir la Bomba de Agua Correcta',
    description: 'Guia tecnica para elegir la bomba de agua adecuada: factores clave, tipos, dimensionamiento y curvas de rendimiento. La Aldea, Tala, Uruguay.',
    breadcrumbLabel: 'Seleccion de Bombas',
    category: 'Bombas de Agua',
    keywords: ['elegir bomba agua', 'seleccion bomba', 'dimensionamiento bomba', 'caudal presion bomba', 'bomba riego'],
    relatedCategories: [
      { label: 'Bombas de Agua', value: 'Bombas' },
    ],
    relatedArticles: ['tipos-bombas', 'instalaciones-hidraulicas', 'energias-renovables'],
    sections: [
      {
        title: 'Factores Clave para la Seleccion',
        type: 'text',
        content: `Elegir la bomba correcta requiere evaluar varios factores tecnicos. Una bomba mal dimensionada puede provocar consumo excesivo de energia, desgaste prematuro o un rendimiento insuficiente. En La Aldea te asesoramos sin costo para encontrar la solucion ideal.`,
      },
      {
        title: 'Aplicacion y Uso',
        type: 'list',
        content: `<ul>
<li><strong>Riego agricola:</strong> Goteo, aspersion, inundacion — cada metodo requiere caudales y presiones diferentes</li>
<li><strong>Abastecimiento domestico:</strong> Presion constante para viviendas, desde pozos o tanques</li>
<li><strong>Piscinas:</strong> Bombas de recirculacion con caudal continuo y baja presion</li>
<li><strong>Pozos profundos:</strong> Bombas sumergibles de alta potencia para extracciones a gran profundidad</li>
<li><strong>Drenaje:</strong> Bombas para aguas residuales o inundaciones, con capacidad para solidos</li>
</ul>`,
      },
      {
        title: 'Caracteristicas Tecnicas a Evaluar',
        type: 'list',
        content: `<ul>
<li><strong>Caudal (Q):</strong> Litros por hora necesarios. Riego por goteo: 1-4 l/h por emisor. Aspersion: 500-2000 l/h por aspersor. Domestico: 1000-3000 l/h.</li>
<li><strong>Altura de elevacion (H):</strong> Metros que la bomba debe elevar el agua, incluyendo perdidas por friccion.</li>
<li><strong>Presion requerida:</strong> En bares, segun el tipo de uso (goteo: 1-2 bar, aspersion: 2-4 bar).</li>
<li><strong>NPSH:</strong> Altura neta positiva de succion — critica para evitar cavitacion.</li>
<li><strong>Eficiencia energetica:</strong> Clasificaciones IE2 a IE4, impacto directo en el costo operativo.</li>
</ul>`,
      },
      {
        title: 'Condiciones de Instalacion',
        type: 'list',
        content: `<ul>
<li><strong>Profundidad del pozo:</strong> Hasta 8m puede ser de superficie; mayor a 8m requiere sumergible.</li>
<li><strong>Distancia de bombeo:</strong> A mayor distancia, mayores perdidas de carga y potencia necesaria.</li>
<li><strong>Calidad del agua:</strong> Agua con particulas requiere bombas con impulsor abierto o filtros previos.</li>
<li><strong>Alimentacion electrica:</strong> Monofasica, trifasica o solar — determina los modelos disponibles.</li>
</ul>`,
      },
      {
        title: 'Comparacion por Tipo de Bomba',
        type: 'table',
        content: `<table>
<thead><tr><th>Tipo</th><th>Uso Principal</th><th>Costo</th><th>Mantenimiento</th></tr></thead>
<tbody>
<tr><td>Sumergible</td><td>Pozos profundos</td><td>$$$</td><td>Bajo (cada 2-3 años)</td></tr>
<tr><td>Superficie</td><td>Riego basico</td><td>$$</td><td>Anual</td></tr>
<tr><td>Centrifuga</td><td>Uso general</td><td>$$</td><td>Medio</td></tr>
<tr><td>Autocebante</td><td>Instalaciones con aire</td><td>$$$</td><td>Medio</td></tr>
<tr><td>Periferica</td><td>Domestico pequeño</td><td>$</td><td>Bajo</td></tr>
</tbody>
</table>`,
      },
      {
        title: 'Formula de Dimensionamiento',
        type: 'text',
        content: `<p>La altura manometrica total se calcula como:</p>
<p><code>H = Hg + Hp + Hv + Hj</code></p>
<p>Donde <strong>Hg</strong> = altura geometrica, <strong>Hp</strong> = perdidas por friccion, <strong>Hv</strong> = presion de uso, <strong>Hj</strong> = perdidas en accesorios. Se recomienda seleccionar una bomba que exceda los requerimientos en un <strong>10-20%</strong> y verificar siempre el NPSH disponible.</p>`,
      },
    ],
  },

  // ── 5. Instalaciones Hidraulicas ─────────────────────────────────────────
  {
    slug: 'instalaciones-hidraulicas',
    title: 'Guia Completa de Instalaciones Hidraulicas',
    description: 'Tipos de instalaciones hidraulicas: riego por goteo, aspersion, bebederos, bombeo, tanques y sistemas automatizados. La Aldea, Tala, Uruguay.',
    breadcrumbLabel: 'Instalaciones Hidraulicas',
    category: 'Hidraulica',
    keywords: ['instalaciones hidraulicas', 'riego goteo', 'riego aspersion', 'bebederos ganado', 'tanques agua Uruguay'],
    relatedCategories: [
      { label: 'Instalaciones Hidraulicas', value: 'Hidraulica' },
      { label: 'Sistemas de Riego', value: 'Riego' },
      { label: 'Tanques', value: 'Tanques' },
    ],
    relatedArticles: ['diseno-riego', 'tipos-bombas', 'seleccion-bombas', 'beneficios-riego'],
    sections: [
      {
        title: 'Tipos de Instalaciones Hidraulicas',
        type: 'text',
        content: `En La Aldea ofrecemos una amplia gama de soluciones hidraulicas para el sector agricola, ganadero, residencial e industrial. Con mas de 25 años de experiencia, diseñamos e instalamos sistemas a medida para cada necesidad.`,
      },
      {
        title: 'Riego por Goteo',
        type: 'text',
        content: `El sistema mas eficiente con <strong>90-95% de eficiencia</strong> en el uso del agua. Aplicacion localizada en la zona radicular, ideal para cultivos en hilera. Reduce el crecimiento de malezas y es compatible con fertirrigacion. Perfecto para huertas, viñedos, frutales y cultivos protegidos.`,
      },
      {
        title: 'Riego por Aspersion',
        type: 'text',
        content: `Cobertura extensiva para praderas, cereales y pasturas. Distribucion uniforme del agua, con aspersores fijos o moviles ajustables. Sistemas de pivot central para grandes superficies. Ideal para campos ganaderos y cultivos extensivos en Uruguay.`,
      },
      {
        title: 'Bebederos para Ganado',
        type: 'text',
        content: `Bebederos automaticos con flotante para reposicion continua. Distribucion de agua en multiples puntos del establecimiento con tanques australianos. Posibilidad de bombeo solar para independencia energetica y monitoreo remoto opcional.`,
      },
      {
        title: 'Sistemas de Bombeo',
        type: 'list',
        content: `<ul>
<li><strong>Bombas sumergibles</strong> para pozos profundos</li>
<li><strong>Bombas de superficie</strong> para tanques y arroyos</li>
<li><strong>Sistemas de presion constante</strong> para viviendas</li>
<li><strong>Bombeo solar</strong> para zonas sin electricidad</li>
<li><strong>Estaciones de bombeo completas</strong> para grandes instalaciones</li>
</ul>`,
      },
      {
        title: 'Tanques de Agua',
        type: 'list',
        content: `<ul>
<li><strong>Tanques australianos:</strong> De 5,000 a 100,000+ litros, ideales para almacenamiento agricola</li>
<li><strong>Tanques de polietileno:</strong> Con proteccion UV, para uso residencial y comercial</li>
<li><strong>Tanques elevados:</strong> Distribucion por gravedad, sin necesidad de bomba</li>
<li><strong>Tanques hidroneumaticos:</strong> Presion constante para instalaciones domesticas</li>
</ul>`,
      },
      {
        title: 'Riego Automatizado',
        type: 'text',
        content: `Programadores digitales, sensores de humedad del suelo, estaciones meteorologicas, control desde el celular, electrovalvulas y fertirrigacion automatica. Un sistema automatizado puede ahorrar hasta un <strong>40% de agua</strong> adicional frente al riego manual programado.`,
      },
    ],
  },

  // ── 6. Sistemas de Filtracion ────────────────────────────────────────────
  {
    slug: 'sistemas-filtracion',
    title: 'Guia de Sistemas de Filtracion para el Hogar',
    description: 'Tipos de filtros de agua para el hogar: sedimentos, carbon activado, osmosis inversa y UV. Como elegir e instalar. La Aldea, Tala, Uruguay.',
    breadcrumbLabel: 'Sistemas de Filtracion',
    category: 'Filtros',
    keywords: ['filtro agua', 'osmosis inversa', 'carbon activado', 'filtro sedimentos', 'purificador agua Uruguay'],
    relatedCategories: [
      { label: 'Filtros de Agua', value: 'Filtros' },
    ],
    relatedArticles: ['mantenimiento-piscinas', 'instalaciones-hidraulicas'],
    sections: [
      {
        title: 'Por Que Instalar un Sistema de Filtracion',
        type: 'list',
        content: `<ul>
<li>Elimina contaminantes, bacterias y quimicos del agua</li>
<li>Mejora el sabor y el olor del agua potable</li>
<li>Reduce la acumulacion de sarro en cañerias y electrodomesticos</li>
<li>Protege la salud de tu familia con agua mas pura</li>
</ul>`,
      },
      {
        title: 'Tipos de Filtros',
        type: 'steps',
        content: `<ol>
<li><strong>Filtros de Sedimentos (5-100 micrones):</strong> Retienen particulas en suspension como arena, tierra y oxido. Vida util: 3-6 meses. Primera etapa de filtracion recomendada para cualquier sistema.</li>
<li><strong>Filtros de Carbon Activado:</strong> Eliminan mas de 70 contaminantes quimicos, incluyendo cloro, pesticidas y compuestos organicos. Mejoran sabor y olor. Vida util: 6-12 meses.</li>
<li><strong>Osmosis Inversa:</strong> El sistema mas completo, elimina el 99% de contaminantes incluyendo metales pesados, nitratos y microorganismos. Ideal para agua de pozo o con alta salinidad.</li>
<li><strong>Filtros UV (Ultravioleta):</strong> Desinfeccion sin quimicos, eliminan bacterias y virus mediante luz ultravioleta. Sin residuos ni alteracion del sabor. Complemento ideal para otros sistemas.</li>
</ol>`,
      },
      {
        title: 'Como Elegir el Filtro Adecuado',
        type: 'list',
        content: `<ul>
<li><strong>Calidad del agua local:</strong> Un analisis de agua determina que contaminantes necesitas eliminar</li>
<li><strong>Presupuesto:</strong> Filtros basicos desde US$ 30, osmosis inversa desde US$ 300</li>
<li><strong>Espacio disponible:</strong> Algunos sistemas requieren instalacion bajo mesada</li>
<li><strong>Necesidades especificas:</strong> Agua de pozo, agua de OSE, cañerias viejas, etc.</li>
</ul>`,
      },
      {
        title: 'Mantenimiento',
        type: 'text',
        content: `Segui el calendario de reemplazo de cada filtro, inspeccionas periodicamente que no haya fugas, limpialo segun las indicaciones del fabricante y monitoreala la calidad del agua regularmente. En La Aldea te proveemos los repuestos y te asesoramos sobre el mantenimiento de tu sistema.`,
      },
    ],
  },

  // ── 7. Mantenimiento de Piscinas ─────────────────────────────────────────
  {
    slug: 'mantenimiento-piscinas',
    title: 'Guia Completa de Mantenimiento de Piscinas',
    description: 'Todo sobre mantenimiento de piscinas: filtracion, bombas, tratamiento quimico y calendario de tareas. La Aldea, Tala, Uruguay.',
    breadcrumbLabel: 'Mantenimiento de Piscinas',
    category: 'Piscinas',
    keywords: ['mantenimiento piscina', 'filtro piscina', 'bomba piscina', 'cloro piscina', 'limpieza piscina Uruguay'],
    relatedCategories: [
      { label: 'Productos para Piscinas', value: 'Piscinas' },
    ],
    relatedArticles: ['sistemas-filtracion', 'seguridad-quimicos', 'tipos-bombas'],
    sections: [
      {
        title: 'Por Que el Mantenimiento Regular es Importante',
        type: 'list',
        content: `<ul>
<li>Previene la proliferacion de algas y bacterias</li>
<li>Extiende la vida util de los equipos (bomba, filtro, liner)</li>
<li>Reduce el costo de reparaciones de emergencia</li>
<li>Garantiza agua segura y cristalina para el uso</li>
</ul>`,
      },
      {
        title: 'Sistemas de Filtracion para Piscinas',
        type: 'steps',
        content: `<ol>
<li><strong>Filtros de Arena:</strong> Los mas comunes. Retrolavado cada 1-2 semanas, vida util de la arena 5-7 años. Filtracion de 20-40 micrones.</li>
<li><strong>Filtros de Cartucho:</strong> Filtracion mas fina (10-20 micrones). Se limpian con agua a presion. Vida util del cartucho: 1-3 años.</li>
<li><strong>Filtros de Diatomeas (DE):</strong> La filtracion mas fina (2-5 micrones). Las grillas duran 10+ años con mantenimiento. Resultado: agua cristalina.</li>
</ol>`,
      },
      {
        title: 'Bombas para Piscinas',
        type: 'text',
        content: `El dimensionamiento correcto es clave: el volumen total debe circular en 6-8 horas. <strong>Formula:</strong> Volumen de la piscina (litros) / 6-8 horas = caudal requerido (l/h). Las bombas de velocidad variable pueden ahorrar hasta un <strong>80% de energia</strong> frente a las de velocidad fija.`,
      },
      {
        title: 'Niveles Quimicos del Agua',
        type: 'table',
        content: `<table>
<thead><tr><th>Parametro</th><th>Nivel Ideal</th></tr></thead>
<tbody>
<tr><td>Cloro libre</td><td>1-3 ppm</td></tr>
<tr><td>pH</td><td>7.2 - 7.6</td></tr>
<tr><td>Alcalinidad total</td><td>80-120 ppm</td></tr>
<tr><td>Dureza de calcio</td><td>200-400 ppm</td></tr>
</tbody>
</table>
<p><strong>Productos esenciales:</strong> Cloro (granulado o en pastillas), clarificante, alguicida y regulador de pH.</p>`,
      },
      {
        title: 'Calendario de Mantenimiento',
        type: 'steps',
        content: `<ol>
<li><strong>Diario:</strong> Verificar nivel de cloro, vaciar canastos del skimmer</li>
<li><strong>Semanal:</strong> Test completo de agua (pH, alcalinidad, cloro), cepillar paredes, pasar aspiradora</li>
<li><strong>Mensual:</strong> Limpiar filtro (retrolavado o cartucho), tratamiento de choque (shock)</li>
<li><strong>Anual:</strong> Servicio de la bomba, inspeccion del liner, revision de tuberias y conexiones</li>
</ol>`,
      },
    ],
  },

  // ── 8. Seguridad con Productos Quimicos ──────────────────────────────────
  {
    slug: 'seguridad-quimicos',
    title: 'Guia de Seguridad para Productos Quimicos',
    description: 'Guia de seguridad para el manejo de productos quimicos: pictogramas GHS, equipos de proteccion y procedimientos de emergencia. La Aldea, Tala.',
    breadcrumbLabel: 'Seguridad Quimicos',
    category: 'Drogueria',
    keywords: ['seguridad quimicos', 'pictogramas GHS', 'EPP', 'manejo productos quimicos', 'drogueria industrial'],
    relatedCategories: [
      { label: 'Productos Quimicos', value: 'Quimicos' },
      { label: 'Drogueria', value: 'Drogueria' },
    ],
    relatedArticles: ['mantenimiento-piscinas'],
    sections: [
      {
        title: 'Pictogramas GHS de Peligro',
        type: 'text',
        content: `El Sistema Globalmente Armonizado (GHS) utiliza 9 pictogramas para identificar los peligros de los productos quimicos. Es fundamental reconocerlos para un manejo seguro:`,
      },
      {
        title: 'Tipos de Peligros',
        type: 'list',
        content: `<ul>
<li><strong>Explosivo:</strong> Sustancias o mezclas que pueden explotar por efecto de llama, choque o friccion</li>
<li><strong>Inflamable:</strong> Liquidos, gases o solidos que arden facilmente</li>
<li><strong>Comburente:</strong> Oxidantes que pueden provocar o agravar un incendio</li>
<li><strong>Gas a presion:</strong> Gases comprimidos, licuados o disueltos en recipientes a presion</li>
<li><strong>Corrosivo:</strong> Puede causar quemaduras graves en piel y daños oculares</li>
<li><strong>Toxico:</strong> Puede causar la muerte o efectos agudos graves por ingestion, inhalacion o contacto</li>
<li><strong>Irritante:</strong> Provoca irritacion cutanea, ocular o sensibilizacion respiratoria</li>
<li><strong>Peligro para la salud:</strong> Puede causar efectos cronicos como cancer, mutagenicidad</li>
<li><strong>Peligro ambiental:</strong> Toxico para organismos acuaticos con efectos duraderos</li>
</ul>`,
      },
      {
        title: 'Medidas de Seguridad Basicas',
        type: 'list',
        content: `<ul>
<li>Usar siempre equipos de proteccion personal (EPP): guantes, gafas, mascarilla</li>
<li>Leer las etiquetas y fichas de seguridad (SDS) antes de usar cualquier producto</li>
<li>Almacenar productos en lugares frescos, secos y ventilados, lejos de fuentes de calor</li>
<li>No mezclar productos quimicos distintos sin conocer su compatibilidad</li>
<li>Mantener ventilacion adecuada durante el uso</li>
</ul>`,
      },
      {
        title: 'Equipos de Proteccion Personal (EPP)',
        type: 'list',
        content: `<ul>
<li><strong>Guantes:</strong> Resistentes a quimicos (nitrilo, latex, neopreno segun el producto)</li>
<li><strong>Gafas de seguridad:</strong> Proteccion ocular anti-salpicaduras</li>
<li><strong>Mascaras respiratorias:</strong> Con filtros adecuados al tipo de quimico</li>
<li><strong>Ropa protectora:</strong> Mandil o mameluco resistente a quimicos</li>
</ul>`,
      },
      {
        title: 'Procedimientos de Emergencia',
        type: 'steps',
        content: `<ol>
<li>Mantener la calma y evaluar la situacion</li>
<li>Lavar la zona afectada con abundante agua durante al menos 15 minutos</li>
<li>En caso de ingestion, <strong>no provocar el vomito</strong> — consultar la ficha de seguridad</li>
<li>Buscar atencion medica inmediata y llevar la ficha del producto</li>
<li>Tener siempre a mano los numeros de emergencia: <strong>Centro de Toxicologia CIAT: 1722</strong></li>
</ol>`,
      },
    ],
  },

  // ── 9. Seleccion de Herramientas ─────────────────────────────────────────
  {
    slug: 'seleccion-herramientas',
    title: 'Como Seleccionar la Herramienta Adecuada',
    description: 'Guia para elegir herramientas manuales y electricas segun el tipo de trabajo, frecuencia de uso y presupuesto. La Aldea, Tala, Uruguay.',
    breadcrumbLabel: 'Seleccion de Herramientas',
    category: 'Herramientas',
    keywords: ['elegir herramienta', 'herramientas manuales', 'herramientas electricas', 'taladro', 'amoladora Uruguay'],
    relatedCategories: [
      { label: 'Herramientas', value: 'Herramientas' },
    ],
    relatedArticles: ['instalaciones-hidraulicas'],
    sections: [
      {
        title: 'Factores para la Seleccion',
        type: 'text',
        content: `Elegir la herramienta correcta depende de tres factores principales: el tipo de trabajo, la frecuencia de uso y el presupuesto disponible. Una herramienta bien elegida dura mas, rinde mejor y te ahorra tiempo y dinero.`,
      },
      {
        title: 'Segun el Tipo de Trabajo',
        type: 'list',
        content: `<ul>
<li><strong>Madera:</strong> Serruchos, cepillos, formones, sierras circulares, lijadoras</li>
<li><strong>Metal:</strong> Amoladoras, taladros, llaves, soldadoras</li>
<li><strong>Albañileria:</strong> Mezcladoras, niveles, plomadas, cortadoras de ceramica</li>
<li><strong>Plastico/PVC:</strong> Cortadoras de caño, soldadores de PVC, sierras de calar</li>
</ul>`,
      },
      {
        title: 'Segun la Aplicacion',
        type: 'list',
        content: `<ul>
<li><strong>Construccion:</strong> Amoladoras, taladros percutores, mezcladoras</li>
<li><strong>Carpinteria:</strong> Sierras, cepillos, fresadoras, lijadoras</li>
<li><strong>Electricidad:</strong> Pelacables, multimetros, crimpadoras</li>
<li><strong>Plomeria:</strong> Llaves de caño, cortadoras, soldadores de PVC, roscadoras</li>
</ul>`,
      },
      {
        title: 'Herramientas Manuales',
        type: 'list',
        content: `<ul>
<li><strong>Llaves y destornilladores:</strong> Set basico para todo hogar y taller</li>
<li><strong>Alicates y pinzas:</strong> De corte, de punta, universales, de presion</li>
<li><strong>Martillos y mazas:</strong> De carpintero, de mecanico, de goma</li>
</ul>`,
      },
      {
        title: 'Herramientas Electricas',
        type: 'list',
        content: `<ul>
<li><strong>Taladros y atornilladores:</strong> A bateria o electricos, con percusion para albañileria</li>
<li><strong>Sierras y cortadoras:</strong> Circular, caladora, de mesa, sensitiva</li>
<li><strong>Amoladoras y pulidoras:</strong> Angular de 4.5" y 7", para corte y desbaste</li>
</ul>`,
      },
      {
        title: 'Consejos de Compra',
        type: 'text',
        content: `<p>Para <strong>uso ocasional</strong>, una herramienta de gama media ofrece buena relacion calidad-precio. Para <strong>uso profesional</strong>, invertir en herramientas de alta gama se traduce en mayor durabilidad, mejor ergonomia y garantia extendida. En ambos casos, es importante considerar la inversion a largo plazo: una herramienta de calidad superior puede durar 3-5 veces mas que una economica.</p>`,
      },
    ],
  },

  // ── 10. Energias Renovables ──────────────────────────────────────────────
  {
    slug: 'energias-renovables',
    title: 'Energia Solar para Riego y Sistemas Hidraulicos',
    description: 'Guia de energia solar para riego: bombas solares, paneles, dimensionamiento y aplicaciones en Uruguay. La Aldea, Tala.',
    breadcrumbLabel: 'Energia Solar',
    category: 'Energia Solar',
    keywords: ['energia solar riego', 'bomba solar', 'panel solar', 'bombeo solar', 'riego solar Uruguay'],
    relatedCategories: [
      { label: 'Energia Solar', value: 'Energia Solar' },
      { label: 'Bombas de Agua', value: 'Bombas' },
    ],
    relatedArticles: ['tipos-bombas', 'seleccion-bombas', 'beneficios-riego'],
    sections: [
      {
        title: 'Por Que Energia Solar para Riego',
        type: 'list',
        content: `<ul>
<li><strong>Cero costo de electricidad:</strong> La energia del sol es gratuita y abundante en Uruguay</li>
<li><strong>Funciona sin conexion a la red:</strong> Ideal para establecimientos rurales alejados</li>
<li><strong>Coincidencia natural:</strong> Mas sol = mas necesidad de riego = mas energia disponible</li>
<li><strong>Bajo mantenimiento:</strong> Sistemas con vida util de 25+ años, sin partes moviles en los paneles</li>
<li><strong>Sin baterias:</strong> Se almacena agua en tanques, no electricidad en baterias</li>
</ul>`,
      },
      {
        title: 'Tipos de Bombas Solares',
        type: 'steps',
        content: `<ol>
<li><strong>Bombas Solares de Superficie:</strong> Para rios, tanques y arroyos. Succion hasta 8 metros. Ideales para riego directo desde fuentes superficiales.</li>
<li><strong>Bombas Solares Sumergibles:</strong> Para pozos de 10 a 200+ metros de profundidad. La solucion mas comun para establecimientos rurales sin electricidad.</li>
<li><strong>Bombas Solares de Presion:</strong> Para sistemas de riego por goteo y aspersion. Trabajan a 2-6 bar de presion. Ideales para huertas y viñedos.</li>
</ol>
<p><strong>Ventaja clave:</strong> Los controladores MPPT optimizan la energia disponible, ajustando el caudal automaticamente segun la irradiacion solar.</p>`,
      },
      {
        title: 'Dimensionamiento de Paneles',
        type: 'table',
        content: `<table>
<thead><tr><th>Potencia Bomba</th><th>Potencia Panel</th><th>Paneles (400W c/u)</th></tr></thead>
<tbody>
<tr><td>0.5 HP (370W)</td><td>800W</td><td>2 paneles</td></tr>
<tr><td>1 HP (750W)</td><td>1200W</td><td>3 paneles</td></tr>
<tr><td>2 HP (1500W)</td><td>2000-2400W</td><td>5-6 paneles</td></tr>
<tr><td>3+ HP</td><td>A consultar</td><td>A consultar</td></tr>
</tbody>
</table>
<p><strong>Regla general:</strong> La potencia del panel debe ser 1.5x la potencia de la bomba para asegurar un funcionamiento optimo incluso en dias nublados.</p>`,
      },
      {
        title: 'Componentes del Sistema',
        type: 'list',
        content: `<ul>
<li><strong>Esenciales:</strong> Paneles solares, controlador/inversor MPPT, bomba solar, estructura de montaje, cableado</li>
<li><strong>Opcionales:</strong> Tanque elevado (almacenamiento de agua), sensor de nivel, flotante para tanque, filtros de riego</li>
</ul>`,
      },
      {
        title: 'Aplicaciones en Uruguay',
        type: 'comparison',
        content: `<div>
<div>
<h4>Riego Agricola</h4>
<ul>
<li>Riego por goteo para huertas y viñedos</li>
<li>Aspersion para praderas</li>
<li>Llenado de tanques australianos</li>
<li>Fruticultura y citricos</li>
</ul>
</div>
<div>
<h4>Ganaderia</h4>
<ul>
<li>Bebederos automaticos en paddocks</li>
<li>Llenado de represas</li>
<li>Distribucion en multiples potreros</li>
<li>Tambo — abastecimiento de agua</li>
</ul>
</div>
</div>`,
      },
      {
        title: 'Preguntas Frecuentes',
        type: 'list',
        content: `<ul>
<li><strong>¿Funciona en dias nublados?</strong> Si, con menor caudal. Por eso se recomienda un tanque de almacenamiento para los dias sin sol.</li>
<li><strong>¿Necesita baterias?</strong> No. El concepto es almacenar agua en tanques, no electricidad en baterias. Esto reduce costos y mantenimiento.</li>
<li><strong>¿Cuanto cuesta?</strong> Un sistema basico desde US$ 800-1200. Sistemas para riego intensivo desde US$ 3000.</li>
<li><strong>¿Que mantenimiento requiere?</strong> Minimo: limpiar paneles 2-3 veces al año, revision anual de filtros y conexiones.</li>
</ul>`,
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getArticleBySlug(slug: string): FaqArticle | undefined {
  return FAQ_ARTICLES.find(a => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return FAQ_ARTICLES.map(a => a.slug);
}

/**
 * Get articles related to a product category.
 * Returns articles whose relatedCategories include that category value.
 */
export function getArticlesForCategory(categoryValue: string): FaqArticle[] {
  return FAQ_ARTICLES.filter(a =>
    a.relatedCategories.some(rc => rc.value === categoryValue)
  );
}
