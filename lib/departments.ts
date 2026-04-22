// lib/departments.ts
// ─────────────────────────────────────────────────────────────
// Service Area Pages — 19 Departments of Uruguay
// All agricultural data verified against MGAP, INAVI, INALE,
// Intendencias departamentales and Censo General Agropecuario 2024.
// Each department has unique content to avoid duplicate/doorway penalties.
// ─────────────────────────────────────────────────────────────

export interface TechnicalRecommendation {
  iconName: string; // Lucide icon key
  title: string;
  description: string;
}

export interface Department {
  slug: string;
  name: string;
  tier: 1 | 2 | 3 | 4;
  published: boolean;
  capital: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string[];

  // Unique Content Blocks
  heroSubtitle: string;
  introText: string; // HTML allowed (paragraphs)

  agriculturalFocus: {
    title: string;
    crops: string[];
    description: string; // HTML allowed
  };

  logistics: {
    description: string;
    deliveryNotes: string;
    pickupPoints?: string;
  };

  technicalAdvice: {
    title: string;
    recommendations: TechnicalRecommendation[];
  };

  // Nearby departments for cross-linking
  nearbyDepartments: string[]; // slugs

  // Schema.org
  geoCoordinates: {
    latitude: number;
    longitude: number;
  };
}

// ─────────────────────────────────────────────────────────────
//  TIER 1 — Core Service Area (Dairy & Vegetable Belt)
// ─────────────────────────────────────────────────────────────

const canelones: Department = {
  slug: 'canelones',
  name: 'Canelones',
  tier: 1,
  published: true,
  capital: 'Canelones',
  metaTitle: 'Riego y Bombeo en Canelones | La Aldea',
  metaDescription:
    'Instalación de riego por goteo, aspersión y sistemas de bombeo en Canelones. Soluciones para horticultura, viñedos, avicultura, tambos y ganadería. Presupuesto sin cargo.',
  keywords: [
    'riego Canelones',
    'bombeo Canelones',
    'riego por goteo Canelones',
    'riego viñedos Canelones',
    'bebederos automáticos Canelones',
    'bombeo tambo Canelones',
    'instalación riego horticultura Canelones',
    'bomba de agua Canelones',
    'sistema de riego Canelones',
    'riego para huerta Canelones',
  ],
  heroSubtitle:
    'Soluciones hídricas para el departamento más productivo y diversificado del país.',
  introText: `<p>Canelones es el principal productor de alimentos del Uruguay: horticultura intensiva, vitivinicultura de exportación, avicultura a escala industrial, lechería familiar, ganadería de campo natural y floricultura conviven en un mismo departamento de apenas 4.536 km². Esta diversidad productiva es extraordinaria — y cada actividad tiene requerimientos hídricos distintos, técnicos y críticos.</p>
<p>Desde nuestra base en Tala operamos diariamente en todo el departamento. Conocemos los suelos francos de la zona sur, los arcillosos del centro, la variación de napas entre Las Piedras y Sauce, los pozos de los viñedos de la Ruta del Vino, y los galpones avícolas de San Bautista que necesitan agua las 24 horas del año.</p>
<p>Brindamos relevamiento técnico en tu predio, diseño hidráulico a medida y montaje completo de sistemas de riego por goteo, aspersión, bombeo y automatización — con soporte técnico post-instalación.</p>`,

  agriculturalFocus: {
    title: 'La producción más diversificada del Uruguay',
    crops: [
      'Tomate, Morrón, Lechuga, Frutilla, Cebolla, Boniato',
      'Uva (Tannat, Chardonnay, Sauvignon Blanc)',
      'Frutales de hoja caduca (Durazno, Ciruela, Pera, Manzana)',
      'Arándano y Frambuesa',
      'Flores de corte y plantas ornamentales',
      'Pollos parrilleros y gallinas ponedoras (avicultura)',
      'Porcinos',
      'Lechería (tambos)',
      'Ganadería de carne y lana',
    ],
    description: `<p>Canelones concentra el mayor volumen de horticultura del Uruguay: la zona sur (La Paz, Las Piedras, Progreso) produce tomate, morrón y lechuga bajo cubierta con riego por goteo de alta precisión; la zona de Tala, Migues y Montes produce a cielo abierto con sistemas mixtos de goteo y aspersión.</p>
<p>La vitivinicultura es igualmente central: junto con Montevideo, Canelones representa el 60% de la producción vitivinícola nacional (INAVI). Las Piedras, Juanicó y Sauce concentran bodegas de exportación que trabajan principalmente con Tannat, Chardonnay y Sauvignon Blanc. Los viñedos necesitan goteo con emisores autocompensantes desde la implantación.</p>
<p>San Bautista es reconocida por ley como la "Capital Nacional de la Avicultura". El sector avícola genera más de 4.000 empleos directos concentrados en Canelones y Montevideo rural (CUPRA). Los galpones de pollos y postura consumen grandes volúmenes de agua para bebederos automáticos tipo nipple y tareas de limpieza a alta presión — son uno de los clientes de mayor demanda de sistemas de bombeo continuo.</p>
<p>La lechería también tiene raíces profundas: Canelones cuenta con 575 establecimientos tamberos. La floricultura es otro rubro relevante en la agricultura familiar del departamento.</p>`,
  },

  logistics: {
    description:
      'Nuestra sede central está en Tala, Canelones. Realizamos visitas técnicas en todo el departamento con tiempos de respuesta de 24–48 horas.',
    deliveryNotes:
      'Entrega de materiales el mismo día en Tala y localidades cercanas. Resto de Canelones: 24–48 horas hábiles.',
    pickupPoints: 'Retiro directo en nuestro local en Tala: José Alonso y Trelles y Av. Artigas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones técnicas por rubro en Canelones',
    recommendations: [
      {
        iconName: 'Droplets',
        title: 'Goteo para horticultura y viñedos',
        description:
          'Para horticultura intensiva: cinta de 16 mm con goteros cada 20 cm. Para viñedos: emisores autocompensantes cada 50–80 cm que garantizan uniformidad en terrenos con pendiente, clave en la zona de Las Piedras y Juanicó.',
      },
      {
        iconName: 'Gauge',
        title: 'Agua continua para galpones avícolas',
        description:
          'Los galpones de pollos y postura requieren suministro ininterrumpido: bebederos automáticos tipo nipple y agua para limpieza a alta presión. Dimensionamos el sistema de bombeo con reserva y protección eléctrica para cero cortes.',
      },
      {
        iconName: 'Timer',
        title: 'Automatización para invernaderos y jardines',
        description:
          'Cultivos bajo cubierta y jardines residenciales de la Costa de Oro necesitan riegos frecuentes y cortos. Programadores digitales de hasta 8 zonas con electroválvulas permiten regar cada sector en su momento óptimo sin intervención manual.',
      },
    ],
  },

  nearbyDepartments: ['montevideo', 'san-jose', 'florida', 'lavalleja', 'maldonado'],
  geoCoordinates: { latitude: -34.5228, longitude: -56.2839 },
};

const florida: Department = {
  slug: 'florida',
  name: 'Florida',
  tier: 1,
  published: true,
  capital: 'Florida',
  metaTitle: 'Riego y Bombeo en Florida | La Aldea',
  metaDescription:
    'Sistemas de bombeo para tambos, bebederos automáticos y riego de praderas en Florida, Uruguay. Dimensionamiento técnico y montaje completo. Presupuesto sin cargo.',
  keywords: [
    'bombeo Florida Uruguay',
    'bebederos automáticos Florida',
    'riego praderas Florida',
    'bomba de agua tambo Florida',
    'sistema hidráulico ganadero Florida',
    'riego lechería Florida',
    'bomba sumergible Florida',
  ],
  heroSubtitle: 'Soluciones de bombeo y agua para la cuenca lechera de Florida.',
  introText: `<p>Florida es una de las cuencas lecheras más importantes del Uruguay, junto con San José y la zona sur de Canelones. Cientos de tambos distribuidos en todo el departamento dependen de sistemas de bombeo confiables para el suministro de agua a bebederos automáticos y tareas de lavado general de las instalaciones.</p>
<p>También trabajamos con productores agrícolas y ganaderos de Sarandí Grande, Fray Marcos y Casupá, donde el riego suplementario de praderas y verdeos de invierno es cada vez más necesario frente a los déficits hídricos estivales. En el norte del departamento, el bombeo solar es clave para establecimientos sin red eléctrica que necesitan agua en potreros remotos.</p>
<p><strong>Caso típico en Florida:</strong> un tambo con pozo y sala de ordeñe que necesita sostener presión estable en dos frentes al mismo tiempo: lavado en picos horarios y suministro continuo a bebederos. En estos escenarios diseñamos el bombeo con reserva (tanque) y una red de distribución dimensionada para evitar caídas de presión en los puntos más lejanos.</p>`,

  agriculturalFocus: {
    title: 'Cuenca lechera, ganadería y agricultura mixta',
    crops: [
      'Pasturas para lechería',
      'Verdeos de invierno (avena, raigrás)',
      'Maíz para silo',
      'Sorgo forrajero',
      'Ganadería de carne (vacunos y ovinos)',
      'Floricultura (producción familiar)',
      'Horticultura menor',
    ],
    description: `<p>La producción lechera en Florida requiere agua las 24 horas del día, los 365 días del año. Una vaca en producción consume entre 80 y 120 litros diarios, y los establecimientos modernos necesitan miles de litros diarios para limpieza y mantenimiento de la higiene general. En muchos tambos, el desafío no es solo el volumen: es sostener caudal y presión en picos de consumo (ordeñe + lavado + bebederos) sin cortes ni caídas de presión.</p>
  <p>La ganadería de carne y la producción ovina ocupan la zona norte del departamento (25 de Mayo, Cerro Colorado), donde establecimientos extensivos necesitan puntos de agua distribuidos sin acceso a red eléctrica. El bombeo solar con tanque australiano y distribución por gravedad es la solución estándar en esta zona.</p>`,
  },

  logistics: {
    description:
      'Atendemos todo Florida con base operativa en Tala (Canelones), a 90 km de la capital departamental. Coordinamos visitas técnicas con 48–72 horas de anticipación.',
    deliveryNotes:
      'Envío de materiales a Florida capital y localidades principales en 24–48 horas. Zona norte del departamento: 48–72 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Florida',
    recommendations: [
      {
        iconName: 'Gauge',
        title: 'Bombeo confiable para tambos',
        description:
          'Diseñamos sistemas de bombeo con protección eléctrica (contra baja tensión, sobretensión y falta de fase) y tanque de reserva para garantizar suministro continuo a la red de distribución del establecimiento, incluso ante cortes de energía.',
      },
      {
        iconName: 'Leaf',
        title: 'Bebederos automáticos para rodeo',
        description:
          'Redes de distribución con bebederos de nivel constante para ganado bovino y ovino. Cada bebedero dimensionado según cantidad de cabezas, distancia al pozo o noria, y desnivel del terreno.',
      },
      {
        iconName: 'Sun',
        title: 'Bombeo solar para pozos rurales',
        description:
          'En establecimientos del norte de Florida sin red eléctrica, los sistemas de bombeo solar eliminan el costo de combustible y funcionan de forma autónoma todo el año con mínimo mantenimiento.',
      },
    ],
  },

  nearbyDepartments: ['canelones', 'san-jose', 'durazno', 'lavalleja', 'flores'],
  geoCoordinates: { latitude: -34.0961, longitude: -56.2141 },
};

