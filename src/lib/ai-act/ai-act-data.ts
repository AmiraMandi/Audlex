/**
 * EU AI Act (Regulation (EU) 2024/1689) — Structured data for the Explorer.
 * Source: Official Journal of the European Union, 12 July 2024.
 */

export type RiskTag = "prohibited" | "high" | "limited" | "minimal" | "gpai" | "general";

export interface ArticleEntry {
  number: string;          // "Art. 5", "Art. 6(1)"
  title: { es: string; en: string };
  summary: { es: string; en: string };
  riskTags: RiskTag[];
  deadline?: string;       // ISO date or descriptive
  chapter: string;         // chapter id ref
}

export interface ChapterEntry {
  id: string;
  number: string;          // "I", "II", etc.
  title: { es: string; en: string };
  articles: ArticleEntry[];
}

export interface DefinitionEntry {
  term: { es: string; en: string };
  definition: { es: string; en: string };
  articleRef: string;
}

export const definitions: DefinitionEntry[] = [
  {
    term: { es: "Sistema de inteligencia artificial", en: "Artificial intelligence system" },
    definition: {
      es: "Un sistema basado en máquina diseñado para funcionar con distintos niveles de autonomía, que puede mostrar capacidad de adaptación tras su despliegue y que, para objetivos explícitos o implícitos, infiere, a partir de los datos que recibe, cómo generar resultados como predicciones, contenidos, recomendaciones o decisiones que pueden influir en entornos físicos o virtuales.",
      en: "A machine-based system designed to operate with varying levels of autonomy, that may exhibit adaptiveness after deployment and that, for explicit or implicit objectives, infers from the input it receives how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.",
    },
    articleRef: "Art. 3(1)",
  },
  {
    term: { es: "Proveedor", en: "Provider" },
    definition: {
      es: "Persona física o jurídica que desarrolla o manda desarrollar un sistema o modelo de IA de propósito general y lo introduce en el mercado o pone en servicio bajo su propio nombre o marca.",
      en: "A natural or legal person that develops or has developed an AI system or a general-purpose AI model and places it on the market or puts it into service under its own name or trademark.",
    },
    articleRef: "Art. 3(3)",
  },
  {
    term: { es: "Responsable del despliegue (Deployer)", en: "Deployer" },
    definition: {
      es: "Persona física o jurídica que utiliza un sistema de IA bajo su autoridad, salvo cuando su uso se enmarca en una actividad personal no profesional.",
      en: "A natural or legal person that uses an AI system under its authority except where the AI system is used in the course of a personal non-professional activity.",
    },
    articleRef: "Art. 3(4)",
  },
  {
    term: { es: "Modelo de IA de propósito general (GPAI)", en: "General-purpose AI model (GPAI)" },
    definition: {
      es: "Modelo de IA, incluido cuando se entrena con una gran cantidad de datos mediante autosupervisión a escala, que presenta una generalidad significativa y es capaz de realizar de manera competente una amplia gama de tareas distintas.",
      en: "An AI model, including where trained with a large amount of data using self-supervision at scale, that displays significant generality and is capable of competently performing a wide range of distinct tasks.",
    },
    articleRef: "Art. 3(63)",
  },
  {
    term: { es: "Sistema de alto riesgo", en: "High-risk AI system" },
    definition: {
      es: "Sistema de IA que cumple las condiciones del Art. 6 — ya sea como componente de seguridad de productos del Anexo I o que entre en las categorías del Anexo III.",
      en: "An AI system meeting the conditions of Art. 6 — either as a safety component of products in Annex I or falling under the categories of Annex III.",
    },
    articleRef: "Art. 6",
  },
  {
    term: { es: "Riesgo sistémico", en: "Systemic risk" },
    definition: {
      es: "Riesgo específico de las capacidades de gran impacto de los modelos de IA de propósito general, que tiene un efecto significativo en el mercado de la Unión por su alcance o por efectos negativos reales o razonablemente previsibles en la salud pública, la seguridad, los derechos fundamentales o la sociedad.",
      en: "A risk specific to the high-impact capabilities of general-purpose AI models, having a significant effect on the Union market due to their reach, or due to actual or reasonably foreseeable negative effects on public health, safety, fundamental rights or society.",
    },
    articleRef: "Art. 3(65)",
  },
  {
    term: { es: "Evaluación de conformidad", en: "Conformity assessment" },
    definition: {
      es: "Proceso de verificar si se cumplen los requisitos del Capítulo III, Sección 2, relativos a un sistema de IA de alto riesgo.",
      en: "The process of verifying whether the requirements set out in Chapter III, Section 2, relating to a high-risk AI system have been fulfilled.",
    },
    articleRef: "Art. 3(20)",
  },
  {
    term: { es: "Supervisión humana", en: "Human oversight" },
    definition: {
      es: "Capacidad de las personas físicas para supervisar el funcionamiento del sistema de IA de alto riesgo y para poder decidir no utilizar el sistema, ignorar su resultado o revertir su decisión.",
      en: "The capability for natural persons to oversee the functioning of a high-risk AI system and to be able to decide not to use the system, to disregard its output, or to reverse its decision.",
    },
    articleRef: "Art. 14",
  },
  {
    term: { es: "Espacio controlado de pruebas (Sandbox)", en: "AI regulatory sandbox" },
    definition: {
      es: "Marco controlado establecido por una autoridad competente que ofrece a proveedores o posibles proveedores de sistemas de IA la posibilidad de desarrollar, entrenar, validar y probar un sistema de IA innovador con un plan específico.",
      en: "A controlled framework set up by a competent authority offering providers or prospective providers of AI systems the possibility to develop, train, validate and test an innovative AI system according to a specific plan.",
    },
    articleRef: "Art. 3(55)",
  },
  {
    term: { es: "Marcado CE", en: "CE marking" },
    definition: {
      es: "Marcado mediante el cual un proveedor indica que un sistema de IA de alto riesgo es conforme con los requisitos del Capítulo III, Sección 2.",
      en: "A marking by which a provider indicates that a high-risk AI system is in conformity with the requirements of Chapter III, Section 2.",
    },
    articleRef: "Art. 3(24)",
  },
];

