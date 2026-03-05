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
  datePublished?: string; // 'YYYY-MM-DD'
  dateModified?: string; // 'YYYY-MM-DD'
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
    sections: [
      {
        title: '¿Cuales son los beneficios de un sistema de riego bien instalado?',
        type: 'text',
        content: `Un sistema de riego profesional reduce el consumo de agua hasta un <strong>30%</strong>, aumenta el rendimiento de los cultivos en promedio un <strong>50%</strong> y puede reducir los costos operativos en un <strong>40%</strong> frente al riego manual. En Uruguay, donde las lluvias son irregulares en verano, un sistema bien instalado marca la diferencia entre una buena y una mala cosecha.`,
      },
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
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
      {
        title: '¿Cuantos Aspersores Puede Manejar Cada Potencia?',
        type: 'table',
        content: `<table>
<thead><tr><th>Potencia (HP)</th><th>Aspersores de Impacto</th><th>Caudal Total (l/h)</th><th>Presion Disponible (bar)</th></tr></thead>
<tbody>
<tr><td>0.5</td><td>2-3</td><td>800 - 1.500</td><td>2.5 - 3.0</td></tr>
<tr><td>0.75</td><td>3-4</td><td>1.200 - 2.000</td><td>3.0 - 3.5</td></tr>
<tr><td>1.0</td><td>4-6</td><td>1.600 - 3.000</td><td>3.0 - 4.0</td></tr>
<tr><td>1.5</td><td>6-8</td><td>2.400 - 4.000</td><td>3.5 - 4.0</td></tr>
<tr><td>2.0</td><td>8-12</td><td>3.200 - 6.000</td><td>3.5 - 4.5</td></tr>
<tr><td>3.0</td><td>12-20</td><td>4.800 - 10.000</td><td>4.0 - 5.0</td></tr>
</tbody>
</table>
<p><strong>Ejemplo:</strong> Para 4 aspersores de impacto de 500 l/h cada uno, con presion de 3 bar y 50m de tuberia, necesitas una bomba de al menos 1 HP. Se recomienda 1.5 HP para mayor eficiencia y margen de seguridad. Consulta nuestra guia completa de bombas para aspersores.</p>`,
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
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
      {
        title: 'Seguridad con Productos de La Aldea',
        type: 'list',
        content: `<ul>
<li><strong>Cloro para piscinas:</strong> Almacenar en lugar fresco y seco, lejos de acidos. Nunca mezclar cloro granulado con algicidas directamente. Usar guantes y evitar inhalar el polvo.</li>
<li><strong>Algicidas y reguladores de pH:</strong> Agregar siempre al agua (no al reves) para evitar salpicaduras. Lavar manos despues de la manipulacion.</li>
<li><strong>Herbicidas e insecticidas:</strong> Usar EPP completo: guantes de nitrilo, gafas y mascarilla. Respetar los periodos de carencia indicados en la etiqueta.</li>
<li><strong>Desengrasantes industriales:</strong> Ventilacion obligatoria. No mezclar con productos acidos. Lavar con abundante agua en caso de contacto con piel.</li>
<li><strong>Centro de Toxicologia Uruguay (CIAT):</strong> <strong>1722</strong> — llamar en caso de intoxicacion accidental.</li>
</ul>
<p>En <a href="/productos?categoria=Piscinas">productos para piscinas</a> y <a href="/productos?categoria=Agroquimicos">agroquimicos</a> encontras todo lo que necesitas con ficha tecnica disponible. Consultanos por <a href="https://wa.me/59892744725">WhatsApp</a> para asesoramiento.</p>`,
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
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
    datePublished: '2025-01-15',
    dateModified: '2026-03-05',
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
  // ── 11. Que es el Riego Agricola ─────────────────────────────────────────
  {
    slug: 'que-es-riego-agricola',
    title: '¿Que es el Riego Agricola? Guia Completa para Uruguay',
    description: 'Definicion, tipos, importancia y sistemas de riego agricola en Uruguay. Guia tecnica de La Aldea, Tala, Canelones.',
    breadcrumbLabel: 'Riego Agricola',
    category: 'Sistemas de Riego',
    keywords: ['que es el riego agricola', 'riego agricola Uruguay', 'importancia riego agricola', 'tipos de riego', 'sistemas de riego', 'riego agricola definicion'],
    relatedCategories: [
      { label: 'Sistemas de Riego', value: 'Riego' },
    ],
    relatedArticles: ['diseno-riego', 'beneficios-riego', 'instalaciones-hidraulicas', 'cuanta-agua-por-hectarea'],
    datePublished: '2025-06-01',
    dateModified: '2026-03-05',
    sections: [
      {
        title: '¿Que es el Riego Agricola?',
        type: 'text',
        content: `<p>El riego agricola es el suministro controlado y artificial de agua a los cultivos para complementar o sustituir las lluvias naturales. En Uruguay, donde la variabilidad climatica puede reducir cosechas hasta un 40%, un sistema de riego bien diseñado aumenta el rendimiento entre un 30% y un 50% por hectarea.</p>
<p>Se trata de una practica esencial para la produccion agropecuaria moderna: permite regar en el momento optimo, con la cantidad justa de agua, independientemente de las condiciones meteorologicas. En zonas como Canelones, San Jose y Soriano, el riego tecnificado se ha convertido en un diferencial competitivo para productores de soja, papa, hortalizas y frutales.</p>`,
      },
      {
        title: 'Breve Historia del Riego',
        type: 'text',
        content: `<p>El riego es una de las tecnologias mas antiguas de la humanidad. Las primeras civilizaciones de <strong>Mesopotamia</strong> (actual Irak) desarrollaron canales de riego hace mas de 6.000 años para cultivar en zonas aridas. En America, los <strong>incas</strong> construyeron sistemas de terrazas y canales en los Andes que siguen funcionando hoy.</p>
<p>En <strong>Uruguay</strong>, el riego agricola comenzo a desarrollarse a mediados del siglo XX, principalmente para el cultivo de arroz en el este del pais. En las ultimas decadas, la adopcion del riego por goteo y aspersion se expandio a la horticultura, fruticultura y ganaderia, especialmente en departamentos como <strong>Canelones, Salto y Paysandu</strong>. Hoy, la tecnificacion avanza rapidamente con sistemas de control automatico, sensores de humedad y bombeo solar.</p>`,
      },
      {
        title: '¿Para Que Sirve el Riego?',
        type: 'list',
        content: `<ul>
<li><strong>Asegurar el suministro de agua:</strong> Garantiza que los cultivos reciban la cantidad necesaria de agua sin depender exclusivamente de las lluvias</li>
<li><strong>Aumentar la productividad:</strong> Permite rendimientos hasta un 50% superiores al cultivo en secano</li>
<li><strong>Estabilizar la produccion:</strong> Reduce el riesgo de perdidas por sequia, especialmente en los veranos uruguayos cada vez mas calurosos</li>
<li><strong>Optimizar el uso de insumos:</strong> La fertirrigacion permite aplicar fertilizantes junto con el agua, mejorando la eficiencia</li>
<li><strong>Habilitar cultivos fuera de temporada:</strong> Permite extender los ciclos productivos y diversificar los cultivos</li>
</ul>`,
      },
      {
        title: 'Los 4 Tipos de Riego Agricola',
        type: 'table',
        content: `<table>
<thead><tr><th>Tipo de Riego</th><th>Eficiencia Hidrica</th><th>Cultivos Ideales</th><th>Presion Requerida</th><th>Costo Instalacion</th></tr></thead>
<tbody>
<tr><td><strong>Goteo</strong></td><td>90-95%</td><td>Hortalizas, frutales, viñedos, arandanos</td><td>1-2 bar</td><td>Medio-alto</td></tr>
<tr><td><strong>Aspersion</strong></td><td>70-85%</td><td>Praderas, cereales, soja, pasturas</td><td>2-4 bar</td><td>Medio</td></tr>
<tr><td><strong>Superficie/Gravedad</strong></td><td>40-60%</td><td>Arroz, pasturas en zonas planas</td><td>Sin presion</td><td>Bajo</td></tr>
<tr><td><strong>Subterraneo</strong></td><td>92-98%</td><td>Cesped, viñedos, frutales permanentes</td><td>1-2 bar</td><td>Alto</td></tr>
</tbody>
</table>
<p>El <strong>riego por goteo</strong> es el mas eficiente para la mayoria de los cultivos intensivos en Uruguay, mientras que la <strong>aspersion</strong> es la opcion mas practica para cultivos extensivos y praderas ganaderas.</p>`,
      },
      {
        title: 'Cultivos y Necesidades Hidricas en Uruguay',
        type: 'table',
        content: `<table>
<thead><tr><th>Cultivo</th><th>mm/temporada</th><th>Tipo de Riego Ideal</th><th>Zona Principal en Uruguay</th></tr></thead>
<tbody>
<tr><td>Soja</td><td>400-600</td><td>Aspersion / Pivot</td><td>Soriano, Colonia, Rio Negro</td></tr>
<tr><td>Papa</td><td>500-700</td><td>Goteo / Aspersion</td><td>Canelones, San Jose</td></tr>
<tr><td>Maiz</td><td>500-800</td><td>Aspersion / Pivot</td><td>Soriano, Paysandu, Salto</td></tr>
<tr><td>Trigo</td><td>300-450</td><td>Aspersion</td><td>Soriano, Colonia, Rio Negro</td></tr>
<tr><td>Tomate</td><td>600-900</td><td>Goteo</td><td>Canelones, Salto</td></tr>
<tr><td>Cebolla</td><td>400-550</td><td>Goteo / Aspersion</td><td>Canelones, Salto</td></tr>
<tr><td>Pradera</td><td>300-500</td><td>Aspersion</td><td>Todo el pais</td></tr>
<tr><td>Viñedo</td><td>350-500</td><td>Goteo</td><td>Canelones, Montevideo, Maldonado</td></tr>
</tbody>
</table>
<p>Estos valores son orientativos y varian segun la variedad, el tipo de suelo y las condiciones climaticas de cada temporada.</p>`,
      },
      {
        title: 'El Riego en el Contexto Climatico de Uruguay',
        type: 'text',
        content: `<p>Uruguay tiene un clima templado con precipitaciones anuales promedio de <strong>1.200-1.400 mm</strong>, pero su distribucion es irregular. Los meses de verano (diciembre a marzo) concentran la mayor demanda hidrica de los cultivos y, paradojicamente, suelen presentar periodos de deficit con temperaturas de 30-35°C y alta evapotranspiracion.</p>
<p>Las <strong>sequias estivales</strong> se han vuelto mas frecuentes e intensas en las ultimas decadas. En la temporada 2022-2023, Uruguay enfrento una sequia historica que afecto gravemente a productores sin riego. Los suelos predominantes en la zona sur (Canelones, San Jose, Montevideo) tienen buena capacidad de retencion, pero en los suelos arenosos del litoral norte la perdida de agua es mas rapida.</p>
<p>El riego tecnificado — especialmente goteo y aspersion con automatizacion — se ha convertido en una herramienta indispensable para asegurar la rentabilidad y estabilidad de la produccion agropecuaria en todo el territorio.</p>`,
      },
      {
        title: '¿Cuando es Indispensable el Riego?',
        type: 'comparison',
        content: `<div>
<div>
<h4>El riego es indispensable cuando:</h4>
<ul>
<li>El cultivo esta en etapa critica (floracion, llenado de grano, cuajado de fruto)</li>
<li>Las precipitaciones son inferiores a la demanda del cultivo por mas de 7-10 dias</li>
<li>Se trabaja con cultivos de alto valor (frutales, hortalizas, arandanos)</li>
<li>El suelo es arenoso o de baja retencion hidrica</li>
<li>Se busca producir fuera de temporada o extender ciclos</li>
</ul>
</div>
<div>
<h4>Puede prescindirse del riego cuando:</h4>
<ul>
<li>Las lluvias son regulares y cubren la demanda del cultivo</li>
<li>El suelo tiene alta capacidad de retencion de agua</li>
<li>Se cultivan especies resistentes a la sequia (pasturas naturales, algunos cereales)</li>
<li>El costo del sistema supera el beneficio economico esperado</li>
<li>Hay acceso limitado a fuentes de agua</li>
</ul>
</div>
</div>`,
      },
    ],
  },

  // ── 12. Cuanta Agua por Hectarea ──────────────────────────────────────────
  {
    slug: 'cuanta-agua-por-hectarea',
    title: '¿Cuanta Agua Necesita una Hectarea? Calculos para Uruguay',
    description: 'Cuantos m3 de agua por hectarea para maiz, soja, papa y hortalizas en Uruguay. Tablas, formulas y guia de calculo de caudal.',
    breadcrumbLabel: 'Agua por Hectarea',
    category: 'Sistemas de Riego',
    keywords: ['cuantos m3 para regar una hectarea', 'consumo agua goteo hectarea', 'calcular caudal riego', 'agua hectarea maiz Uruguay', 'litros por hectarea'],
    relatedCategories: [
      { label: 'Sistemas de Riego', value: 'Riego' },
    ],
    relatedArticles: ['que-es-riego-agricola', 'diseno-riego', 'seleccion-bombas', 'energias-renovables'],
    datePublished: '2025-06-01',
    dateModified: '2026-03-05',
    sections: [
      {
        title: '¿Cuantos m3 de Agua Necesita una Hectarea?',
        type: 'text',
        content: `<p>Para regar una hectarea se necesitan entre <strong>3.000 y 9.000 m3 de agua por temporada</strong>, dependiendo del cultivo, el sistema de riego utilizado y las condiciones climaticas. Un cultivo de papa en Canelones, por ejemplo, requiere entre 5.000 y 7.000 m3/ha con riego por goteo.</p>
<p>Estos valores varian significativamente segun la evapotranspiracion de cada zona de Uruguay, el tipo de suelo, la etapa del cultivo y la eficiencia del sistema de riego. A continuacion, la tabla detallada por cultivo con datos orientados al clima uruguayo.</p>`,
      },
      {
        title: 'Necesidades Hidricas por Cultivo en Uruguay',
        type: 'table',
        content: `<table>
<thead><tr><th>Cultivo</th><th>Necesidad Hidrica Total (m3/ha)</th><th>Demanda Pico (m3/ha/dia)</th><th>Sistema Recomendado</th></tr></thead>
<tbody>
<tr><td>Soja</td><td>3.000 - 5.000</td><td>50 - 60</td><td>Aspersion / Pivot central</td></tr>
<tr><td>Maiz</td><td>5.000 - 8.000</td><td>60 - 80</td><td>Aspersion / Pivot central</td></tr>
<tr><td>Papa</td><td>4.000 - 6.000</td><td>45 - 55</td><td>Goteo / Aspersion</td></tr>
<tr><td>Trigo</td><td>3.000 - 4.500</td><td>30 - 45</td><td>Aspersion</td></tr>
<tr><td>Tomate</td><td>6.000 - 9.000</td><td>50 - 70</td><td>Goteo</td></tr>
<tr><td>Cebolla</td><td>4.000 - 5.500</td><td>35 - 45</td><td>Goteo / Aspersion</td></tr>
<tr><td>Pradera</td><td>3.000 - 5.000</td><td>40 - 55</td><td>Aspersion</td></tr>
<tr><td>Viñedo</td><td>2.500 - 4.000</td><td>25 - 35</td><td>Goteo</td></tr>
<tr><td>Arandano</td><td>4.000 - 6.000</td><td>35 - 50</td><td>Goteo</td></tr>
</tbody>
</table>
<p>Valores calculados para una ETo media de 4-5 mm/dia en verano uruguayo, con ajustes segun el coeficiente de cultivo (Kc) de cada especie.</p>`,
      },
      {
        title: '¿Como Calcular el Caudal Necesario?',
        type: 'text',
        content: `<p>La formula basica para calcular el caudal necesario del sistema de riego es:</p>
<p><code>Q = (A x ETc x Ke) / (Ef x Th)</code></p>
<p>Donde:</p>
<ul>
<li><strong>Q</strong> = Caudal necesario (m3/h)</li>
<li><strong>A</strong> = Area a regar (ha)</li>
<li><strong>ETc</strong> = Evapotranspiracion del cultivo (mm/dia)</li>
<li><strong>Ke</strong> = Coeficiente de seguridad (1.1 a 1.2)</li>
<li><strong>Ef</strong> = Eficiencia del sistema (0.90 para goteo, 0.75 para aspersion)</li>
<li><strong>Th</strong> = Horas de riego por dia</li>
</ul>
<p><strong>Ejemplo concreto:</strong> Para 5 hectareas de papa en Canelones con riego por goteo:</p>
<ul>
<li>ETc en pico = 5.5 mm/dia (ETo 5 mm/dia x Kc 1.1)</li>
<li>Ef (goteo) = 0.90</li>
<li>Ke = 1.15</li>
<li>Th = 12 horas de riego</li>
</ul>
<p><code>Q = (5 x 55 x 1.15) / (0.90 x 12) = 316.25 / 10.8 = 29.3 m3/h</code></p>
<p>Es decir, necesitas una bomba capaz de entregar al menos <strong>29-30 m3/h</strong> para regar las 5 hectareas de papa con goteo.</p>`,
      },
      {
        title: 'Goteo vs Aspersion: Consumo de Agua por Cultivo',
        type: 'table',
        content: `<table>
<thead><tr><th>Cultivo</th><th>Consumo con Goteo (m3/ha)</th><th>Consumo con Aspersion (m3/ha)</th><th>Ahorro con Goteo</th></tr></thead>
<tbody>
<tr><td>Papa</td><td>4.000 - 5.000</td><td>5.500 - 7.000</td><td>25-30%</td></tr>
<tr><td>Tomate</td><td>5.500 - 7.000</td><td>7.500 - 9.500</td><td>25-30%</td></tr>
<tr><td>Viñedo</td><td>2.500 - 3.500</td><td>3.500 - 5.000</td><td>30-35%</td></tr>
<tr><td>Cebolla</td><td>3.500 - 4.500</td><td>5.000 - 6.500</td><td>30%</td></tr>
<tr><td>Pradera</td><td>N/A (no aplica)</td><td>3.500 - 5.500</td><td>-</td></tr>
<tr><td>Arandano</td><td>3.500 - 5.000</td><td>5.000 - 7.000</td><td>30%</td></tr>
</tbody>
</table>
<p>El riego por <strong>goteo ahorra entre un 25% y 35% de agua</strong> frente a la aspersion, ademas de reducir la proliferacion de malezas y enfermedades fungicas.</p>`,
      },
      {
        title: 'Factores que Afectan el Consumo de Agua',
        type: 'list',
        content: `<ul>
<li><strong>Tipo de suelo:</strong> Los suelos arenosos drenan mas rapido y necesitan riegos mas frecuentes. Los arcillosos retienen mejor la humedad pero tienen riesgo de encharcamiento</li>
<li><strong>Evapotranspiracion de referencia (ETo):</strong> En Uruguay varia entre 2 mm/dia en invierno y 5-6 mm/dia en verano, lo que modifica directamente la demanda de agua</li>
<li><strong>Coeficiente de cultivo (Kc):</strong> Cada cultivo tiene un Kc que varia segun su etapa de crecimiento (inicial 0.3-0.5, desarrollo 0.7-0.9, mediados 1.0-1.2, maduracion 0.6-0.8)</li>
<li><strong>Pendiente del terreno:</strong> Terrenos con pendiente generan escorrentia, reduciendo la eficiencia del riego por superficie</li>
<li><strong>Uso de mulch o cobertura:</strong> El acolchado plastico o vegetal reduce la evaporacion superficial entre un 20-30%</li>
<li><strong>Automatizacion:</strong> Los sistemas con sensores de humedad y controladores inteligentes optimizan el momento y la cantidad de riego, ahorrando hasta un 20% adicional</li>
</ul>`,
      },
      {
        title: 'Herramientas para Calcular las Necesidades Hidricas',
        type: 'text',
        content: `<p>La formula mas utilizada para estimar las necesidades hidricas de un cultivo es:</p>
<p><code>ETc = ETo x Kc</code></p>
<p>Donde <strong>ETc</strong> es la evapotranspiracion del cultivo, <strong>ETo</strong> es la evapotranspiracion de referencia (medida por estaciones meteorologicas o estimada con la formula de Penman-Monteith) y <strong>Kc</strong> es el coeficiente del cultivo.</p>
<p><strong>Valores de Kc para cultivos uruguayos comunes:</strong></p>
<ul>
<li>Soja: Kc inicial 0.4, medio 1.15, final 0.5</li>
<li>Papa: Kc inicial 0.5, medio 1.15, final 0.75</li>
<li>Maiz: Kc inicial 0.3, medio 1.20, final 0.6</li>
<li>Tomate: Kc inicial 0.6, medio 1.15, final 0.8</li>
<li>Pradera: Kc promedio 0.85-1.0</li>
</ul>
<p>En La Aldea te ayudamos a dimensionar tu sistema de riego con estos calculos. Consultanos sin costo para un presupuesto personalizado.</p>`,
      },
    ],
  },

  // ── 13. Bomba para Aspersores ─────────────────────────────────────────────
  {
    slug: 'bomba-para-aspersores',
    title: '¿Que Bomba Necesito para mis Aspersores? Guia de Seleccion',
    description: 'Como elegir la bomba correcta segun el numero de aspersores: potencia, caudal, presion y tabla de dimensionamiento. La Aldea, Uruguay.',
    breadcrumbLabel: 'Bomba para Aspersores',
    category: 'Bombas de Agua',
    keywords: ['que bomba para 4 aspersores', 'cuantos aspersores bomba 2hp', 'bomba riego aspersion', 'dimensionamiento bomba aspersores', 'bomba para riego'],
    relatedCategories: [
      { label: 'Bombas de Agua', value: 'Bombas' },
    ],
    relatedArticles: ['tipos-bombas', 'seleccion-bombas', 'instalaciones-hidraulicas', 'cuanta-agua-por-hectarea'],
    datePublished: '2025-06-01',
    dateModified: '2026-03-05',
    sections: [
      {
        title: '¿Que Bomba Necesito para 4 Aspersores?',
        type: 'text',
        content: `<p>Para alimentar <strong>4 aspersores de impacto</strong> con caudal de 500 l/h cada uno, necesitas una bomba de al menos <strong>1 HP</strong> con presion de 3-4 bar. El dimensionamiento exacto depende de la distancia entre la bomba y los aspersores, el desnivel del terreno y el diametro de la tuberia.</p>
<p>La regla general es sumar el caudal total de todos los aspersores, agregar un 15-20% por perdidas de carga en tuberias y accesorios, y seleccionar una bomba que entregue esa combinacion de caudal y presion en su punto de maxima eficiencia.</p>`,
      },
      {
        title: 'Tabla de Dimensionamiento Rapido',
        type: 'table',
        content: `<table>
<thead><tr><th>Cant. Aspersores</th><th>Caudal Total (l/h)</th><th>Presion Minima (bar)</th><th>HP Recomendado</th><th>Tipo de Bomba Sugerido</th></tr></thead>
<tbody>
<tr><td>2</td><td>800 - 1.000</td><td>2.5 - 3.0</td><td>0.5 - 0.75</td><td>Superficie periferica</td></tr>
<tr><td>4</td><td>1.600 - 2.000</td><td>3.0 - 3.5</td><td>1.0</td><td>Superficie centrifuga</td></tr>
<tr><td>6</td><td>2.400 - 3.000</td><td>3.0 - 3.5</td><td>1.5</td><td>Centrifuga o autocebante</td></tr>
<tr><td>8</td><td>3.200 - 4.000</td><td>3.0 - 4.0</td><td>2.0</td><td>Centrifuga</td></tr>
<tr><td>12</td><td>4.800 - 6.000</td><td>3.5 - 4.0</td><td>3.0</td><td>Centrifuga de alta presion</td></tr>
<tr><td>20</td><td>8.000 - 10.000</td><td>3.5 - 4.5</td><td>5.0+</td><td>Centrifuga industrial</td></tr>
</tbody>
</table>
<p>Valores basados en aspersores de impacto agricola estandar con caudal de 400-500 l/h a presion de 2.5-3.5 bar. Para aspersores de jardin (emergentes/rotores) los caudales suelen ser menores.</p>`,
      },
      {
        title: '¿Como Calcular la Potencia Necesaria?',
        type: 'text',
        content: `<p>La formula simplificada para la altura manometrica total es:</p>
<p><code>Htotal = Hgeometrica + Hfriccion + Huso</code></p>
<p>Donde:</p>
<ul>
<li><strong>Hgeometrica</strong> = Diferencia de altura entre la bomba y el aspersor mas alto (en metros)</li>
<li><strong>Hfriccion</strong> = Perdidas por friccion en tuberias y accesorios (generalmente 10-20% de la longitud total)</li>
<li><strong>Huso</strong> = Presion que necesita el aspersor para funcionar (ej: 3 bar = 30 metros de columna de agua)</li>
</ul>
<p><strong>Ejemplo concreto:</strong> Sistema con 4 aspersores, bomba a nivel del suelo, aspersores a 2 metros de altura, 80 metros de tuberia de 1.5" y aspersores que necesitan 3 bar:</p>
<ul>
<li>Hgeometrica = 2 m</li>
<li>Hfriccion = 80 m x 0.12 = 9.6 m (12% de perdida para tuberia de 1.5")</li>
<li>Huso = 30 m (3 bar)</li>
<li><strong>Htotal = 2 + 9.6 + 30 = 41.6 m</strong></li>
</ul>
<p>Con un caudal de 2.000 l/h y 42 m de altura manometrica, necesitas una bomba de <strong>1 HP</strong> como minimo. Se recomienda seleccionar un 15-20% por encima: una bomba de <strong>1.5 HP</strong> funcionara con mayor eficiencia y margen.</p>`,
      },
      {
        title: 'Variables que Cambian el Calculo',
        type: 'list',
        content: `<ul>
<li><strong>Pendiente del terreno:</strong> Cada metro de desnivel agrega 1 metro a la altura geometrica. En terrenos con mucha pendiente la bomba necesita ser mas potente</li>
<li><strong>Longitud de tuberia:</strong> A mayor distancia entre bomba y aspersores, mayores perdidas por friccion. Tuberias de 50mm pierden menos que las de 32mm a mismo caudal</li>
<li><strong>Diametro de tuberia:</strong> Tuberia subdimensionada genera exceso de friccion. Regla practica: velocidad del agua no debe superar 1.5 m/s</li>
<li><strong>Tipo de aspersor:</strong> Los aspersores de impacto necesitan 2.5-4 bar, los emergentes de rotor 2-3 bar, y los difusores/spray 1-2 bar</li>
<li><strong>Simultaneidad:</strong> Si no todos los aspersores funcionan al mismo tiempo (riego por sectores), la bomba puede ser mas chica</li>
</ul>`,
      },
      {
        title: 'Aspersores de Impacto vs Emergentes',
        type: 'comparison',
        content: `<div>
<div>
<h4>Aspersores de Impacto</h4>
<ul>
<li>Caudal: 400-1.500 l/h</li>
<li>Presion: 2.5-4.0 bar</li>
<li>Alcance: 8-15 metros de radio</li>
<li>Uso ideal: Agricultura, praderas, campos</li>
<li>Ventaja: Robustos, economicos, faciles de mover</li>
<li>Instalacion: Sobre tubo o tripode, portatil</li>
</ul>
</div>
<div>
<h4>Aspersores Emergentes / Rotores</h4>
<ul>
<li>Caudal: 200-1.000 l/h</li>
<li>Presion: 2.0-3.5 bar</li>
<li>Alcance: 5-12 metros de radio</li>
<li>Uso ideal: Jardines, parques, canchas</li>
<li>Ventaja: Esteticos, ocultos bajo tierra, automaticos</li>
<li>Instalacion: Enterrados, sistema fijo permanente</li>
</ul>
</div>
</div>`,
      },
      {
        title: 'Altura Manometrica por Potencia de Bomba',
        type: 'table',
        content: `<table>
<thead><tr><th>Potencia (HP)</th><th>Caudal Maximo (l/h)</th><th>Altura Maxima (m)</th><th>Aspersores Orientativos</th></tr></thead>
<tbody>
<tr><td>0.5</td><td>2.500</td><td>30</td><td>2-3</td></tr>
<tr><td>0.75</td><td>3.500</td><td>38</td><td>3-4</td></tr>
<tr><td>1.0</td><td>4.500</td><td>45</td><td>4-6</td></tr>
<tr><td>1.5</td><td>6.000</td><td>50</td><td>6-8</td></tr>
<tr><td>2.0</td><td>8.000</td><td>55</td><td>8-12</td></tr>
<tr><td>3.0</td><td>12.000</td><td>60</td><td>12-20</td></tr>
</tbody>
</table>
<p>Estos valores son orientativos para bombas centrifugas de superficie. El rendimiento real depende de la marca, el modelo y las condiciones de instalacion. En La Aldea te asesoramos para elegir la bomba exacta que necesitas — consultanos sin costo.</p>`,
      },
    ],
  },

  // ── 14. Que es una Drogueria ──────────────────────────────────────────────
  {
    slug: 'que-es-una-drogueria',
    title: '¿Que es una Drogueria? Diferencia con Farmacia y Que Vende en Uruguay',
    description: 'Que es una drogueria en Uruguay, diferencias con la farmacia, que productos se venden y por que se llaman asi. La Aldea, Tala.',
    breadcrumbLabel: 'Drogueria',
    category: 'Drogueria',
    keywords: ['que es una drogueria', 'drogueria Uruguay', 'diferencia farmacia drogueria', 'que vende una drogueria', 'drogueria industrial'],
    relatedCategories: [
      { label: 'Drogueria', value: 'Drogueria' },
      { label: 'Productos Quimicos', value: 'Quimicos' },
    ],
    relatedArticles: ['seguridad-quimicos', 'mantenimiento-piscinas'],
    datePublished: '2025-06-01',
    dateModified: '2026-03-05',
    sections: [
      {
        title: '¿Que es una Drogueria?',
        type: 'text',
        content: `<p>Una drogueria es un comercio que vende productos de limpieza, higiene, cuidado personal, pinturas, agroquimicos y productos quimicos industriales, <strong>sin despachar medicamentos con receta</strong> como lo hace una farmacia. En Uruguay, las droguerias son establecimientos habituales en ciudades y pueblos de todo el pais.</p>
<p>A diferencia de una farmacia habilitada por el Ministerio de Salud Publica (MSP), una drogueria no requiere la presencia de un quimico farmaceutico y no puede vender medicamentos de venta bajo receta. Sin embargo, puede comercializar una amplia gama de productos para el hogar, la higiene personal, la industria y el agro.</p>`,
      },
      {
        title: '¿Por Que se Llaman Droguerias?',
        type: 'text',
        content: `<p>El termino <strong>"drogueria"</strong> proviene de la palabra <strong>"droga"</strong>, que originalmente no tenia la connotacion negativa actual. En la Edad Media y el Renacimiento, las "drogas" eran sustancias naturales — hierbas, tintes, especias, productos quimicos y materias primas — que se usaban en medicina, tintoreria, perfumeria y artesania.</p>
<p>Los comercios que vendian estas sustancias se llamaron <strong>droguerias</strong>, y el termino se conservo en America Latina para denominar a los locales que venden productos quimicos, de limpieza e higiene. En algunos paises como Colombia, "drogueria" se usa como sinonimo de farmacia. En <strong>Uruguay, Argentina y Brasil</strong>, una drogueria se distingue claramente de una farmacia.</p>`,
      },
      {
        title: 'Farmacia vs Drogueria',
        type: 'comparison',
        content: `<div>
<div>
<h4>Lo que vende una Farmacia</h4>
<ul>
<li>Medicamentos con receta medica</li>
<li>Medicamentos de venta libre (OTC)</li>
<li>Suplementos vitaminicos y nutricionales</li>
<li>Cosmeticos y dermocosmetica</li>
<li>Productos de higiene personal</li>
<li>Perfumeria fina</li>
<li>Habilitada por el MSP, requiere quimico farmaceutico</li>
</ul>
</div>
<div>
<h4>Lo que vende una Drogueria</h4>
<ul>
<li>Productos de limpieza del hogar (lavandina, detergentes, desengrasantes)</li>
<li>Higiene personal (jabon, shampoo, desodorante)</li>
<li>Agroquimicos y productos fitosanitarios</li>
<li>Productos para piscinas (cloro, alguicida, clarificante)</li>
<li>Pinturas, solventes y adhesivos</li>
<li>Equipos de proteccion personal (EPP)</li>
<li>Productos quimicos industriales</li>
<li>No requiere habilitacion del MSP para productos no farmaceuticos</li>
</ul>
</div>
</div>`,
      },
      {
        title: 'Productos Tipicos de una Drogueria en Uruguay',
        type: 'list',
        content: `<ul>
<li><strong>Limpieza del hogar:</strong> Lavandina, detergentes, desengrasantes, cera para pisos, limpiadores multiuso, desodorantes de ambientes</li>
<li><strong>Higiene personal:</strong> Jabones, shampoo, acondicionadores, cepillos de dientes, pasta dental, desodorantes</li>
<li><strong>Cuidado capilar:</strong> Tinturas, tratamientos capilares, keratina, productos para peluqueria</li>
<li><strong>Pinturas y solventes:</strong> Pinturas latex y sinteticas, barnices, thinner, aguarras, adhesivos</li>
<li><strong>Productos quimicos industriales:</strong> Acidos, soda caustica, solventes, productos para tratamiento de agua</li>
<li><strong>Agroquimicos:</strong> Herbicidas, insecticidas, fungicidas, fertilizantes</li>
<li><strong>Equipos de proteccion personal (EPP):</strong> Guantes, gafas de seguridad, mascaras, mamelucos</li>
<li><strong>Productos para piscinas:</strong> Cloro granulado y en pastillas, alguicida, clarificante, regulador de pH</li>
</ul>`,
      },
      {
        title: 'La Drogueria en Uruguay: Contexto Legal y Comercial',
        type: 'text',
        content: `<p>En Uruguay, las droguerias que venden productos quimicos al publico deben cumplir con las normativas de etiquetado y seguridad vigentes, incluyendo el Sistema Globalmente Armonizado de clasificacion y etiquetado de productos quimicos (GHS). Los productos agroquimicos requieren registro ante el MGAP (Ministerio de Ganaderia, Agricultura y Pesca).</p>
<p>A diferencia de las farmacias, las droguerias <strong>no necesitan habilitacion del MSP</strong> para operar, salvo que comercialicen productos regulados como biocidas o desinfectantes de uso hospitalario. Las droguerias industriales deben contar con fichas de seguridad (SDS) para todos sus productos quimicos.</p>
<p>En <strong>La Aldea</strong>, somos una drogueria ubicada en Tala, Canelones, que combina la venta de productos de drogueria con sistemas de riego, bombas de agua, herramientas e insumos agropecuarios. Todos nuestros productos quimicos incluyen ficha de seguridad y asesoramiento tecnico.</p>`,
      },
      {
        title: 'Tipos de Droguerias en Uruguay',
        type: 'list',
        content: `<ul>
<li><strong>Drogueria de consumo domestico:</strong> Vende principalmente productos de limpieza, higiene personal y cuidado del hogar al consumidor final. Es el tipo de drogueria mas comun en barrios y ciudades chicas</li>
<li><strong>Drogueria industrial:</strong> Comercializa productos quimicos para industria, agricultura, tratamiento de agua y procesos productivos. Suele vender en mayores volumenes y requiere fichas de seguridad (SDS) para todos sus productos</li>
<li><strong>Drogueria mixta:</strong> Combina productos de consumo domestico con productos industriales y agroquimicos. Es el modelo mas comun en ciudades del interior de Uruguay, como La Aldea en Tala</li>
</ul>`,
      },
    ],
  },

  // ── 15. Goteo vs Aspersion ────────────────────────────────────────────────
  {
    slug: 'goteo-vs-aspersion',
    title: 'Riego por Goteo vs Aspersion: Comparativa Completa para Uruguay',
    description: 'Comparacion tecnica y economica entre riego por goteo y aspersion: eficiencia, costos, cultivos ideales y cuando elegir cada uno en Uruguay.',
    breadcrumbLabel: 'Goteo vs Aspersion',
    category: 'Sistemas de Riego',
    keywords: ['riego goteo vs aspersion', 'diferencia goteo aspersion', 'ventajas riego por goteo', 'comparativa sistemas riego Uruguay', 'cual es mejor goteo o aspersion'],
    relatedCategories: [
      { label: 'Sistemas de Riego', value: 'Riego' },
    ],
    relatedArticles: ['que-es-riego-agricola', 'beneficios-riego', 'diseno-riego', 'cuanta-agua-por-hectarea'],
    datePublished: '2025-06-01',
    dateModified: '2026-03-05',
    sections: [
      {
        title: '¿Cual es la Diferencia entre Goteo y Aspersion?',
        type: 'text',
        content: `<p>El <strong>riego por goteo</strong> aplica agua directamente en la zona radicular de cada planta a traves de emisores (goteros) con una eficiencia del 90-95%, ideal para hortalizas, frutales y viñedos. La <strong>aspersion</strong> distribuye agua en forma de lluvia sobre toda la superficie con una eficiencia del 70-85%, ideal para praderas, pasturas y cultivos extensivos.</p>
<p>La eleccion entre goteo y aspersion depende del cultivo, el tamaño del terreno, la disponibilidad de agua y el presupuesto. En Uruguay, ambos sistemas se utilizan ampliamente: el goteo predomina en horticultura y fruticultura intensiva (Canelones, Salto), mientras que la aspersion es mas comun en ganaderia y cultivos extensivos (Soriano, Paysandu, Rio Negro).</p>`,
      },
      {
        title: 'Comparativa Tecnica Detallada',
        type: 'table',
        content: `<table>
<thead><tr><th>Criterio</th><th>Riego por Goteo</th><th>Riego por Aspersion</th></tr></thead>
<tbody>
<tr><td>Eficiencia hidrica</td><td>90-95%</td><td>70-85%</td></tr>
<tr><td>Presion de trabajo</td><td>1-2 bar</td><td>2-4 bar</td></tr>
<tr><td>Costo instalacion/ha</td><td>USD 1.500-3.500</td><td>USD 800-2.000</td></tr>
<tr><td>Vida util</td><td>5-10 años (cinta) / 15+ años (tuberia)</td><td>15-25 años</td></tr>
<tr><td>Mantenimiento</td><td>Medio (limpieza filtros, revision goteros)</td><td>Bajo (revision aspersores anual)</td></tr>
<tr><td>Fertirrigacion</td><td>Excelente (inyeccion precisa)</td><td>Posible pero menos precisa</td></tr>
<tr><td>Malezas</td><td>Reduce crecimiento (moja solo la planta)</td><td>Favorece malezas (moja todo)</td></tr>
<tr><td>Enfermedades foliares</td><td>Reduce riesgo (no moja hojas)</td><td>Mayor riesgo (moja follaje)</td></tr>
<tr><td>Viento</td><td>Sin efecto</td><td>Pierde uniformidad con viento >15 km/h</td></tr>
<tr><td>Automatizacion</td><td>Sencilla y precisa</td><td>Sencilla</td></tr>
</tbody>
</table>`,
      },
      {
        title: '¿Cuando Elegir Cada Sistema?',
        type: 'comparison',
        content: `<div>
<div>
<h4>Elegi Riego por Goteo si:</h4>
<ul>
<li>Cultivas hortalizas, frutales, viñedos o arandanos</li>
<li>El agua disponible es limitada o costosa</li>
<li>Necesitas fertirregar con precision</li>
<li>Queres minimizar malezas y enfermedades fungicas</li>
<li>El cultivo esta en hileras con espaciamiento definido</li>
<li>Buscas maxima eficiencia hidrica</li>
</ul>
</div>
<div>
<h4>Elegi Aspersion si:</h4>
<ul>
<li>Regas praderas, pasturas, cesped o cultivos extensivos</li>
<li>El terreno es grande y el cultivo cubre toda la superficie</li>
<li>Necesitas mojar toda el area uniformemente</li>
<li>El presupuesto inicial es ajustado</li>
<li>Rotacion de cultivos es frecuente (goteo requiere reinstalacion)</li>
<li>Proteccion contra heladas (aspersion nocturna)</li>
</ul>
</div>
</div>`,
      },
      {
        title: 'Costos Comparativos en Uruguay',
        type: 'table',
        content: `<table>
<thead><tr><th>Concepto</th><th>Goteo (por ha)</th><th>Aspersion (por ha)</th></tr></thead>
<tbody>
<tr><td>Materiales (tuberias, emisores)</td><td>USD 800 - 2.000</td><td>USD 400 - 1.000</td></tr>
<tr><td>Bomba y cabezal</td><td>USD 400 - 800</td><td>USD 300 - 600</td></tr>
<tr><td>Filtracion</td><td>USD 200 - 500 (critico en goteo)</td><td>USD 50 - 200</td></tr>
<tr><td>Instalacion</td><td>USD 200 - 500</td><td>USD 100 - 300</td></tr>
<tr><td><strong>Total estimado</strong></td><td><strong>USD 1.600 - 3.800</strong></td><td><strong>USD 850 - 2.100</strong></td></tr>
<tr><td>Costo operativo anual</td><td>Bajo (menor consumo agua y energia)</td><td>Medio (mayor consumo agua y energia)</td></tr>
</tbody>
</table>
<p>El goteo tiene un costo inicial mayor pero un <strong>costo operativo menor</strong> a largo plazo por el ahorro de agua y energia. En cultivos de alto valor (tomate, arandano, viñedo), el retorno de inversion del goteo suele ser de <strong>1-2 temporadas</strong>.</p>`,
      },
      {
        title: 'Cultivos Ideales para Cada Sistema en Uruguay',
        type: 'table',
        content: `<table>
<thead><tr><th>Cultivo</th><th>Sistema Recomendado</th><th>Razon Principal</th></tr></thead>
<tbody>
<tr><td>Tomate</td><td>Goteo</td><td>Precision en la aplicacion, reduce enfermedades foliares</td></tr>
<tr><td>Papa</td><td>Goteo o aspersion</td><td>Ambos funcionan; goteo ahorra agua, aspersion mas facil para rotacion</td></tr>
<tr><td>Arandano</td><td>Goteo</td><td>Cultivo de alto valor, necesita humedad controlada sin mojar fruto</td></tr>
<tr><td>Viñedo</td><td>Goteo</td><td>Precision, control de vigor, fertirrigacion</td></tr>
<tr><td>Soja</td><td>Aspersion / Pivot</td><td>Cultivo extensivo, cobertura total, rotacion frecuente</td></tr>
<tr><td>Pradera/Pastura</td><td>Aspersion</td><td>Cobertura total, cultivo de superficie completa</td></tr>
<tr><td>Maiz</td><td>Aspersion / Pivot</td><td>Cultivo extensivo, alta demanda hidrica en pico</td></tr>
<tr><td>Cebolla</td><td>Goteo</td><td>Eficiencia hidrica, reduce hongos de bulbo</td></tr>
<tr><td>Citricos</td><td>Goteo (microaspersion)</td><td>Arboles individuales, riego localizado</td></tr>
</tbody>
</table>`,
      },
      {
        title: 'Ventajas y Desventajas Resumidas',
        type: 'list',
        content: `<ul>
<li><strong>Goteo — Ventaja principal:</strong> Ahorro de agua del 25-35% frente a aspersion, menor incidencia de enfermedades, fertirrigacion precisa</li>
<li><strong>Goteo — Desventaja principal:</strong> Mayor costo inicial, requiere filtracion rigurosa, los emisores pueden taparse, dificil de mover para rotacion de cultivos</li>
<li><strong>Aspersion — Ventaja principal:</strong> Versatil, facil de mover, menor costo inicial, ideal para grandes superficies y cultivos extensivos</li>
<li><strong>Aspersion — Desventaja principal:</strong> Menor eficiencia hidrica, afectado por el viento, favorece enfermedades foliares y crecimiento de malezas</li>
</ul>
<p>En La Aldea diseñamos e instalamos ambos sistemas. Te asesoramos sin costo para determinar cual es la mejor opcion segun tu cultivo, terreno y presupuesto. <strong>Consultanos por WhatsApp o visitanos en Tala.</strong></p>`,
      },
    ],
  },

  // ── 16. Herbicidas para Soja en Uruguay ───────────────────────────────────
  {
    slug: 'herbicidas-soja-uruguay',
    title: 'Herbicidas para Soja en Uruguay: Guia de Productos y Aplicacion',
    description: 'Guia completa de herbicidas para soja en Uruguay: glifosato, graminicidas, residuales y mezclas. Dosis, momentos de aplicacion y recomendaciones tecnicas para productores.',
    breadcrumbLabel: 'Herbicidas para Soja',
    category: 'Agroquimicos',
    keywords: ['herbicidas soja Uruguay', 'glifosato soja', 'agroquimicos soja', 'control malezas soja', 'herbicidas pre-emergentes soja', 'graminicidas', 'aplicacion herbicidas'],
    relatedCategories: [
      { label: 'Agroquimicos', value: 'Agroquimicos' },
    ],
    relatedArticles: ['seguridad-quimicos', 'que-es-riego-agricola', 'cuanta-agua-por-hectarea'],
    datePublished: '2026-03-05',
    dateModified: '2026-03-05',
    sections: [
      {
        title: '¿Que herbicidas se usan en soja en Uruguay?',
        type: 'text',
        content: `<p>La soja es el cultivo de mayor superficie en Uruguay y el control de malezas es clave para un buen rendimiento. Los herbicidas mas utilizados se dividen en tres grandes grupos: <strong>pre-emergentes</strong> (aplicados antes de que nazcan las malezas), <strong>post-emergentes</strong> (sobre malezas ya nacidas) y <strong>quemantes de barbecho</strong> (para limpiar el lote antes de la siembra).</p>
<p>En <strong>La Aldea</strong> tenemos stock permanente de los principales herbicidas para soja con envio a todo Uruguay. A continuacion te explicamos los productos mas comunes y sus dosis orientativas.</p>`,
      },
      {
        title: 'Herbicidas Pre-Emergentes para Soja',
        type: 'table',
        content: `<table>
<thead><tr><th>Producto</th><th>Principio Activo</th><th>Dosis/ha</th><th>Malezas que Controla</th></tr></thead>
<tbody>
<tr><td>Dual Gold / S-metolaclor</td><td>S-metolaclor</td><td>1.0 - 1.5 l/ha</td><td>Gramineas anuales (capim, pasto blanco)</td></tr>
<tr><td>Frontier / Acetoclor</td><td>Acetoclor</td><td>1.5 - 2.0 l/ha</td><td>Gramineas y algunas hoja ancha</td></tr>
<tr><td>Authority / Sulfentrazone</td><td>Sulfentrazone</td><td>0.3 - 0.4 l/ha</td><td>Hoja ancha y algunas gramineas</td></tr>
<tr><td>Clomazone / Centium</td><td>Clomazone</td><td>0.8 - 1.2 l/ha</td><td>Hoja ancha (rama negra, borreria)</td></tr>
<tr><td>Diclosulam / Spider</td><td>Diclosulam</td><td>33 - 42 g/ha</td><td>Hoja ancha de dificil control</td></tr>
</tbody>
</table>
<p><strong>Nota:</strong> Las dosis varian segun tipo de suelo (textura y materia organica). Siempre consultar la etiqueta del producto y un ingeniero agronomo para ajustar dosis.</p>`,
      },
      {
        title: 'Herbicidas Post-Emergentes',
        type: 'table',
        content: `<table>
<thead><tr><th>Producto</th><th>Tipo</th><th>Dosis/ha</th><th>Momento de Aplicacion</th></tr></thead>
<tbody>
<tr><td>Glifosato (soja RR)</td><td>Total no selectivo</td><td>2.0 - 3.0 l/ha</td><td>V2 a V6, malezas de 5-15 cm</td></tr>
<tr><td>Cletodim / Select</td><td>Graminicida</td><td>0.35 - 0.45 l/ha</td><td>Gramineas de 3-5 hojas</td></tr>
<tr><td>Quizalofop / Targa</td><td>Graminicida</td><td>0.7 - 1.0 l/ha</td><td>Gramineas activas</td></tr>
<tr><td>Fomesafen / Flex</td><td>Hoja ancha</td><td>0.8 - 1.0 l/ha</td><td>V2-V4, malezas de 2-4 hojas</td></tr>
<tr><td>Bentazon / Basagran</td><td>Hoja ancha</td><td>1.5 - 2.0 l/ha</td><td>Malezas en activo crecimiento</td></tr>
</tbody>
</table>
<p><strong>Importante:</strong> En soja RR (Roundup Ready) el glifosato es selectivo al cultivo. En soja convencional <strong>no se puede usar glifosato</strong> sobre el cultivo.</p>`,
      },
      {
        title: 'Recomendaciones de Aplicacion',
        type: 'steps',
        content: `<ol>
<li><strong>Calibrar el equipo:</strong> Verificar pastillas, presion (2-3 bar) y velocidad. Aplicar 100-150 l/ha de agua segun producto.</li>
<li><strong>Respetar el momento optimo:</strong> Los herbicidas post-emergentes funcionan mejor con malezas chicas (2-4 hojas). No esperar a que crezcan.</li>
<li><strong>Considerar las condiciones climaticas:</strong> No aplicar con viento mayor a 10 km/h, ni con temperatura superior a 30C, ni con rocio presente en la hoja.</li>
<li><strong>Usar coadyuvantes:</strong> Aceite metilado o tensioactivo segun el producto. Mejoran la absorcion y reducen la deriva.</li>
<li><strong>Usar equipo de proteccion personal (EPP):</strong> Guantes de nitrilo, gafas, mascara y ropa protectora. Ver nuestra <a href="/guias/seguridad-quimicos">guia de seguridad con quimicos</a>.</li>
<li><strong>Registrar las aplicaciones:</strong> Anotar producto, dosis, fecha, clima y lote. Fundamental para trazabilidad y planificacion futura.</li>
</ol>`,
      },
      {
        title: 'Manejo de Malezas Resistentes',
        type: 'text',
        content: `<p>En Uruguay se han confirmado biotipos de <strong>rama negra (Conyza spp.)</strong> y <strong>raigras (Lolium multiflorum)</strong> resistentes a glifosato. El manejo integrado incluye:</p>
<ul>
<li>Rotacion de principios activos con diferente modo de accion</li>
<li>Uso de pre-emergentes para cortar los flujos de emergencia temprana</li>
<li>Mezclas de herbicidas (ej: glifosato + 2,4-D o glifosato + saflufenacil para barbecho)</li>
<li>Rotacion de cultivos para cortar ciclo de malezas</li>
<li>Cobertura y cultivos de servicio</li>
</ul>
<p><strong>¿Necesitas asesoramiento?</strong> En La Aldea te orientamos sobre productos y dosis adecuados para tu situacion. <a href="https://wa.me/59892744725">Escribinos por WhatsApp</a> o visitanos en Tala.</p>`,
      },
    ],
  },

  // ── 17. Preparar Piscina para el Verano ───────────────────────────────────
  {
    slug: 'preparar-piscina-verano',
    title: 'Como Preparar tu Piscina para el Verano: Guia Paso a Paso',
    description: 'Guia completa para preparar tu piscina antes del verano: limpieza, revision de equipos, tratamiento del agua, cloro y productos quimicos. Consejos de La Aldea, Tala.',
    breadcrumbLabel: 'Preparar Piscina Verano',
    category: 'Piscinas',
    keywords: ['preparar piscina verano', 'mantenimiento piscina', 'abrir piscina temporada', 'cloro piscina', 'limpiar piscina', 'productos piscina Uruguay'],
    relatedCategories: [
      { label: 'Piscinas', value: 'Piscinas' },
    ],
    relatedArticles: ['mantenimiento-piscinas', 'sistemas-filtracion', 'seguridad-quimicos'],
    datePublished: '2026-03-05',
    dateModified: '2026-03-05',
    sections: [
      {
        title: '¿Cuando empezar a preparar la piscina?',
        type: 'text',
        content: `<p>Lo ideal es empezar a preparar la piscina <strong>3 a 4 semanas antes de usarla</strong>, generalmente a mediados de octubre o principios de noviembre en Uruguay. Esto te da tiempo para detectar problemas, equilibrar el agua y que los productos quimicos hagan su trabajo.</p>
<p>Si la piscina estuvo tapada durante el invierno, la tarea sera mas sencilla. Si estuvo descubierta y con agua verde, necesitaras un tratamiento de choque.</p>`,
      },
      {
        title: 'Paso 1: Inspeccion Visual y Limpieza Fisica',
        type: 'steps',
        content: `<ol>
<li><strong>Retirar la cobertura:</strong> Limpiarla, dejarla secar al sol y guardarla doblada en un lugar seco.</li>
<li><strong>Barrer y limpiar alrededores:</strong> Sacar hojas, ramas y suciedad del borde y la playa de la piscina.</li>
<li><strong>Inspeccionar las paredes y el fondo:</strong> Buscar grietas, descascarados o manchas de algas.</li>
<li><strong>Revisar el nivel de agua:</strong> Debe estar a mitad del skimmer. Rellenar si es necesario con agua limpia.</li>
<li><strong>Limpiar el cesto del skimmer:</strong> Retirar hojas y residuos acumulados durante el invierno.</li>
</ol>`,
      },
      {
        title: 'Paso 2: Revision de Equipos',
        type: 'steps',
        content: `<ol>
<li><strong>Bomba de filtracion:</strong> Verificar que enciende, no hace ruidos extraños y genera presion de succion. Revisar el pre-filtro.</li>
<li><strong>Filtro de arena o cartucho:</strong> Si es de arena, hacer un contra-lavado (backwash). Si es de cartucho, retirar y lavar con manguera a presion.</li>
<li><strong>Valvula selectora:</strong> Verificar que cambia de posicion sin fugas. Las mas comunes: filtrar, contra-lavado, enjuague, cerrado.</li>
<li><strong>Retornos y skimmer:</strong> Verificar que el agua circula correctamente por todos los retornos.</li>
<li><strong>Iluminacion subacuatica:</strong> Probar las luces (si tiene). <strong>Nunca manipular electricidad con los pies mojados.</strong></li>
</ol>`,
      },
      {
        title: 'Paso 3: Tratamiento del Agua',
        type: 'steps',
        content: `<ol>
<li><strong>Analizar el agua:</strong> Usar un kit de analisis (pH, cloro, alcalinidad). Los valores ideales: pH 7.2-7.6, cloro libre 1-3 ppm, alcalinidad 80-120 ppm.</li>
<li><strong>Ajustar el pH primero:</strong> Si esta alto (>7.6) usar reductor de pH. Si esta bajo (&lt;7.2) usar elevador de pH. El pH correcto hace que el cloro sea efectivo.</li>
<li><strong>Tratamiento de choque:</strong> Aplicar cloro granulado en dosis de choque (10-15 g por cada 1.000 litros). Hacerlo al atardecer para que el sol no degrade el cloro.</li>
<li><strong>Agregar algicida:</strong> Dosis inicial segun etiqueta del producto (generalmente 200-400 ml por cada 10.000 litros).</li>
<li><strong>Aplicar clarificante:</strong> Si el agua esta turbia despues del tratamiento de choque, aplicar clarificante y dejar el filtro funcionando 24-48 horas seguidas.</li>
<li><strong>Dejar el filtro corriendo:</strong> Minimo 8-12 horas por dia los primeros dias hasta que el agua este cristalina.</li>
</ol>`,
      },
      {
        title: 'Productos Esenciales que Necesitas',
        type: 'list',
        content: `<ul>
<li><strong>Cloro granulado o en pastillas:</strong> Desinfectante principal. Las pastillas son mas practicas para dosificacion continua en el skimmer.</li>
<li><strong>Regulador de pH:</strong> Reductor (pH-) o elevador (pH+) segun necesidad. Sin pH correcto el cloro no funciona.</li>
<li><strong>Algicida:</strong> Preventivo y curativo contra algas verdes, amarillas y negras.</li>
<li><strong>Clarificante / Floculante:</strong> Agrupa particulas finas para que el filtro las pueda retener.</li>
<li><strong>Kit de analisis:</strong> Tiras reactivas o kit de gotas para medir pH y cloro libre.</li>
</ul>
<p>Todos estos productos estan disponibles en <a href="/productos?categoria=Piscinas">nuestra seccion de Piscinas</a>. Enviamos a todo Uruguay.</p>`,
      },
      {
        title: 'Errores Comunes al Abrir la Piscina',
        type: 'list',
        content: `<ul>
<li><strong>No ajustar el pH antes de clorar:</strong> Si el pH esta alto, el cloro pierde hasta el 80% de su efectividad. Siempre corregir pH primero.</li>
<li><strong>Aplicar cloro bajo el sol del mediodia:</strong> La radiacion UV degrada el cloro rapidamente. Aplicar al atardecer o usar estabilizante (acido cianurico).</li>
<li><strong>Encender la bomba sin verificar el nivel de agua:</strong> Si el agua esta por debajo del skimmer, la bomba trabaja en seco y puede dañarse.</li>
<li><strong>Banarse antes de que el cloro baje:</strong> Despues de un tratamiento de choque, esperar al menos 8 horas y verificar que el cloro libre este por debajo de 3 ppm.</li>
<li><strong>Ignorar el filtro:</strong> Un filtro sucio no limpia. El contra-lavado de arena o la limpieza de cartucho es fundamental antes de arrancar.</li>
</ul>`,
      },
      {
        title: 'Calendario de Mantenimiento en Temporada',
        type: 'table',
        content: `<table>
<thead><tr><th>Frecuencia</th><th>Tarea</th><th>Producto</th></tr></thead>
<tbody>
<tr><td>Diario</td><td>Retirar hojas y residuos con red</td><td>-</td></tr>
<tr><td>Cada 2-3 dias</td><td>Medir pH y cloro libre</td><td>Kit de analisis</td></tr>
<tr><td>Cada 2-3 dias</td><td>Agregar cloro si esta por debajo de 1 ppm</td><td>Cloro granulado o pastillas</td></tr>
<tr><td>Semanal</td><td>Cepillar paredes y fondo</td><td>-</td></tr>
<tr><td>Semanal</td><td>Limpiar cesto del skimmer y pre-filtro</td><td>-</td></tr>
<tr><td>Semanal</td><td>Agregar algicida preventivo</td><td>Algicida</td></tr>
<tr><td>Quincenal</td><td>Contra-lavado del filtro (si es de arena)</td><td>-</td></tr>
<tr><td>Mensual</td><td>Medir alcalinidad y ajustar si es necesario</td><td>Regulador de alcalinidad</td></tr>
</tbody>
</table>
<p>Para mas informacion, consulta nuestra <a href="/guias/mantenimiento-piscinas">guia completa de mantenimiento de piscinas</a>.</p>`,
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