const sanJose: Department = {
  slug: 'san-jose',
  name: 'San José',
  tier: 1,
  published: true,
  capital: 'San José de Mayo',
  metaTitle: 'Riego y Bombeo en San José | La Aldea',
  metaDescription:
    'Instalación de riego y bombeo para horticultura, lechería y ganadería en San José, Uruguay. Diseño hidráulico profesional y montaje completo. Presupuesto sin cargo.',
  keywords: [
    'riego San José Uruguay',
    'bombeo San José',
    'riego horticultura San José',
    'sistema de riego San José',
    'instalación bomba San José',
    'riego lechería San José',
    'bombeo solar San José',
    'riego papa San José',
  ],
  heroSubtitle: 'Riego y bombeo para la producción intensiva y lechera de San José.',
  introText: `<p>San José combina horticultura intensiva en su zona sur, lechería de primer nivel en el centro, ganadería de carne y producción porcina en establecimientos mixtos. Los productores de este departamento operan con márgenes ajustados donde la eficiencia del agua impacta directamente en la rentabilidad de cada zafra.</p>
<p>Trabajamos con productores instalando sistemas de riego que aprovechan tanto fuentes superficiales (arroyos, represas) como pozos profundos. Cada proyecto se dimensiona con cálculo hidráulico real: caudales, presiones, diámetros de cañería y selección de equipo de bombeo.</p>`,

  agriculturalFocus: {
    title: 'Horticultura intensiva, lechería y producción mixta',
    crops: [
      'Papa (producción de semilla y consumo)',
      'Hortalizas (tomate, cebolla, zanahoria, boniato)',
      'Pasturas lecheras',
      'Verdeos de invierno',
      'Maíz y Soja',
      'Ganadería de carne',
      'Porcinos',
      'Floricultura (producción familiar)',
    ],
    description: `<p>La zona sur de San José (Libertad, Ciudad del Plata) concentra producción hortícola y granjera con fuerte demanda de riego por goteo para cultivos de alto valor. La producción de papa — tanto para consumo como para semilla — es especialmente importante y requiere riego suplementario en los ciclos de primavera y otoño.</p>
<p>La zona central (Ecilda Paullier, Rodríguez) es predominantemente lechera, con necesidades similares a Florida: agua confiable y continua para tambos, riego de praderas y manejo eficiente del efluente. Los cultivos de verano (maíz, soja) en rotación con pasturas necesitan riego suplementario en años de déficit hídrico — cada vez más frecuentes en Uruguay.</p>`,
  },

  logistics: {
    description:
      'San José es limítrofe con Canelones. Atendemos todo el departamento con tiempos de respuesta de 24–48 horas desde nuestra base en Tala.',
    deliveryNotes:
      'Entrega de materiales en San José de Mayo y localidades principales en 24–48 horas hábiles.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de San José',
    recommendations: [
      {
        iconName: 'CloudRain',
        title: 'Riego suplementario de praderas y papa',
        description:
          'Los déficits hídricos de verano afectan directamente la producción de leche y los rendimientos de papa. Sistemas de aspersión dimensionados para 3–10 hectáreas aseguran el crecimiento de la pradera en enero-febrero y la tuberización en primavera.',
      },
      {
        iconName: 'Database',
        title: 'Represas para reserva de agua',
        description:
          'La impermeabilización con geomembrana de represas existentes o nuevas permite acumular agua de invierno para riego estival. Diseñamos la represa según el balance hídrico del predio y la demanda del cultivo.',
      },
      {
        iconName: 'Sun',
        title: 'Bombeo solar para establecimientos mixtos',
        description:
          'Establecimientos ganaderos y lecheros alejados de la red eléctrica se benefician del bombeo solar con paneles fotovoltaicos. Retorno de inversión en 2–4 años frente al costo de combustible o tendido eléctrico.',
      },
    ],
  },

  nearbyDepartments: ['canelones', 'florida', 'colonia', 'flores', 'montevideo'],
  geoCoordinates: { latitude: -34.3373, longitude: -56.7133 },
};

const montevideo: Department = {
  slug: 'montevideo',
  name: 'Montevideo',
  tier: 1,
  published: true,
  capital: 'Montevideo',
  metaTitle: 'Riego y Bombeo en Montevideo | La Aldea',
  metaDescription:
    'Sistemas de riego para jardines, huertas urbanas y producción periurbana en Montevideo. Bombeo doméstico e instalación profesional. Presupuesto sin cargo.',
  keywords: [
    'riego Montevideo',
    'bomba de agua Montevideo',
    'riego jardín Montevideo',
    'instalación riego Montevideo',
    'bomba sumergible Montevideo',
    'sistema de riego Montevideo',
    'riego automático Montevideo',
    'presurización doméstica Montevideo',
  ],
  heroSubtitle: 'Riego doméstico, jardines y producción intensiva en Montevideo rural.',
  introText: `<p>Montevideo no es solo la capital: la periferia rural del departamento — desde Melilla hasta Santiago Vázquez, pasando por Manga, Punta Espinillo y los Bañados de Carrasco — alberga una producción hortifrutícola y florícola intensiva que abastece directamente al Mercado Modelo. El departamento más pequeño del Uruguay concentra el 90% del volumen de comercialización mayorista del país.</p>
<p>También atendemos jardines residenciales, parques privados, viveros y emprendimientos gastronómicos con huerta propia. En Montevideo, cada metro cuadrado de suelo productivo es valioso — la eficiencia del riego no es un lujo, es una necesidad económica.</p>
<p>Instalamos bombas de presurización doméstica, sistemas de riego por goteo para huertas urbanas, aspersores para jardines y equipos de bombeo para pozos artesianos en zonas periurbanas sin buena presión de red.</p>`,

  agriculturalFocus: {
    title: 'Producción periurbana, flores y jardines',
    crops: [
      'Hortalizas de hoja (lechuga, espinaca, acelga)',
      'Tomate y Morrón bajo cubierta',
      'Flores de corte y plantas ornamentales',
      'Frutales urbanos y frutillas',
      'Jardines residenciales y parques',
      'Huertas gastronómicas y viveros',
    ],
    description: `<p>La zona rural de Montevideo (Melilla, Manga, Santiago Vázquez) concentra producción intensiva de hortalizas, flores de corte y plantas ornamentales. La floricultura tiene un peso especialmente importante en la agricultura familiar de la zona, con productores que abastecen flores para todo el mercado de Montevideo.</p>
<p>En la zona residencial, la demanda de riego automatizado para jardines y parques privados crece año a año. Sistemas de aspersión emergente con programador digital permiten mantener el jardín en perfecto estado sin intervención manual — especialmente valorado por propietarios con residencias de temporada.</p>`,
  },

  logistics: {
    description:
      'Atendemos Montevideo y el área metropolitana con frecuencia semanal. Visitas técnicas coordinadas en 24–48 horas.',
    deliveryNotes:
      'Entrega de materiales en Montevideo en 24 horas hábiles. Retiro disponible en nuestro local de Tala (Canelones).',
  },

  technicalAdvice: {
    title: 'Recomendaciones para Montevideo',
    recommendations: [
      {
        iconName: 'Timer',
        title: 'Riego automatizado para jardines',
        description:
          'Aspersores emergentes con programador y electroválvulas mantienen el jardín verde sin esfuerzo. Sistemas de 2 a 12 zonas, adaptados al tamaño del predio y al tipo de plantas.',
      },
      {
        iconName: 'Gauge',
        title: 'Presurización doméstica',
        description:
          'Bombas presurizadoras de acero inoxidable para viviendas con baja presión de red. Instalación silenciosa y compacta, con tanque hidroneumático calibrado para respuesta inmediata.',
      },
      {
        iconName: 'Droplets',
        title: 'Goteo para huertas y flores',
        description:
          'Kits de riego por goteo para huertas familiares y cultivos de flores de corte. Desde instalaciones para 50 m² con temporizador a batería hasta sistemas sectoriales para viveros comerciales.',
      },
    ],
  },

  nearbyDepartments: ['canelones', 'san-jose'],
  geoCoordinates: { latitude: -34.9011, longitude: -56.1645 },
};

// ─────────────────────────────────────────────────────────────
//  TIER 2 — "Granero" & Intensive Agro (Western Powerhouse)
// ─────────────────────────────────────────────────────────────