export const chapters: ChapterEntry[] = [
  {
    id: "chapter-1",
    number: "I",
    title: {
      es: "Disposiciones generales",
      en: "General provisions",
    },
    articles: [
      {
        number: "Art. 1",
        title: { es: "Objeto", en: "Subject matter" },
        summary: {
          es: "Establece normas armonizadas para la introducción en el mercado, puesta en servicio y utilización de sistemas de IA en la Unión.",
          en: "Lays down harmonised rules for the placing on the market, putting into service and use of AI systems in the Union.",
        },
        riskTags: ["general"],
        chapter: "chapter-1",
      },
      {
        number: "Art. 2",
        title: { es: "Ámbito de aplicación", en: "Scope" },
        summary: {
          es: "Aplica a proveedores, responsables del despliegue, importadores y distribuidores que coloquen o utilicen sistemas de IA en la UE, independientemente de su lugar de establecimiento.",
          en: "Applies to providers, deployers, importers and distributors placing on the market or using AI systems in the EU, regardless of where they are established.",
        },
        riskTags: ["general"],
        chapter: "chapter-1",
      },
      {
        number: "Art. 3",
        title: { es: "Definiciones", en: "Definitions" },
        summary: {
          es: "Define 68 términos clave incluyendo 'sistema de IA', 'proveedor', 'responsable del despliegue', 'modelo de IA de propósito general', 'riesgo sistémico', y otros conceptos fundamentales.",
          en: "Defines 68 key terms including 'AI system', 'provider', 'deployer', 'general-purpose AI model', 'systemic risk', and other fundamental concepts.",
        },
        riskTags: ["general"],
        chapter: "chapter-1",
      },
      {
        number: "Art. 4",
        title: { es: "Alfabetización en materia de IA", en: "AI literacy" },
        summary: {
          es: "Los proveedores y responsables del despliegue tomarán medidas para garantizar un nivel suficiente de alfabetización en materia de IA de su personal y demás personas que trabajen con sistemas de IA.",
          en: "Providers and deployers shall take measures to ensure a sufficient level of AI literacy of their staff and other persons dealing with AI systems on their behalf.",
        },
        riskTags: ["general"],
        deadline: "2025-02-02",
        chapter: "chapter-1",
      },
    ],
  },
  {
    id: "chapter-2",
    number: "II",
    title: {
      es: "Prácticas de IA prohibidas",
      en: "Prohibited AI practices",
    },
    articles: [
      {
        number: "Art. 5",
        title: { es: "Prácticas de IA prohibidas", en: "Prohibited AI practices" },
        summary: {
          es: "Prohíbe: (a) manipulación subliminal, (b) explotación de vulnerabilidades, (c) scoring social por autoridades públicas, (d) evaluación de riesgo de delincuencia basada únicamente en perfilado, (e) creación de bases de datos de reconocimiento facial mediante scraping no dirigido, (f) inferencia de emociones en el trabajo y educación (salvo seguridad), (g) categorización biométrica para inferir datos sensibles, (h) identificación biométrica remota en tiempo real en espacios públicos (con excepciones).",
          en: "Prohibits: (a) subliminal manipulation, (b) exploitation of vulnerabilities, (c) social scoring by public authorities, (d) crime risk assessment based solely on profiling, (e) creation of facial recognition databases via untargeted scraping, (f) emotion inference in work and education (except for safety), (g) biometric categorisation to infer sensitive data, (h) real-time remote biometric identification in public spaces (with exceptions).",
        },
        riskTags: ["prohibited"],
        deadline: "2025-02-02",
        chapter: "chapter-2",
      },
    ],
  },
  {
    id: "chapter-3",
    number: "III",
    title: {
      es: "Sistemas de IA de alto riesgo",
      en: "High-risk AI systems",
    },
    articles: [
      {
        number: "Art. 6",
        title: { es: "Reglas de clasificación de sistemas de alto riesgo", en: "Classification rules for high-risk AI systems" },
        summary: {
          es: "Un sistema de IA es de alto riesgo si: (1) es un componente de seguridad de un producto del Anexo I, o (2) el propio sistema es un producto del Anexo I que requiere evaluación de conformidad por terceros, o (3) entra en alguna categoría del Anexo III.",
          en: "An AI system is high-risk if: (1) it is a safety component of a product listed in Annex I, or (2) the system itself is a product in Annex I requiring third-party conformity assessment, or (3) it falls under a category in Annex III.",
        },
        riskTags: ["high"],
        chapter: "chapter-3",
      },
      {
        number: "Art. 9",
        title: { es: "Sistema de gestión de riesgos", en: "Risk management system" },
        summary: {
          es: "Establece la obligación de implementar un sistema de gestión de riesgos continuo e iterativo a lo largo de todo el ciclo de vida del sistema de IA de alto riesgo, incluyendo identificación, análisis, estimación y evaluación de riesgos.",
          en: "Establishes the requirement to implement a continuous and iterative risk management system throughout the entire lifecycle of the high-risk AI system, including identification, analysis, estimation and evaluation of risks.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "chapter-3",
      },
      {
        number: "Art. 10",
        title: { es: "Datos y gobernanza de datos", en: "Data and data governance" },
        summary: {
          es: "Los conjuntos de datos de entrenamiento, validación y prueba estarán sujetos a prácticas de gobernanza de datos apropiadas: relevancia, representatividad, corrección de errores, evaluación de sesgos y medidas de mitigación.",
          en: "Training, validation and testing datasets shall be subject to appropriate data governance practices: relevance, representativeness, error correction, bias assessment and mitigation measures.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "chapter-3",
      },
      {
        number: "Art. 11",
        title: { es: "Documentación técnica", en: "Technical documentation" },
        summary: {
          es: "La documentación técnica se elaborará antes de la introducción en el mercado y se mantendrá actualizada. Contendrá la información indicada en el Anexo IV.",
          en: "Technical documentation shall be drawn up before placing on the market and kept up to date. It shall contain the information set out in Annex IV.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "chapter-3",
      },
      {
        number: "Art. 12",
        title: { es: "Registro de actividades", en: "Record-keeping" },
        summary: {
          es: "Los sistemas de IA de alto riesgo permitirán técnicamente el registro automático de eventos (logs) durante todo su período de funcionamiento.",
          en: "High-risk AI systems shall technically allow for the automatic recording of events (logs) over the lifetime of the system.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "chapter-3",
      },
      {
        number: "Art. 13",
        title: { es: "Transparencia y comunicación de información", en: "Transparency and provision of information to deployers" },
        summary: {
          es: "Los sistemas de IA de alto riesgo se diseñarán de modo que su funcionamiento sea suficientemente transparente para que los responsables del despliegue puedan interpretar los resultados y utilizarlos adecuadamente.",
          en: "High-risk AI systems shall be designed so that their operation is sufficiently transparent for deployers to interpret the system's output and use it appropriately.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "chapter-3",
      },
      {
        number: "Art. 14",
        title: { es: "Supervisión humana", en: "Human oversight" },
        summary: {
          es: "Los sistemas de IA de alto riesgo se diseñarán para poder ser supervisados eficazmente por personas físicas durante su período de utilización, incluyendo la capacidad de intervenir, ignorar resultados o detener el sistema.",
          en: "High-risk AI systems shall be designed to be effectively overseen by natural persons during their period of use, including the ability to intervene, disregard outputs or stop the system.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "chapter-3",
      },
      {
        number: "Art. 15",
        title: { es: "Precisión, robustez y ciberseguridad", en: "Accuracy, robustness and cybersecurity" },
        summary: {
          es: "Los sistemas de IA de alto riesgo se diseñarán para alcanzar niveles apropiados de precisión, robustez y ciberseguridad, y funcionarán de manera coherente en esos aspectos durante todo su ciclo de vida.",
          en: "High-risk AI systems shall be designed to achieve appropriate levels of accuracy, robustness and cybersecurity, and perform consistently in those respects throughout their lifecycle.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "chapter-3",
      },
      {
        number: "Art. 27",
        title: { es: "Evaluación de impacto en derechos fundamentales", en: "Fundamental rights impact assessment" },
        summary: {
          es: "Los responsables del despliegue que sean organismos de Derecho público o entidades privadas que presten servicios públicos realizarán una evaluación del impacto sobre los derechos fundamentales antes de poner en uso un sistema de alto riesgo.",
          en: "Deployers that are bodies governed by public law or private entities providing public services shall perform a fundamental rights impact assessment before putting a high-risk system into use.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "chapter-3",
      },
    ],
  },
  {
    id: "chapter-4",
    number: "IV",
    title: {
      es: "Obligaciones de transparencia para determinados sistemas de IA",
      en: "Transparency obligations for certain AI systems",
    },
    articles: [
      {
        number: "Art. 50",
        title: { es: "Obligaciones de transparencia", en: "Transparency obligations" },
        summary: {
          es: "Obligaciones para: (1) sistemas que interactúan con personas — informar que están interactuando con IA, (2) sistemas de reconocimiento de emociones o categorización biométrica — informar a los expuestos, (3) deepfakes — etiquetar el contenido como generado artificialmente, (4) contenido generado por IA publicado — marcado legible por máquina.",
          en: "Obligations for: (1) systems interacting with persons — inform they are interacting with AI, (2) emotion recognition or biometric categorisation systems — inform exposed persons, (3) deepfakes — label content as artificially generated, (4) published AI-generated content — machine-readable marking.",
        },
        riskTags: ["limited"],
        deadline: "2026-08-02",
        chapter: "chapter-4",
      },
    ],
  },
  {
    id: "chapter-5",
    number: "V",
    title: {
      es: "Modelos de IA de propósito general",
      en: "General-purpose AI models",
    },
    articles: [
      {
        number: "Art. 51",
        title: { es: "Clasificación de modelos GPAI con riesgo sistémico", en: "Classification of GPAI models as GPAI models with systemic risk" },
        summary: {
          es: "Un modelo GPAI se clasificará como de riesgo sistémico si: (a) tiene capacidades de gran impacto evaluadas mediante herramientas y metodologías técnicas adecuadas, o (b) la Comisión lo decide de oficio. Se presume alto impacto si la cantidad acumulada de cómputo usada para su entrenamiento supera 10^25 FLOPS.",
          en: "A GPAI model shall be classified as having systemic risk if: (a) it has high impact capabilities evaluated with appropriate technical tools, or (b) the Commission decides so. High impact is presumed if the cumulative compute used for training exceeds 10^25 FLOPS.",
        },
        riskTags: ["gpai"],
        deadline: "2025-08-02",
        chapter: "chapter-5",
      },
      {
        number: "Art. 52",
        title: { es: "Procedimiento de clasificación", en: "Procedure" },
        summary: {
          es: "Establece el procedimiento para que la Oficina de IA clasifique modelos GPAI como de riesgo sistémico y para que los proveedores notifiquen cuando su modelo alcance el umbral de 10^25 FLOPS.",
          en: "Establishes the procedure for the AI Office to classify GPAI models with systemic risk and for providers to notify when their model reaches the 10^25 FLOPS threshold.",
        },
        riskTags: ["gpai"],
        deadline: "2025-08-02",
        chapter: "chapter-5",
      },
      {
        number: "Art. 53",
        title: { es: "Obligaciones de todos los proveedores de modelos GPAI", en: "Obligations for providers of GPAI models" },
        summary: {
          es: "Todos los proveedores de modelos GPAI deberán: (a) elaborar y mantener documentación técnica del modelo, (b) proporcionar información a proveedores de sistemas de IA que integren el modelo, (c) establecer una política de cumplimiento de derechos de autor, (d) publicar un resumen suficientemente detallado del contenido de entrenamiento.",
          en: "All GPAI model providers shall: (a) draw up and maintain technical documentation of the model, (b) provide information to AI system providers integrating the model, (c) put in place a copyright compliance policy, (d) publish a sufficiently detailed summary of training content.",
        },
        riskTags: ["gpai"],
        deadline: "2025-08-02",
        chapter: "chapter-5",
      },
      {
        number: "Art. 54",
        title: { es: "Representantes autorizados de proveedores de modelos GPAI", en: "Authorised representatives of providers of GPAI models" },
        summary: {
          es: "Los proveedores de modelos GPAI establecidos fuera de la UE designarán un representante autorizado en la Unión antes de comercializar su modelo.",
          en: "GPAI model providers established outside the Union shall appoint an authorised representative in the Union before placing their model on the market.",
        },
        riskTags: ["gpai"],
        deadline: "2025-08-02",
        chapter: "chapter-5",
      },
      {
        number: "Art. 55",
        title: { es: "Obligaciones adicionales para modelos GPAI con riesgo sistémico", en: "Additional obligations for providers of GPAI models with systemic risk" },
        summary: {
          es: "Los proveedores de modelos GPAI con riesgo sistémico deberán además: (a) realizar evaluaciones de modelos con pruebas adversariales, (b) evaluar y mitigar posibles riesgos sistémicos, (c) llevar registro de incidentes graves y comunicarlos, (d) garantizar un nivel adecuado de protección de ciberseguridad.",
          en: "Providers of GPAI models with systemic risk shall additionally: (a) perform model evaluations with adversarial testing, (b) assess and mitigate possible systemic risks, (c) keep track of serious incidents and report them, (d) ensure adequate cybersecurity protection.",
        },
        riskTags: ["gpai"],
        deadline: "2025-08-02",
        chapter: "chapter-5",
      },
      {
        number: "Art. 56",
        title: { es: "Códigos de buenas prácticas", en: "Codes of practice" },
        summary: {
          es: "La Oficina de IA fomentará la elaboración de códigos de buenas prácticas a nivel de la Unión para facilitar la correcta aplicación de las obligaciones de los modelos GPAI, teniendo en cuenta enfoques internacionales.",
          en: "The AI Office shall encourage the drawing up of codes of practice at Union level to facilitate the proper application of GPAI model obligations, taking into account international approaches.",
        },
        riskTags: ["gpai"],
        deadline: "2025-08-02",
        chapter: "chapter-5",
      },
    ],
  },
  {
    id: "chapter-9",
    number: "IX",
    title: {
      es: "Códigos de conducta y directrices",
      en: "Codes of conduct and guidelines",
    },
    articles: [
      {
        number: "Art. 95",
        title: { es: "Códigos de conducta para sistemas de IA sin alto riesgo", en: "Codes of conduct for non-high-risk AI systems" },
        summary: {
          es: "Se fomenta la elaboración de códigos de conducta voluntarios para los sistemas de IA que no son de alto riesgo, incluyendo compromisos de sostenibilidad medioambiental, accesibilidad, diversidad y participación.",
          en: "Encourages the drawing up of voluntary codes of conduct for AI systems that are not high-risk, including commitments on environmental sustainability, accessibility, diversity and participation.",
        },
        riskTags: ["minimal"],
        chapter: "chapter-9",
      },
    ],
  },
  {
    id: "chapter-10",
    number: "X",
    title: {
      es: "Sanciones",
      en: "Penalties",
    },
    articles: [
      {
        number: "Art. 99",
        title: { es: "Sanciones", en: "Penalties" },
        summary: {
          es: "Tres niveles de multas: (1) Prácticas prohibidas — hasta 35M€ o 7% de facturación global. (2) Incumplimiento de sistemas de alto riesgo — hasta 15M€ o 3%. (3) Información incorrecta a autoridades — hasta 7,5M€ o 1,5%. Para PYMEs se aplica la cantidad menor. Las sanciones serán efectivas, proporcionadas y disuasorias.",
          en: "Three tiers of fines: (1) Prohibited practices — up to €35M or 7% of global turnover. (2) Non-compliance with high-risk requirements — up to €15M or 3%. (3) Incorrect information to authorities — up to €7.5M or 1.5%. For SMEs, the lower amount applies. Penalties shall be effective, proportionate and dissuasive.",
        },
        riskTags: ["general"],
        chapter: "chapter-10",
      },
    ],
  },
  {
    id: "chapter-timeline",
    number: "XIII",
    title: {
      es: "Plazos de aplicación",
      en: "Application timeline",
    },
    articles: [
      {
        number: "Art. 113",
        title: { es: "Entrada en vigor y aplicación", en: "Entry into force and application" },
        summary: {
          es: "Entrada en vigor: 1 agosto 2024. Aplicación escalonada: (1) Feb 2025 — prácticas prohibidas (Art. 5) y alfabetización IA (Art. 4). (2) Ago 2025 — modelos GPAI (Cap. V) y gobernanza. (3) Ago 2026 — sistemas de alto riesgo Anexo III, transparencia, obligaciones de deployers. (4) Ago 2027 — alto riesgo Anexo I (productos regulados).",
          en: "Entry into force: 1 August 2024. Phased application: (1) Feb 2025 — prohibited practices (Art. 5) and AI literacy (Art. 4). (2) Aug 2025 — GPAI models (Ch. V) and governance. (3) Aug 2026 — high-risk Annex III, transparency, deployer obligations. (4) Aug 2027 — high-risk Annex I (regulated products).",
        },
        riskTags: ["general"],
        chapter: "chapter-timeline",
      },
    ],
  },
  {
    id: "annex-3",
    number: "Anexo III",
    title: {
      es: "Áreas de alto riesgo",
      en: "High-risk areas",
    },
    articles: [
      {
        number: "Anexo III.1",
        title: { es: "Identificación biométrica y categorización de personas", en: "Biometric identification and categorisation of natural persons" },
        summary: {
          es: "Sistemas de IA destinados a la identificación biométrica remota (no en tiempo real), categorización biométrica por atributos sensibles, y reconocimiento de emociones.",
          en: "AI systems intended for remote biometric identification (not real-time), biometric categorisation using sensitive attributes, and emotion recognition.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "annex-3",
      },
      {
        number: "Anexo III.2",
        title: { es: "Gestión de infraestructuras críticas", en: "Management and operation of critical infrastructure" },
        summary: {
          es: "IA como componente de seguridad en gestión de tráfico vial, suministro de agua/gas/calefacción/electricidad, y tráfico digital.",
          en: "AI as a safety component in management of road traffic, water/gas/heating/electricity supply, and digital traffic.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "annex-3",
      },
      {
        number: "Anexo III.3",
        title: { es: "Educación y formación profesional", en: "Education and vocational training" },
        summary: {
          es: "IA para determinar acceso a instituciones educativas, evaluar estudiantes, evaluar el nivel educativo apropiado, y supervisar conducta prohibida en exámenes.",
          en: "AI for determining access to educational institutions, assessing students, evaluating appropriate educational level, and monitoring prohibited behaviour during examinations.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "annex-3",
      },
      {
        number: "Anexo III.4",
        title: { es: "Empleo, gestión de trabajadores y acceso al autoempleo", en: "Employment, workers management and access to self-employment" },
        summary: {
          es: "IA para: publicación de ofertas dirigidas, filtrado/evaluación de candidaturas, toma de decisiones sobre contratación/ascenso/despido, asignación de tareas basada en comportamiento/rasgos, y monitorización del rendimiento laboral.",
          en: "AI for: targeted job advertisement, screening/evaluating applications, making decisions on hiring/promotion/termination, task allocation based on behaviour/traits, and monitoring work performance.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "annex-3",
      },
      {
        number: "Anexo III.5",
        title: { es: "Acceso a servicios públicos y privados esenciales", en: "Access to essential public and private services" },
        summary: {
          es: "IA para: evaluar elegibilidad para prestaciones públicas, scoring crediticio, evaluación de riesgo en seguros (vida/salud), priorización en servicios de emergencia.",
          en: "AI for: evaluating eligibility for public benefits, credit scoring, risk assessment in insurance (life/health), prioritisation in emergency services.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "annex-3",
      },
      {
        number: "Anexo III.6",
        title: { es: "Aplicación de la ley", en: "Law enforcement" },
        summary: {
          es: "IA para: evaluación de riesgo de reincidencia, polígrafos, evaluación de pruebas, perfilado de personas sospechosas, y análisis de delitos.",
          en: "AI for: recidivism risk assessment, polygraphs, evidence assessment, profiling of suspects, and crime analytics.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "annex-3",
      },
      {
        number: "Anexo III.7",
        title: { es: "Migración, asilo y control de fronteras", en: "Migration, asylum and border control management" },
        summary: {
          es: "IA para: evaluación de riesgo de seguridad, examen de solicitudes de asilo/visado, detección/reconocimiento/identificación de personas, y evaluación de autenticidad de documentos.",
          en: "AI for: security risk assessment, examination of asylum/visa applications, detection/recognition/identification of persons, and document authenticity assessment.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "annex-3",
      },
      {
        number: "Anexo III.8",
        title: { es: "Administración de justicia y procesos democráticos", en: "Administration of justice and democratic processes" },
        summary: {
          es: "IA para asistir a autoridades judiciales en la investigación e interpretación de hechos y la aplicación del derecho, y sistemas que puedan influir en resultados electorales.",
          en: "AI to assist judicial authorities in researching and interpreting facts and the law, and systems that may influence election outcomes.",
        },
        riskTags: ["high"],
        deadline: "2026-08-02",
        chapter: "annex-3",
      },
    ],
  },
];