const colonia: Department = {
  slug: 'colonia',
  name: 'Colonia',
  tier: 2,
  published: true,
  capital: 'Colonia del Sacramento',
  metaTitle: 'Riego y Bombeo en Colonia | La Aldea',
  metaDescription:
    'Sistemas de riego y bombeo para lechería de alto rendimiento y cultivos extensivos en Colonia. Instalación profesional. Presupuesto sin cargo.',
  keywords: [
    'riego Colonia Uruguay',
    'bombeo Colonia',
    'riego agricultura Colonia',
    'instalación riego Colonia',
    'riego lechería Colonia',
    'bomba de agua Colonia',
    'riego soja Colonia',
  ],
  heroSubtitle: 'Riego y bombeo para la lechería y la agricultura de exportación de Colonia.',
  introText: `<p>Colonia es uno de los departamentos agropecuariamente más desarrollados del Uruguay: lechería de alto rendimiento en Nueva Helvecia ("La Suiza uruguaya"), agricultura extensiva de exportación (soja, trigo, cebada, girasol) en la zona de Juan Lacaze y Nueva Palmira, y una creciente apicultura con miel de exportación. Nueva Palmira es el principal puerto de granos del país, lo que da idea de la escala productiva del departamento.</p>
<p>Los establecimientos lecheros de Rosario, Tarariras y Carmelo operan con estándares de producción exigentes donde el agua es un insumo crítico: un tambo de 200 vacas puede superar los 10.000 litros diarios entre bebederos y limpieza de instalaciones. Dimensionamos cada sistema con los caudales reales del predio.</p>
<p>Para los productores agrícolas, diseñamos sistemas de riego suplementario que protegen la inversión en cultivos de verano frente a los déficits hídricos de enero-febrero — los mismos que determinan la diferencia entre un año bueno y uno catastrófico en soja y maíz.</p>`,

  agriculturalFocus: {
    title: 'Lechería de alto rendimiento, agricultura extensiva y apicultura',
    crops: [
      'Pasturas lecheras',
      'Soja y Maíz',
      'Trigo y Cebada cervecera',
      'Girasol y Colza',
      'Ganadería de carne',
      'Apicultura (miel de exportación)',
      'Porcinos',
      'Horticultura periurbana',
    ],
    description: `<p>Colonia alberga algunos de los tambos de mayor productividad del Uruguay. La cuenca lechera de Nueva Helvecia y Rosario produce leche de calidad exportación, con establecimientos que manejan rodeos de 200 a 1.500 vacas en producción. La intensificación de los últimos años aumentó la demanda de agua por litro producido: más suplementación significa más agua en bebederos.</p>
  <p>La agricultura extensiva ocupa la zona norte y este del departamento, donde el riego suplementario por aspersión (cañones de largo alcance y redes bien dimensionadas) ayuda a estabilizar rendimientos en veranos secos. En proyectos de este tipo, el punto crítico suele ser el bombeo: caudal real, presión de trabajo y pérdidas de carga en la conducción.</p>`,
  },

  logistics: {
    description:
      'Atendemos Colonia con visitas técnicas programadas. Coordinamos con 72 horas de anticipación para relevamiento en predio.',
    deliveryNotes:
      'Envío de materiales a Colonia del Sacramento, Nueva Helvecia, Rosario y localidades principales en 48–72 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Colonia',
    recommendations: [
      {
        iconName: 'Gauge',
        title: 'Bombeo de alto caudal para tambos',
        description:
          'Tambos de 200 o más vacas en producción requieren bombas de 2–5 HP con caudales superiores a 8.000 l/h. Dimensionamos el equipo según el tamaño del rodeo, la distancia al pozo y la presión de trabajo.',
      },
      {
        iconName: 'CloudRain',
        title: 'Aspersión para cultivos extensivos',
        description:
          'Sistemas de aspersión con cañones de largo alcance para maíz y soja. Cobertura de 1 a 5 hectáreas por equipo, con diseño que optimiza la uniformidad y el consumo energético.',
      },
      {
        iconName: 'Leaf',
        title: 'Distribución de bebederos en sistemas intensivos',
        description:
          'Diseño de redes de suministro de agua para grandes rodeos lecheros. Dimensionamos la cañería y bebederos automáticos de alto caudal para garantizar acceso rápido al agua en los picos de consumo diario.',
      },
    ],
  },

  nearbyDepartments: ['san-jose', 'soriano', 'flores'],
  geoCoordinates: { latitude: -34.4626, longitude: -57.8399 },
};

const soriano: Department = {
  slug: 'soriano',
  name: 'Soriano',
  tier: 2,
  published: true,
  capital: 'Mercedes',
  metaTitle: 'Riego y Bombeo en Soriano | La Aldea',
  metaDescription:
    'Instalación de riego y bombeo para agricultura extensiva en Soriano. Bombas de alto caudal para riego por aspersión, cañones de largo alcance y redes principales. Presupuesto sin cargo.',
  keywords: [
    'riego Soriano Uruguay',
    'bombeo Soriano',
    'riego soja Soriano',
    'riego por aspersión Soriano',
    'bomba de agua Soriano',
    'riego agricultura Soriano',
    'bombeo alto caudal Soriano',
  ],
  heroSubtitle: 'Bombeo de alto caudal para el granero agrícola del Uruguay.',
  introText: `<p>Soriano es el corazón de la agricultura extensiva del Uruguay: soja, trigo, maíz, cebada cervecera y girasol se producen en grandes superficies que demandan sistemas de riego de alta capacidad. Mercedes, Dolores y Cardona concentran establecimientos donde la inversión en riego suplementario tiene retornos demostrados — en años secos, la diferencia entre irrigar y no irrigar puede superar los 1.000 dólares por hectárea en maíz.</p>
<p>Los productores de Soriano trabajan con riego por aspersión de largo alcance (cañones, microaspersión en sectores específicos y redes de distribución) que requieren dimensionamiento profesional. Un error de cálculo en el caudal o la presión puede significar miles de dólares en eficiencia perdida por temporada — o peor, un equipo de bombeo fuera de especificación en plena zafra.</p>
<p>También atendemos establecimientos ganaderos y lecheros del departamento, donde el bombeo confiable para bebederos y la infraestructura hídrica del tambo es tan crítico como en cualquier otra cuenca del país.</p>`,

  agriculturalFocus: {
    title: 'Agricultura extensiva de alto valor y ganadería',
    crops: [
      'Soja',
      'Trigo',
      'Maíz',
      'Cebada cervecera',
      'Girasol',
      'Colza',
      'Ganadería de carne',
      'Lechería',
    ],
    description: `<p>Soriano lidera la producción agrícola extensiva del Uruguay. Los suelos profundos de la cuenca del río Negro permiten cultivos de alto potencial, pero los déficits hídricos de enero y febrero pueden reducir el rendimiento en un 30–40% en años secos. El riego suplementario estabiliza esa variable y permite planificar con mayor certeza.</p>
<p>Los productores que invierten en riego obtienen rendimientos significativamente más altos y estables. El diseño de la estación de bombeo — selección de bomba, caudal garantizado, tablero eléctrico y cañería de conducción — es la inversión de mayor impacto antes de montar una red de aspersión o poner a punto un sistema de cañones.</p>`,
  },

  logistics: {
    description:
      'Atendemos Soriano con visitas técnicas programadas. Coordinamos visita al predio con anticipación para relevamiento completo del sistema.',
    deliveryNotes:
      'Envío de materiales a Mercedes, Dolores y Cardona en 48–72 horas. Equipos pesados: coordinación especial de transporte.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Soriano',
    recommendations: [
      {
        iconName: 'Gauge',
        title: 'Bombeo para aspersión de largo alcance',
        description:
          'Los cañones de largo alcance y las redes de aspersión exigen presión estable y caudal sostenido. Dimensionamos el equipo con la curva real de la bomba, la pérdida de carga de la cañería, la presión de trabajo del emisor y la filtración necesaria según la fuente de agua.',
      },
      {
        iconName: 'Database',
        title: 'Represas para riego extensivo',
        description:
          'Diseño de represas impermeabilizadas con capacidad de 50.000 a 500.000 m³ para alimentar sistemas de riego durante toda la temporada sin depender únicamente de lluvia o acuíferos.',
      },
      {
        iconName: 'Lightbulb',
        title: 'Asesoramiento antes de invertir',
        description:
          'Antes de invertir en cañones, equipos de aspersión o ampliaciones de la red, calculamos el balance hídrico del predio: fuente de agua disponible, demanda real del cultivo y capacidad de reposición del acuífero o represa. Evitamos sobredimensionamientos costosos.',
      },
    ],
  },

  nearbyDepartments: ['colonia', 'rio-negro', 'flores', 'durazno'],
  geoCoordinates: { latitude: -33.2491, longitude: -58.0296 },
};

const rioNegro: Department = {
  slug: 'rio-negro',
  name: 'Río Negro',
  tier: 2,
  published: true,
  capital: 'Fray Bentos',
  metaTitle: 'Riego y Bombeo en Río Negro | La Aldea',
  metaDescription:
    'Sistemas de riego y bombeo para agricultura, forestación y ganadería en Río Negro. Instalación profesional con diseño hidráulico. Presupuesto sin cargo.',
  keywords: [
    'riego Río Negro Uruguay',
    'bombeo Río Negro',
    'riego agricultura Río Negro',
    'bomba de agua Fray Bentos',
    'riego forestación Río Negro',
    'bombeo Young Río Negro',
  ],
  heroSubtitle: 'Riego y bombeo para la agricultura, forestación y ganadería de Río Negro.',
  introText: `<p>Río Negro combina agricultura extensiva de gran escala en la cuenca del río Negro, forestación industrial creciente (eucaliptus para celulosa) y ganadería extensiva en las zonas de campo natural. Young, en el noreste del departamento, es uno de los centros agrícolas más productivos del Uruguay y los productores de la zona invierten cada vez más en riego suplementario para maíz y soja.</p>
<p>La cercanía al río Negro y los acuíferos profundos de la zona ofrecen fuentes de agua abundantes para proyectos de gran escala. Los viveros forestales de la región — que abastecen a las plantaciones de eucaliptus — necesitan riego de precisión durante los primeros meses de implantación de las plántulas.</p>
<p>Para la ganadería extensiva de la zona sur, diseñamos sistemas de bombeo solar que llevan agua a puntos remotos del campo sin red eléctrica, reduciendo la dependencia del camión cisterna o el tractor con tanque.</p>`,

  agriculturalFocus: {
    title: 'Agricultura extensiva, forestación y ganadería',
    crops: [
      'Soja',
      'Trigo y Cebada',
      'Maíz',
      'Eucaliptus y Pino (forestación)',
      'Ganadería extensiva de carne',
      'Lechería',
      'Arroz (zona sur)',
    ],
    description: `<p>Río Negro combina grandes superficies agrícolas en la zona de Young con forestación industrial que crece año a año. Los productores de la cuenca del río Negro tienen acceso a agua superficial abundante, lo que facilita la instalación de sistemas de riego de alto caudal desde fuentes superficiales con toma directa bien diseñada.</p>
<p>Los viveros forestales que abastecen las plantaciones de celulosa necesitan sistemas de microaspersión o nebulización de alta uniformidad para garantizar la supervivencia de las plántulas durante los meses de verano — un período crítico donde la pérdida por sequía puede arruinar toda la producción de un semestre.</p>`,
  },

  logistics: {
    description:
      'Atendemos Río Negro con visitas técnicas programadas. Coordinamos con anticipación para relevamiento en establecimiento.',
    deliveryNotes:
      'Envío de materiales a Fray Bentos y Young en 48–72 horas. Equipos pesados con transporte coordinado.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Río Negro',
    recommendations: [
      {
        iconName: 'Gauge',
        title: 'Bombeo desde fuentes superficiales',
        description:
          'Los arroyos y represas de Río Negro permiten bombeo de alto caudal con bombas de superficie. Diseñamos la toma de agua, la cañería de impulsión y la filtración contra sedimentos y algas.',
      },
      {
        iconName: 'Droplets',
        title: 'Riego de viveros forestales',
        description:
          'Sistemas de microaspersión para viveros de eucaliptus y pino. Control preciso de humedad del sustrato durante los primeros 90 días de implantación, que determinan la tasa de supervivencia del lote.',
      },
      {
        iconName: 'Sun',
        title: 'Bombeo solar para ganadería extensiva',
        description:
          'Establecimientos ganaderos de gran extensión se benefician del bombeo solar para pozos o tajamares remotos. Sin tendido eléctrico, sin combustible, con autonomía de décadas.',
      },
    ],
  },

  nearbyDepartments: ['soriano', 'paysandu', 'durazno'],
  geoCoordinates: { latitude: -33.1132, longitude: -58.2957 },
};

const paysandu: Department = {
  slug: 'paysandu',
  name: 'Paysandú',
  tier: 2,
  published: true,
  capital: 'Paysandú',
  metaTitle: 'Riego y Bombeo en Paysandú | La Aldea',
  metaDescription:
    'Instalación de riego y bombeo para citricultura, arroz y ganadería en Paysandú. Diseño hidráulico profesional. Presupuesto sin cargo.',
  keywords: [
    'riego Paysandú Uruguay',
    'bombeo Paysandú',
    'riego citrus Paysandú',
    'instalación riego Paysandú',
    'bomba de agua Paysandú',
    'riego arroz Paysandú',
    'riego agricultura Paysandú',
  ],
  heroSubtitle: 'Riego para la citricultura, el arroz y la producción diversificada de Paysandú.',
  introText: `<p>Paysandú es un departamento de producción diversificada: citricultura de exportación, producción arrocera significativa en la zona este, agricultura extensiva, ganadería de carne y lechería. Junto con Salto, Paysandú abastece el 90% de las exportaciones cítricas del Uruguay — una responsabilidad que exige que los sistemas de riego funcionen sin fallar durante toda la temporada.</p>
<p>La zona citrícola de Paysandú (naranjas, mandarinas, limones) requiere riego por goteo o microaspersión desde la implantación hasta la cosecha. Un estrés hídrico durante la floración puede reducir la producción en un 40–50% en el año siguiente. Los arrozales del este del departamento necesitan bombeo de alto caudal para inundación controlada de las chacras durante la temporada.</p>
<p>Para los productores ganaderos, diseñamos sistemas de bombeo que aprovechan las fuentes de agua del litoral: el río Uruguay, arroyos tributarios y acuíferos generosos de la zona.</p>`,

  agriculturalFocus: {
    title: 'Citricultura de exportación, arroz y producción diversificada',
    crops: [
      'Citrus (naranja, mandarina, limón, pomelo)',
      'Arroz',
      'Soja y Maíz',
      'Pasturas para ganadería',
      'Ganadería de carne',
      'Lechería',
      'Forestación (eucaliptus)',
    ],
    description: `<p>La citricultura de Paysandú — concentrada en la zona de Paysandú capital y las colonias agrícolas del litoral — abastece tanto al mercado interno como a la exportación. Los montes cítricos requieren riego permanente desde la implantación, con sistemas de microaspersión bajo copa que evitan mojar la fruta y reducen el riesgo de enfermedades fúngicas. La autocompensación de los emisores es fundamental en Paysandú por las pendientes irregulares del terreno litoral.</p>
<p>La producción arrocera del este del departamento demanda bombeo de altísimo caudal durante la temporada de inundación. Son sistemas que operan miles de horas al año y deben dimensionarse con margen de seguridad real, no teórico.</p>`,
  },

  logistics: {
    description:
      'Atendemos Paysandú con visitas técnicas programadas. Coordinamos con anticipación para relevamiento en predio.',
    deliveryNotes:
      'Envío de materiales a Paysandú capital en 72 horas. Localidades rurales y zona arrocera este: coordinación especial.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Paysandú',
    recommendations: [
      {
        iconName: 'Droplets',
        title: 'Goteo autocompensante para citrus',
        description:
          'Emisores autocompensantes cada 50–80 cm para montes cítricos en pendiente. La autocompensación garantiza la misma dosis de agua en la fila alta y la baja del monte, eliminando el estrés hídrico diferencial entre plantas.',
      },
      {
        iconName: 'Gauge',
        title: 'Bombeo de alto caudal para arroz',
        description:
          'Estaciones de bombeo para inundación de chacras arroceras: selección de bomba según caudal requerido, tablero eléctrico con protección, cañería de succión e impulsión. Equipos dimensionados para operar toda la zafra sin interrupciones.',
      },
      {
        iconName: 'Leaf',
        title: 'Bebederos para ganadería del litoral',
        description:
          'Redes de distribución con bebederos automáticos de nivel constante. En establecimientos extensivos del litoral, diseñamos la red para minimizar la distancia del ganado al punto de agua.',
      },
    ],
  },

  nearbyDepartments: ['rio-negro', 'salto', 'tacuarembo'],
  geoCoordinates: { latitude: -32.3222, longitude: -58.0756 },
};

// ─────────────────────────────────────────────────────────────
//  TIER 3 — Eastern Livestock & Tourism
// ─────────────────────────────────────────────────────────────

const maldonado: Department = {
  slug: 'maldonado',
  name: 'Maldonado',
  tier: 3,
  published: true,
  capital: 'Maldonado',
  metaTitle: 'Riego y Bombeo en Maldonado | La Aldea',
  metaDescription:
    'Sistemas de bombeo doméstico, riego para jardines, viñedos y chacras en Maldonado. Automatización con control remoto. Presupuesto sin cargo.',
  keywords: [
    'bomba de agua Maldonado',
    'riego Maldonado',
    'riego jardín Punta del Este',
    'bomba pozo Maldonado',
    'presurización Maldonado',
    'riego viñedos Garzón',
    'riego olivos Maldonado',
  ],
  heroSubtitle: 'Bombeo doméstico, jardines y chacras de alto valor en Maldonado.',
  introText: `<p>Maldonado combina una fuerte demanda de bombeo doméstico y riego de jardines en la zona de Punta del Este con producción agrícola de alto valor en el interior: Garzón es reconocido mundialmente por sus viñedos boutique, Aiguá y Pan de Azúcar producen olivos, hortalizas gourmet y aromáticas que abastecen a la gastronomía de la costa.</p>
<p>Las residencias de la costa atlántica necesitan sistemas de presurización confiables y riego automatizado para jardines de diseño. Muchos propietarios no residen permanentemente en Maldonado — el control remoto vía app es una funcionalidad que agrega valor real: saber que el jardín está siendo regado sin tener que estar presente.</p>
<p>Los pozos artesianos de la zona costera pueden tener variaciones en la napa y, en algunos puntos cercanos al mar, algo de contenido mineral que requiere filtración adecuada. Lo relevamos en cada visita técnica.</p>`,

  agriculturalFocus: {
    title: 'Viñedos boutique, olivos y turismo rural',
    crops: [
      'Uva (viñedos boutique de exportación)',
      'Olivos (aceite de oliva premium)',
      'Hortalizas gourmet y aromáticas',
      'Jardines residenciales y parques privados',
      'Frutales artesanales',
      'Ganadería extensiva',
    ],
    description: `<p>Garzón se ha posicionado como uno de los polos vitivinícolas más reconocidos de Uruguay, con viñedos de altísima calidad que exportan a mercados exigentes. Estos emprendimientos requieren riego de precisión por goteo con fertirrigación a medida para adaptarse a cada etapa fenológica de la uva. La autocompensación es clave dado el relieve ondulado de la zona.</p>
<p>La zona costera demanda riego de jardines de diseño: aspersores emergentes sectoriales, microaspersión para canteros y automatización con programador y control WiFi son los sistemas más demandados. En la zona de Pan de Azúcar y Aiguá, los olivos y huertas artesanales requieren goteo desde la implantación.</p>`,
  },

  logistics: {
    description:
      'Atendemos Maldonado y Punta del Este con visitas técnicas coordinadas. Frecuencia semanal en temporada alta.',
    deliveryNotes:
      'Envío de materiales a Maldonado, Punta del Este, Pan de Azúcar y Aiguá en 48 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para Maldonado',
    recommendations: [
      {
        iconName: 'Gauge',
        title: 'Presurización para residencias',
        description:
          'Bombas presurizadoras de acero inoxidable para viviendas con baja presión de red o pozo artesiano. Silenciosas, compactas y con tanque hidroneumático para respuesta instantánea.',
      },
      {
        iconName: 'Timer',
        title: 'Riego automatizado con control remoto',
        description:
          'Sistemas de riego con programador y control vía app para propietarios que no residen en Maldonado permanentemente. Ajuste de horarios, caudal y zonas desde el celular, en cualquier lugar.',
      },
      {
        iconName: 'Droplets',
        title: 'Riego de precisión para viñedos y olivos',
        description:
          'Sistemas de riego por goteo a medida para viñedos boutique y olivares: instalaciones precisas que permiten gestionar la aplicación de agua en cada ciclo productivo, facilitando el manejo de los cultivos sin desperdiciar recursos.',
      },
    ],
  },

  nearbyDepartments: ['canelones', 'lavalleja', 'rocha'],
  geoCoordinates: { latitude: -34.9095, longitude: -54.9535 },
};

const lavalleja: Department = {
  slug: 'lavalleja',
  name: 'Lavalleja',
  tier: 3,
  published: true,
  capital: 'Minas',
  metaTitle: 'Riego y Bombeo en Lavalleja | La Aldea',
  metaDescription:
    'Bombeo solar para zonas serranas y riego ganadero en Lavalleja. Soluciones para pozos remotos y establecimientos sin red eléctrica. Presupuesto sin cargo.',
  keywords: [
    'bombeo solar Lavalleja',
    'bomba de agua Minas',
    'riego Lavalleja Uruguay',
    'bombeo ganadero Lavalleja',
    'bomba pozo Lavalleja',
    'riego viñedos Lavalleja',
  ],
  heroSubtitle: 'Bombeo solar y riego para la ganadería serrana de Lavalleja.',
  introText: `<p>Lavalleja es un departamento de sierras, ganadería extensiva, canteras de granito y producción artesanal de alta calidad. El terreno ondulado y la dispersión de los establecimientos hacen del bombeo un desafío técnico particular: pozos profundos en zonas altas, napas variables, y largos tramos de cañería con desniveles que deben calcularse con precisión.</p>
<p>En las sierras de Minas, Aiguá y José Pedro Varela, muchos establecimientos ganaderos no tienen acceso a red eléctrica. El bombeo solar es la solución más práctica y rentable: funciona de forma autónoma, sin combustible ni mantenimiento eléctrico complejo, con una vida útil que supera los 25 años en los paneles.</p>
<p>La zona de Minas concentra también emprendimientos vitivinícolas y de producción artesanal que utilizan las condiciones de amplitud térmica serrana para producir vinos y aceites de oliva de carácter diferenciado. El goteo con autocompensación es la solución estándar para viñedos en pendiente.</p>`,

  agriculturalFocus: {
    title: 'Ganadería serrana y producción artesanal de calidad',
    crops: [
      'Ganadería extensiva (vacunos y ovinos de campo natural)',
      'Viñedos de altura',
      'Olivos',
      'Hortalizas artesanales',
      'Canteras (granito) — demanda industrial de agua',
    ],
    description: `<p>La ganadería extensiva sobre campo natural domina el paisaje productivo de Lavalleja. Los establecimientos de las sierras operan con cargas bajas y necesitan agua en puntos remotos donde no llega la red eléctrica — el bombeo solar con tanque de reserva por gravedad es la solución más instalada en la zona.</p>
<p>La zona de Minas concentra emprendimientos vitivinícolas y olivícolas artesanales que aprovechan la amplitud térmica de la sierra para producir vinos y aceites con perfil diferenciado al de la zona sur. Las canteras de granito rosa también generan demanda de agua para los procesos de corte y enfriamiento de equipos.</p>`,
  },

  logistics: {
    description:
      'Atendemos Lavalleja con visitas técnicas programadas. Minas está a aproximadamente 120 km de nuestra base en Tala.',
    deliveryNotes:
      'Envío de materiales a Minas, Aiguá y José Pedro Varela en 48–72 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Lavalleja',
    recommendations: [
      {
        iconName: 'Sun',
        title: 'Bombeo solar para sierras sin electricidad',
        description:
          'Paneles fotovoltaicos + bomba sumergible DC para pozos en zonas serranas sin red eléctrica. El sistema bombea agua a un tanque elevado que distribuye por gravedad a los bebederos, eliminando la necesidad de bombas adicionales.',
      },
      {
        iconName: 'Gauge',
        title: 'Cálculo preciso con desniveles',
        description:
          'El terreno ondulado de Lavalleja exige cálculo real de la altura manométrica total: cota del pozo, cota del tanque, distancia horizontal y fricción del recorrido. Un error de 10 metros en el cálculo puede quemar una bomba o dejar el campo sin agua.',
      },
      {
        iconName: 'Droplets',
        title: 'Goteo autocompensante para viñedos en pendiente',
        description:
          'Goteo con goteros autocompensantes para viñedos en laderas serranas. La autocompensación garantiza la misma dosis de agua en toda la fila, independientemente de la pendiente del terreno.',
      },
    ],
  },

  nearbyDepartments: ['canelones', 'florida', 'maldonado', 'treinta-y-tres', 'rocha'],
  geoCoordinates: { latitude: -34.3769, longitude: -55.2376 },
};

const rocha: Department = {
  slug: 'rocha',
  name: 'Rocha',
  tier: 3,
  published: true,
  capital: 'Rocha',
  metaTitle: 'Riego y Bombeo en Rocha | La Aldea',
  metaDescription:
    'Riego para arroz, ganadería y emprendimientos turísticos en Rocha. Bombeo de alto caudal y soluciones solares. Presupuesto sin cargo.',
  keywords: [
    'riego arroz Rocha',
    'bombeo Rocha Uruguay',
    'riego ganadero Rocha',
    'bomba de agua Rocha',
    'riego turismo rural Rocha',
    'bombeo Lascano Rocha',
  ],
  heroSubtitle: 'Riego para el arroz, la ganadería y el turismo rural de Rocha.',
  introText: `<p>Rocha es un departamento de contrastes productivos: producción arrocera de alto volumen en la zona norte (Lascano, Cebollatí), ganadería extensiva en el centro sobre campo natural de muy buen potencial, y una costa atlántica de 200 km que concentra emprendimientos turísticos, posadas y huertas artesanales de creciente sofisticación.</p>
<p>El arroz requiere bombeo de altísimo caudal para inundación controlada de las chacras. Las estaciones de bombeo para arrozales operan miles de horas por temporada — no hay margen para un equipo que falle. Los sistemas que instalamos están seleccionados para condiciones intensivas con mínimo mantenimiento y máxima confiabilidad.</p>
<p>En la costa — La Paloma, Aguas Dulces, José Ignacio — los emprendimientos de turismo rural y producción artesanal necesitan bombeo doméstico confiable y riego automatizado que funcione con personal limitado o sin supervisión permanente.</p>`,

  agriculturalFocus: {
    title: 'Arroz, ganadería y turismo rural en la costa atlántica',
    crops: [
      'Arroz (zona norte: Lascano, Cebollatí)',
      'Ganadería extensiva de carne',
      'Pasturas naturales',
      'Huertas artesanales costeras',
      'Olivos y aromáticas (zona rural turística)',
    ],
    description: `<p>La zona arrocera del norte de Rocha, en torno a Lascano y la laguna Merín, es una de las más productivas del país. Cada hectárea de arroz consume entre 10.000 y 15.000 m³ de agua por temporada. Las estaciones de bombeo deben diseñarse para sostener ese caudal durante 3–4 meses consecutivos con mínima falla.</p>
<p>La ganadería extensiva del centro del departamento opera sobre pastizales naturales de alta calidad. Los establecimientos necesitan puntos de agua distribuidos — el bombeo solar para tajamares y pozos lejanos es la solución más instalada en esta zona. En la costa, el turismo rural genera demanda de riego automatizado de bajo mantenimiento para huertas, jardines y posadas rurales.</p>`,
  },

  logistics: {
    description:
      'Atendemos Rocha con visitas técnicas programadas. Coordinamos con anticipación para cubrir todo el departamento.',
    deliveryNotes:
      'Envío de materiales a Rocha capital, Lascano y Castillos en 72 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Rocha',
    recommendations: [
      {
        iconName: 'Gauge',
        title: 'Bombeo de alto caudal para arrozales',
        description:
          'Bombas de 20–100 HP para inundación de chacras arroceras. Diseñamos la toma de agua, la estación de bombeo con protección eléctrica y control de nivel automático para optimizar el consumo de energía durante la temporada.',
      },
      {
        iconName: 'Sun',
        title: 'Bombeo solar para ganadería',
        description:
          'Sistemas solares autónomos para pozos en campos ganaderos extensivos. Sin combustible, sin mantenimiento eléctrico complejo, con vida útil del panel superior a 25 años.',
      },
      {
        iconName: 'Timer',
        title: 'Riego automatizado para turismo rural',
        description:
          'Sistemas de riego con programador y control remoto para posadas, restaurantes rurales y huertas artesanales que operan con personal limitado o sin supervisión diaria.',
      },
    ],
  },

  nearbyDepartments: ['maldonado', 'lavalleja', 'treinta-y-tres'],
  geoCoordinates: { latitude: -34.4833, longitude: -54.2167 },
};

const treintaYTres: Department = {
  slug: 'treinta-y-tres',
  name: 'Treinta y Tres',
  tier: 3,
  published: true,
  capital: 'Treinta y Tres',
  metaTitle: 'Riego y Bombeo en Treinta y Tres | La Aldea',
  metaDescription:
    'Bombeo de alto caudal para arroz y ganadería en Treinta y Tres. Estaciones de bombeo especializadas. Presupuesto sin cargo.',
  keywords: [
    'riego arroz Treinta y Tres',
    'bombeo Treinta y Tres Uruguay',
    'riego ganadero Treinta y Tres',
    'bomba de agua Treinta y Tres',
    'estación bombeo arrocera Treinta y Tres',
  ],
  heroSubtitle: 'Bombeo especializado para la producción arrocera del río Olimar.',
  introText: `<p>Treinta y Tres es uno de los principales departamentos arroceros del Uruguay. La cuenca del río Olimar y la laguna Merín proveen agua abundante para los arrozales que se extienden por miles de hectáreas en el departamento. Uruguay es el 9° exportador mundial de arroz y Treinta y Tres es parte central de esa historia.</p>
<p>Los arroceros del departamento manejan chacras de 200 a 2.000 hectáreas donde cada hora de bombeo cuenta — y cada falla tiene un costo directo en producción. Los equipos que instalamos están dimensionados para operar en condiciones intensivas con mínimo consumo energético por metro cúbico bombeado y máxima confiabilidad durante toda la zafra.</p>
<p>La ganadería extensiva del norte del departamento también necesita soluciones de agua: bebederos en puntos remotos, bombeo desde arroyos y tajamares, y sistemas solares para establecimientos sin red eléctrica en las lomadas serranas.</p>`,

  agriculturalFocus: {
    title: 'Arroz de exportación y ganadería extensiva',
    crops: [
      'Arroz (chacras de 200 a 2.000 ha)',
      'Ganadería de carne (zona norte, lomadas)',
      'Pasturas naturales',
      'Soja en rotación con arroz',
    ],
    description: `<p>Treinta y Tres concentra una porción significativa de la producción arrocera nacional. Los productores operan con estaciones de bombeo fijas y portátiles que demandan equipos de alta confiabilidad: bombas centrífugas de 30 a 100 HP con caudalímetro, variador de frecuencia cuando aplica, y protección eléctrica calibrada a las condiciones de la red rural.</p>
<p>La rotación arroz-soja es cada vez más frecuente en el departamento, lo que genera demanda de riego suplementario también en los cultivos de secano. La ganadería de carne sobre campo natural de las lomadas norte necesita puntos de agua bien distribuidos para maximizar el aprovechamiento del pastizal.</p>`,
  },

  logistics: {
    description:
      'Atendemos Treinta y Tres con visitas técnicas programadas para relevamiento de proyectos de mediana y gran escala.',
    deliveryNotes:
      'Envío de materiales a Treinta y Tres capital en 72 horas. Equipos pesados con transporte coordinado.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Treinta y Tres',
    recommendations: [
      {
        iconName: 'Gauge',
        title: 'Estaciones de bombeo para arrozales',
        description:
          'Diseño integral de la estación de bombeo: selección de bomba por curva real, tablero con variador de frecuencia para eficiencia energética, cañería de succión e impulsión, y válvula de retención contra golpe de ariete.',
      },
      {
        iconName: 'Leaf',
        title: 'Red de bebederos para ganadería',
        description:
          'Diseño de redes de distribución con bebederos de flotante en puntos estratégicos del campo. El criterio de diseño: el ganado no debería recorrer más de 500 metros para llegar al agua.',
      },
      {
        iconName: 'Sun',
        title: 'Bombeo solar para tajamares',
        description:
          'Bombas solares de superficie para trasvasar agua desde tajamares a tanques australianos elevados. La distribución por gravedad a los bebederos simplifica la instalación y elimina bombas adicionales.',
      },
    ],
  },

  nearbyDepartments: ['cerro-largo', 'lavalleja', 'rocha'],
  geoCoordinates: { latitude: -33.2333, longitude: -54.3833 },
};

// ─────────────────────────────────────────────────────────────
//  TIER 4 — Northern Frontiers (Extensive Livestock & Rice)
// ─────────────────────────────────────────────────────────────

const salto: Department = {
  slug: 'salto',
  name: 'Salto',
  tier: 4,
  published: true,
  capital: 'Salto',
  metaTitle: 'Riego y Bombeo en Salto | La Aldea',
  metaDescription:
    'Riego para citricultura, horticultura de primicia y agricultura en Salto. Sistemas de bombeo para riego intensivo del litoral norte. Presupuesto sin cargo.',
  keywords: [
    'riego Salto Uruguay',
    'bombeo Salto',
    'riego citrus Salto',
    'riego horticultura Salto',
    'bomba de agua Salto',
    'riego invernaderos Salto',
  ],
  heroSubtitle: 'Riego intensivo para la citricultura y la horticultura de primicia del litoral.',
  introText: `<p>Salto es el polo citrícola y hortícola más importante del norte del Uruguay. Junto con Paysandú, abastece el 90% de las exportaciones cítricas del país — una posición de liderazgo construida sobre décadas de experiencia productiva y condiciones climáticas únicas. El cinturón hortícola que rodea la ciudad de Salto produce el 40% de las verduras y frutas frescas que se consumen en Uruguay (Intendencia de Salto), con un porcentaje aún mayor en invierno cuando produce en contraestación con el sur.</p>
<p>Los veranos más cálidos y prolongados del norte generan demandas hídricas más altas por hectárea. Sin riego, la producción citrícola e hortícola de Salto es inviable para los cultivos de mayor valor. El riego no es una mejora — es la base de la actividad.</p>
<p>Diseñamos sistemas adaptados al clima y los suelos del litoral norte: goteo con fertirrigación para citrus y hortalizas bajo cubierta, aspersión para cultivos a campo, y bombeo de alto caudal desde el río Uruguay y los acuíferos terciarios de la zona.</p>`,

  agriculturalFocus: {
    title: 'Citricultura de exportación y horticultura de primicia',
    crops: [
      'Citrus (naranja, mandarina, limón, pomelo)',
      'Tomate, Morrón, Sandía, Melón',
      'Arándano',
      'Hortalizas bajo cubierta (invernáculos)',
      'Fruticultura diversa',
      'Ganadería de carne',
      'Agricultura de secano',
    ],
    description: `<p>Salto produce cítricos que llegan al mercado 2–3 semanas antes que la producción del sur, capturando precios premium. Los montes cítricos requieren riego permanente con emisores autocompensantes — un estrés hídrico durante la floración puede comprometer la producción del ciclo siguiente.</p>
<p>La horticultura bajo cubierta creció marcadamente, con alrededor de 400 establecimientos dedicados al rubro (Intendencia de Salto) que demandan riego por goteo con fertirrigación y control de clima integrado. El cinturón hortícola de Salto es uno de los más tecnificados del Uruguay, con una tradición productiva que se remonta a las corrientes migratorias del siglo XIX.</p>`,
  },

  logistics: {
    description:
      'Atendemos Salto con visitas técnicas programadas para proyectos de riego de mediana y gran escala. Coordinamos con anticipación.',
    deliveryNotes:
      'Envío de materiales a Salto capital en 72–96 horas. Equipos pesados con transporte coordinado.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Salto',
    recommendations: [
      {
        iconName: 'Droplets',
        title: 'Goteo con fertirrigación para citrus',
        description:
          'Sistemas de goteo con inyector de fertilizantes líquidos para montes cítricos. La fertirrigación permite ajustar la nutrición en cada etapa fenológica sin desperdicios — clave para la calidad del fruto exportable.',
      },
      {
        iconName: 'CloudRain',
        title: 'Microaspersión bajo cubierta',
        description:
          'Microaspersión de alta uniformidad para invernaderos de tomate, morrón y melón. Diseño que optimiza la distribución y evita el mojado excesivo del follaje que favorece enfermedades fúngicas.',
      },
      {
        iconName: 'Gauge',
        title: 'Bombeo desde el río Uruguay',
        description:
          'Sistemas de captación desde el río Uruguay con filtración multi-etapa para sedimentos y algas. Diseño de la toma de agua y cañería de impulsión que resiste las variaciones de nivel del río.',
      },
    ],
  },

  nearbyDepartments: ['artigas', 'paysandu'],
  geoCoordinates: { latitude: -31.3833, longitude: -57.9672 },
};

const artigas: Department = {
  slug: 'artigas',
  name: 'Artigas',
  tier: 4,
  published: true,
  capital: 'Artigas',
  metaTitle: 'Riego y Bombeo en Artigas | La Aldea',
  metaDescription:
    'Riego para arroz y bombeo solar para ganadería en Artigas. Equipos duraderos para el norte extremo del Uruguay. Presupuesto sin cargo.',
  keywords: [
    'riego arroz Artigas',
    'bombeo solar Artigas',
    'bombeo ganadero Artigas',
    'bomba de agua Artigas',
    'riego Artigas Uruguay',
    'bombas acero inoxidable Artigas',
  ],
  heroSubtitle: 'Bombeo solar y riego arrocero para el norte del Uruguay.',
  introText: `<p>Artigas es la frontera norte del Uruguay: grandes estancias ganaderas, producción arrocera intensiva en la cuenca del río Cuareim, y las condiciones climáticas más extremas del país — los veranos más calurosos, con temperaturas que superan los 40°C y una radiación solar que es, paradójicamente, el mayor activo para el bombeo solar.</p>
<p>La distancia a los centros de servicio técnico convierte la durabilidad en un criterio de selección no negociable. Los sistemas que instalamos en Artigas están elegidos para funcionar en condiciones severas con mínimo mantenimiento: bombeo solar para campos sin electricidad, bombas de acero inoxidable para pozos con agua de alto contenido mineral, y cañerías de PEAD resistentes a la radiación UV intensa del norte.</p>
<p>Para los arroceros del departamento, diseñamos estaciones de bombeo de alto caudal optimizadas para consumo energético, con protección eléctrica reforzada contra las variaciones de voltaje frecuentes en la red rural del norte.</p>`,

  agriculturalFocus: {
    title: 'Arroz intensivo y ganadería de grandes estancias',
    crops: [
      'Arroz (cuenca del río Cuareim)',
      'Ganadería de carne extensiva',
      'Ganadería ovina (lana y carne)',
      'Soja en rotación',
      'Piedras semipreciosas (amatistas, ágatas) — extracción',
    ],
    description: `<p>El arroz es la actividad agrícola más dinámica de Artigas, con chacras que aprovechan la cuenca del río Cuareim y los acuíferos profundos del norte. La producción ganadera extensiva domina el paisaje del centro y sur del departamento, con estancias de gran extensión que necesitan agua en múltiples puntos sin acceso a red eléctrica.</p>
<p>Las temperaturas extremas del norte — que pueden superar los 40°C en verano — requieren equipos de bombeo de alta resistencia térmica y materiales certificados para exposición UV prolongada. No es un detalle menor: un equipo subdimensionado para estas condiciones falla antes de terminar la primera zafra.</p>`,
  },

  logistics: {
    description:
      'Artigas es el departamento más alejado de nuestra base. Atendemos proyectos de mediana y gran escala con planificación anticipada.',
    deliveryNotes:
      'Envío de materiales a Artigas capital en 96 horas. Equipos pesados con transporte coordinado y seguro.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Artigas',
    recommendations: [
      {
        iconName: 'Sun',
        title: 'Bombeo solar de alta eficiencia',
        description:
          'Paneles fotovoltaicos de alta eficiencia + bomba sumergible DC para pozos. La intensa radiación solar de Artigas garantiza un rendimiento del sistema significativamente superior al promedio nacional.',
      },
      {
        iconName: 'Gauge',
        title: 'Bombas de acero inoxidable para agua con mineral',
        description:
          'El agua del norte puede ser agresiva: alto contenido de hierro, manganeso o dureza total. Seleccionamos bombas sumergibles con cuerpo y rotor de acero inoxidable AISI 304 para máxima durabilidad.',
      },
      {
        iconName: 'Shield',
        title: 'Protección eléctrica reforzada',
        description:
          'Tableros con protección contra sobretensión, bajo voltaje y cortocircuito. Las variaciones de voltaje en la zona rural del norte requieren protección de mayor especificación que en la red urbana.',
      },
    ],
  },

  nearbyDepartments: ['salto', 'rivera'],
  geoCoordinates: { latitude: -30.4000, longitude: -56.4696 },
};

const rivera: Department = {
  slug: 'rivera',
  name: 'Rivera',
  tier: 4,
  published: true,
  capital: 'Rivera',
  metaTitle: 'Riego y Bombeo en Rivera | La Aldea',
  metaDescription:
    'Bombeo solar y riego para forestación, viveros y ganadería extensiva en Rivera. Soluciones robustas para establecimientos rurales. Presupuesto sin cargo.',
  keywords: [
    'bombeo solar Rivera Uruguay',
    'riego Rivera',
    'bombeo ganadero Rivera',
    'bomba de agua Rivera',
    'riego forestación Rivera',
    'riego viveros Rivera',
  ],
  heroSubtitle: 'Bombeo para la forestación y la ganadería extensiva de Rivera.',
  introText: `<p>Rivera es un departamento de frontera cuya economía productiva se apoya en tres pilares: forestación industrial con eucaliptus y pino (que abastece a la industria de celulosa), ganadería extensiva sobre campo natural y sierras, y un creciente turismo de frontera.</p>
<p>La forestación ocupa superficies crecientes y genera demanda de riego en los viveros que producen las plántulas. En establecimientos forestales de escala, los campamentos de trabajadores y la maquinaria también requieren abastecimiento de agua confiable en zonas alejadas de la red.</p>
<p>Para la ganadería, diseñamos sistemas de bombeo solar que llevan agua a puntos remotos sin red eléctrica, con tanques de almacenamiento que garantizan suministro durante varios días de baja radiación — algo a considerar dado que Rivera puede tener períodos nublados prolongados en invierno.</p>`,

  agriculturalFocus: {
    title: 'Forestación industrial y ganadería de frontera',
    crops: [
      'Eucaliptus (para celulosa)',
      'Pino (madera aserrable)',
      'Ganadería de carne sobre campo natural',
      'Ganadería ovina (lana y carne)',
      'Pasturas naturales',
    ],
    description: `<p>Rivera concentra una parte importante de la forestación uruguaya, con plantaciones de eucaliptus y pino que abastecen a la industria de celulosa. Los viveros forestales que producen las plántulas requieren riego controlado de alta uniformidad durante los 3–4 meses iniciales — la tasa de supervivencia del lote depende directamente de la consistencia del riego.</p>
<p>La ganadería extensiva sobre campo natural de las sierras del departamento opera con cargas bajas en grandes extensiones. Llevar agua a potreros remotos sin electricidad es el desafío técnico dominante en la zona.</p>`,
  },

  logistics: {
    description:
      'Atendemos Rivera con visitas técnicas programadas para proyectos de mediana y gran escala.',
    deliveryNotes:
      'Envío de materiales a Rivera capital en 72–96 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Rivera',
    recommendations: [
      {
        iconName: 'Sun',
        title: 'Bombeo solar con batería de respaldo',
        description:
          'Sistemas solares con batería de respaldo para garantizar bombeo incluso en períodos nublados prolongados de invierno. Diseñados para funcionar sin mantenimiento complejo durante meses.',
      },
      {
        iconName: 'Droplets',
        title: 'Riego de viveros forestales',
        description:
          'Microaspersión de alta uniformidad para viveros de eucaliptus y pino. Control preciso de la humedad del sustrato para maximizar la tasa de supervivencia durante los 90 días críticos post-siembra.',
      },
      {
        iconName: 'Database',
        title: 'Tanques y distribución por gravedad',
        description:
          'Tanques australianos de 10.000 a 50.000 litros como reserva central en puntos altos del campo. La distribución por gravedad a los bebederos elimina bombas adicionales y simplifica el mantenimiento.',
      },
    ],
  },

  nearbyDepartments: ['artigas', 'tacuarembo', 'cerro-largo'],
  geoCoordinates: { latitude: -30.9053, longitude: -55.5503 },
};

const tacuarembo: Department = {
  slug: 'tacuarembo',
  name: 'Tacuarembó',
  tier: 4,
  published: true,
  capital: 'Tacuarembó',
  metaTitle: 'Riego y Bombeo en Tacuarembó | La Aldea',
  metaDescription:
    'Bombeo solar para estancias ganaderas y forestación en Tacuarembó. Diseño y montaje para grandes extensiones. Presupuesto sin cargo.',
  keywords: [
    'bombeo solar Tacuarembó',
    'bomba de agua Tacuarembó',
    'riego Tacuarembó Uruguay',
    'bombeo ganadero Tacuarembó',
    'bombeo estancia Tacuarembó',
    'tanque australiano Tacuarembó',
  ],
  heroSubtitle: 'Bombeo solar para las grandes estancias ganaderas de Tacuarembó.',
  introText: `<p>Tacuarembó es sinónimo de ganadería: grandes estancias de cría y recría sobre campo natural, con extensiones que pueden superar las 5.000 hectáreas. En este contexto, distribuir agua a todos los potreros es un desafío logístico permanente que impacta directamente en la eficiencia del pastoreo y la producción por hectárea.</p>
<p>El bombeo solar es una de las soluciones más demandadas en Tacuarembó porque permite llevar agua a cualquier punto del campo sin tendido eléctrico, sin combustible y con mantenimiento mínimo. La clave no es solo “bombear”: es diseñar el sistema completo (bomba, reserva y distribución) para que el agua llegue con continuidad a los puntos de consumo.</p>
<p><strong>Caso típico en Tacuarembó:</strong> una estancia con 6–10 potreros que necesita abastecer bebederos en líneas largas desde un pozo o tajamar. En estos casos resolvemos con bombeo solar a un tanque australiano en un punto alto y distribución por gravedad con flotantes, para asegurar agua incluso en días nublados.</p>
<p>También atendemos la forestación del departamento — plantaciones de eucaliptus y pino que necesitan agua en viveros y campamentos — y los arrozales del sur, en las cercanías de la cuenca del río Negro, donde el bombeo de alto caudal es la necesidad central.</p>`,

  agriculturalFocus: {
    title: 'Ganadería extensiva de cría, forestación y arroz',
    crops: [
      'Ganadería de cría y recría (vacunos)',
      'Ganadería ovina (lana Merino fino)',
      'Forestación (eucaliptus y pino)',
      'Arroz (zona sur, cuenca del río Negro)',
      'Pasturas naturales',
    ],
    description: `<p>Tacuarembó es el principal departamento ganadero del interior del Uruguay por superficie. La cría bovina sobre campo natural opera con cargas de 0,6–0,8 UG/ha, lo que implica grandes extensiones con múltiples potreros que necesitan puntos de agua bien distribuidos. El sistema hídrico del establecimiento determina la capacidad de carga real del campo.</p>
  <p>En la práctica, lo que más define el resultado es la logística del agua: ubicación del pozo o tajamar, altura disponible para tanque, distancia de las líneas maestras y protección de la bomba contra arena/sedimentos. Un sistema bien diseñado evita dos problemas típicos: “bebederos que se quedan sin agua en los picos” y “bombas que trabajan fuera de su rango por pérdidas de carga no calculadas”.</p>
  <p>La forestación ocupa superficies crecientes, especialmente en las zonas de sierras y suelos superficiales donde la ganadería es menos viable. Los campamentos de cosecha y los viveros de implantación requieren abastecimiento de agua en zonas remotas. Los arrozales del sur del departamento son otro rubro de demanda creciente de sistemas de bombeo de gran caudal.</p>`,
  },

  logistics: {
    description:
      'Atendemos Tacuarembó con visitas técnicas programadas para proyectos rurales de mediana y gran escala.',
    deliveryNotes:
      'Envío de materiales a Tacuarembó capital y Paso de los Toros en 72–96 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para estancias de Tacuarembó',
    recommendations: [
      {
        iconName: 'Sun',
        title: 'Bombeo solar para potreros remotos',
        description:
          'Sistemas solares con bomba sumergible DC dimensionados para abastecer a cientos de cabezas por cada punto de agua. Paneles orientados al norte, bomba protegida contra la arena del pozo, y tanque elevado para distribución por gravedad.',
      },
      {
        iconName: 'Database',
        title: 'Tanques australianos como reserva central',
        description:
          'Tanques de chapa galvanizada de 10.000 a 50.000 litros para reserva de agua en puntos estratégicos del campo. Con almacenamiento suficiente, el ganado siempre tiene agua disponible incluso en días sin sol.',
      },
      {
        iconName: 'Leaf',
        title: 'Red de bebederos automáticos',
        description:
          'Diseño de la red de distribución para cubrir la mayor cantidad de potreros con la menor inversión en cañería. Bebederos de flotante de nivel constante para vacunos y ovinos, dimensionados según cantidad de cabezas.',
      },
    ],
  },

  nearbyDepartments: ['paysandu', 'rivera', 'durazno', 'cerro-largo'],
  geoCoordinates: { latitude: -31.7167, longitude: -55.9833 },
};

const durazno: Department = {
  slug: 'durazno',
  name: 'Durazno',
  tier: 4,
  published: true,
  capital: 'Durazno',
  metaTitle: 'Riego y Bombeo en Durazno | La Aldea',
  metaDescription:
    'Sistemas de bombeo y riego para ganadería, lechería y agricultura en Durazno. Centro logístico del Uruguay. Presupuesto sin cargo.',
  keywords: [
    'bombeo Durazno Uruguay',
    'riego Durazno',
    'bomba de agua Durazno',
    'riego ganadero Durazno',
    'bombeo solar Durazno',
    'riego praderas Durazno',
  ],
  heroSubtitle: 'Riego y bombeo desde el corazón geográfico del Uruguay.',
  introText: `<p>Durazno es el centro geográfico del Uruguay — un nudo logístico donde convergen Ruta 5 y Ruta 14, con acceso directo desde el sur, el norte y el litoral. Esta ubicación facilita la atención a productores de una zona de producción mixta que combina ganadería de carne, lechería en el sur, agricultura en la cuenca del río Yí, y forestación creciente en las sierras del norte.</p>
<p>Los déficits hídricos de verano afectan especialmente a Durazno, donde las praderas pueden caer severamente en enero-febrero generando pérdidas en producción de leche y calidad del engorde. El riego suplementario de pasturas es una inversión de alto retorno cuando está bien dimensionada: caudal real, presión disponible y uniformidad de aplicación.</p>
<p><strong>Caso típico en Durazno:</strong> un establecimiento mixto que quiere abastecer sala de ordeñe, bebederos en varios potreros y, además, regar 3–8 hectáreas de pradera en rotación. En estos proyectos diseñamos un esquema central (bombeo + reserva + distribución) que permite usar la misma fuente de agua sin que un uso “se coma” al otro.</p>
<p>La viticultura tiene presencia en el departamento — INAVI reconoce a Durazno como parte de la región "Centro", con suelos y amplitud térmica que producen uvas de maduración más temprana que el sur, evitando las lluvias tardías de otoño.</p>`,

  agriculturalFocus: {
    title: 'Ganadería, lechería, agricultura mixta y viticultura',
    crops: [
      'Ganadería de carne (vacunos)',
      'Lechería (zona sur, limítrofe con Florida)',
      'Maíz y Soja (cuenca del río Yí)',
      'Pasturas mejoradas',
      'Forestación',
      'Vid (zona serrana)',
    ],
    description: `<p>Durazno es un departamento de producción mixta: ganadería de carne en las lomadas del norte, lechería en el sur (en continuidad con la cuenca de Florida), y agricultura de verano en los suelos profundos de la cuenca del río Yí. Los productores mixtos de Durazno necesitan agua para múltiples usos — bebederos, tambo, riego de pradera — y la planificación integral del sistema hídrico permite optimizar la inversión.</p>
  <p>En campo, los problemas más comunes son operativos: caídas de presión en líneas largas, falta de reserva para picos de consumo y bombas trabajando al límite por pérdidas de carga no consideradas. Por eso, el diseño del bombeo y de la cañería principal suele ser “la decisión” que determina si el sistema funciona en enero o falla en el momento crítico.</p>
<p>Los viñedos de la zona serrana de Durazno tienen la particularidad de madurar antes que los del sur, lo que los posiciona como una alternativa interesante para bodegas que buscan adelantar la cosecha y evitar las lluvias de otoño que pueden dañar la fruta.</p>`,
  },

  logistics: {
    description:
      'Durazno es accesible por Ruta 5 desde nuestra base en Tala. Atendemos todo el departamento con visitas técnicas programadas.',
    deliveryNotes:
      'Envío de materiales a Durazno capital y Sarandí del Yí en 48–72 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Durazno',
    recommendations: [
      {
        iconName: 'CloudRain',
        title: 'Riego suplementario de praderas',
        description:
          'Sistemas de aspersión para pasturas en rotación: un riego suplementario oportuno en enero puede mantener la producción de pasto y evitar la compra de ración suplementaria, con un retorno inmediato.',
      },
      {
        iconName: 'Sun',
        title: 'Bombeo solar para ganadería',
        description:
          'Sistemas solares para pozos en potreros alejados. Inversión que se amortiza en 2–3 años frente al costo de llevar agua con tractor y tanque, o de tender línea eléctrica a zonas remotas.',
      },
      {
        iconName: 'Gauge',
        title: 'Sistema central para establecimientos mixtos',
        description:
          'Diseño de un sistema de bombeo central que abastezca tambo, bebederos y riego de pradera desde una misma fuente. La integración de usos maximiza el retorno de la inversión hidráulica del establecimiento.',
      },
    ],
  },

  nearbyDepartments: ['florida', 'flores', 'tacuarembo', 'cerro-largo', 'treinta-y-tres'],
  geoCoordinates: { latitude: -33.3833, longitude: -56.5167 },
};

const cerroLargo: Department = {
  slug: 'cerro-largo',
  name: 'Cerro Largo',
  tier: 4,
  published: true,
  capital: 'Melo',
  metaTitle: 'Riego y Bombeo en Cerro Largo | La Aldea',
  metaDescription:
    'Riego para arroz y bombeo ganadero en Cerro Largo. Soluciones técnicas para productores de frontera con Brasil. Presupuesto sin cargo.',
  keywords: [
    'riego Cerro Largo Uruguay',
    'bombeo Cerro Largo',
    'riego arroz Cerro Largo',
    'bomba de agua Melo',
    'bombeo ganadero Cerro Largo',
    'bombas acero inoxidable Cerro Largo',
  ],
  heroSubtitle: 'Riego y bombeo para los productores de frontera de Cerro Largo.',
  introText: `<p>Cerro Largo es un departamento de frontera con Brasil que combina ganadería extensiva sobre campo natural, producción arrocera en la zona este (Río Branco, Aceguá) y una agricultura diversificada en la cuenca del río Yaguarón. Los productores de Melo, Río Branco y Fraile Muerto operan en condiciones donde la confiabilidad del equipamiento es prioritaria — el servicio técnico más cercano está a varias horas de distancia.</p>
<p>La producción arrocera del departamento demanda bombeo de alto caudal durante toda la temporada de inundación. La ganadería extensiva — especialmente en la zona de sierras del norte — necesita puntos de agua distribuidos en grandes superficies, donde el bombeo solar es la solución estándar para establecimientos sin red eléctrica.</p>
<p>Una particularidad de la zona: el agua puede tener alto contenido de minerales en algunos acuíferos del departamento. Esto condiciona la selección de materiales — bombas con componentes de acero inoxidable y filtración adecuada son la recomendación técnica estándar.</p>`,

  agriculturalFocus: {
    title: 'Ganadería extensiva y arroz de frontera',
    crops: [
      'Arroz (zona este: Río Branco, Aceguá)',
      'Ganadería de carne (vacunos)',
      'Ganadería ovina',
      'Pasturas naturales de buena calidad',
      'Soja en rotación',
    ],
    description: `<p>Cerro Largo combina la producción arrocera del este — aprovechando la cuenca del río Yaguarón y las lagunas de la zona — con la ganadería extensiva del centro y norte del departamento. Los productores fronterizos tienen acceso binacional a insumos, pero las soluciones de bombeo e irrigación deben cumplir con las especificaciones técnicas y eléctricas del Uruguay (220V/50Hz).</p>
<p>La ganadería ovina tiene presencia importante en Cerro Largo, con productores que buscan mejorar los índices de señalada con mejor disponibilidad de agua para las ovejas en época de parición.</p>`,
  },

  logistics: {
    description:
      'Atendemos Cerro Largo con visitas técnicas programadas para proyectos de mediana y gran escala.',
    deliveryNotes:
      'Envío de materiales a Melo y Río Branco en 72–96 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Cerro Largo',
    recommendations: [
      {
        iconName: 'Gauge',
        title: 'Estaciones de bombeo para arrozales',
        description:
          'Diseño de estaciones de bombeo para inundación de chacras: selección de bomba por curva de rendimiento real, tablero con protección eléctrica calibrada a la red rural, y cañería de impulsión con material resistente.',
      },
      {
        iconName: 'Sun',
        title: 'Bombeo solar para ganadería extensiva',
        description:
          'Sistemas solares autónomos para establecimientos ganaderos sin red eléctrica. Dimensionados según cantidad de cabezas, profundidad del pozo y distancia al punto de distribución.',
      },
      {
        iconName: 'Shield',
        title: 'Materiales resistentes a agua con mineral',
        description:
          'En acuíferos con alto contenido de hierro o dureza total, seleccionamos bombas con componentes de acero inoxidable y filtración adecuada. La selección incorrecta de materiales puede costar el equipo entero en una zafra.',
      },
    ],
  },

  nearbyDepartments: ['treinta-y-tres', 'durazno', 'tacuarembo', 'rivera'],
  geoCoordinates: { latitude: -32.3667, longitude: -54.1667 },
};

const flores: Department = {
  slug: 'flores',
  name: 'Flores',
  tier: 4,
  published: true,
  capital: 'Trinidad',
  metaTitle: 'Riego y Bombeo en Flores | La Aldea',
  metaDescription:
    'Riego y bombeo para ganadería, lechería y agricultura en Flores. Soluciones hídricas para establecimientos rurales mixtos. Presupuesto sin cargo.',
  keywords: [
    'riego Flores Uruguay',
    'bombeo Flores',
    'bomba de agua Trinidad',
    'riego ganadero Flores',
    'bombeo solar Flores',
    'riego lechería Flores',
  ],
  heroSubtitle: 'Soluciones de agua para la producción mixta de Flores.',
  introText: `<p>Flores es el departamento más pequeño del Uruguay en superficie, pero con una producción agropecuaria por hectárea que se encuentra entre las más eficientes del país. Trinidad, su capital sobre Ruta 3, es un nudo logístico que facilita el acceso a insumos y servicios técnicos para productores de toda la región.</p>
<p>Los establecimientos de Flores se caracterizan por la producción mixta: ganadería de carne y lechería combinadas con cultivos de verano en los mejores suelos de la cuenca del río Yí. Esta diversificación productiva requiere sistemas de agua que sirvan para múltiples usos — bebederos, tambo, riego de pradera y cultivos — desde una misma fuente bien dimensionada.</p>
<p>Flores comparte la cuenca lechera del suroeste con San José, Colonia y Soriano, con un programa de desarrollo de quesería artesanal activo que agrega valor a la producción de tamberos familiares.</p>`,

  agriculturalFocus: {
    title: 'Producción mixta ganadero-agrícola y lechería familiar',
    crops: [
      'Ganadería de carne (vacunos)',
      'Lechería (tambos familiares)',
      'Soja y Maíz',
      'Pasturas mejoradas',
      'Verdeos de invierno',
      'Quesería artesanal',
    ],
    description: `<p>Flores tiene una producción agropecuaria diversificada sobre suelos de buena calidad. La ganadería de carne y la lechería son las actividades principales — INALE tiene activo un programa de quesería artesanal en el departamento que busca agregar valor a la producción lechera familiar. Los cultivos de verano (soja, maíz) completan la rotación en los mejores suelos.</p>
<p>Los establecimientos mixtos de Flores necesitan agua para múltiples usos en simultáneo: bebederos para ganado, agua para el tambo y riego de praderas en verano. El diseño integral del sistema hídrico del establecimiento — fuente única, red de distribución bien calculada — es la inversión que más impacto tiene por peso gastado.</p>`,
  },

  logistics: {
    description:
      'Flores es accesible por Ruta 3 desde nuestra base. Atendemos todo el departamento con visitas técnicas programadas.',
    deliveryNotes:
      'Envío de materiales a Trinidad en 48–72 horas.',
  },

  technicalAdvice: {
    title: 'Recomendaciones para productores de Flores',
    recommendations: [
      {
        iconName: 'CloudRain',
        title: 'Riego de pradera para producción mixta',
        description:
          'Sistemas de aspersión dimensionados para regar pradera y verdeos en rotación con cultivos de verano. Un sistema que sirva para ambas actividades productivas maximiza el retorno de la inversión.',
      },
      {
        iconName: 'Gauge',
        title: 'Sistema central de bombeo para tambo y campo',
        description:
          'Diseño de un sistema de bombeo central que abastezca el tambo, los bebederos y el riego de pradera desde una misma fuente. La integración de usos es la clave en establecimientos de escala familiar.',
      },
      {
        iconName: 'Leaf',
        title: 'Bebederos para rodeo de cría con ternero',
        description:
          'Redes con bebederos automáticos dimensionados para vacas con ternero al pie, que consumen significativamente más agua que el ganado seco. El acceso fácil al agua mejora la condición corporal y los índices reproductivos.',
      },
    ],
  },

  nearbyDepartments: ['san-jose', 'florida', 'durazno', 'soriano', 'colonia'],
  geoCoordinates: { latitude: -33.5167, longitude: -56.8833 },
};

// ─────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────

export const DEPARTMENTS: Department[] = [
  // Tier 1
  canelones,
  florida,
  sanJose,
  montevideo,
  // Tier 2
  colonia,
  soriano,
  rioNegro,
  paysandu,
  // Tier 3
  maldonado,
  lavalleja,
  rocha,
  treintaYTres,
  // Tier 4
  salto,
  artigas,
  rivera,
  tacuarembo,
  durazno,
  cerroLargo,
  flores,
];

/** Published departments only — for sitemap, footer links, etc. */
export const PUBLISHED_DEPARTMENTS = DEPARTMENTS.filter((d) => d.published);

/** Find a department by slug */
export function getDepartmentBySlug(slug: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.slug === slug);
}

/** Departments grouped by tier — for display on main services page */
export function getDepartmentsByTier() {
  return {
    tier1: DEPARTMENTS.filter((d) => d.tier === 1 && d.published),
    tier2: DEPARTMENTS.filter((d) => d.tier === 2 && d.published),
    tier3: DEPARTMENTS.filter((d) => d.tier === 3 && d.published),
    tier4: DEPARTMENTS.filter((d) => d.tier === 4 && d.published),
  };
}