/**
 * ============================================================
 * Audlex — Bilingual content for the AI Act Risk Classifier
 * ============================================================
 * 
 * Contains all translatable strings for classifier.ts
 * in Spanish (es) and English (en).
 */

export type Locale = "es" | "en";

// ============================================================
// QUESTION TEXT
// ============================================================

export const questionText: Record<string, Record<Locale, string>> = {
  system_type: {
    es: "¿Qué tipo de sistema de IA es?",
    en: "What type of AI system is it?",
  },
  sector: {
    es: "¿En qué sector se utiliza este sistema?",
    en: "In which sector is this system used?",
  },
  subliminal_manipulation: {
    es: "¿El sistema utiliza técnicas subliminales o manipuladoras que puedan causar daño físico o psicológico?",
    en: "Does the system use subliminal or manipulative techniques that could cause physical or psychological harm?",
  },
  vulnerability_exploitation: {
    es: "¿El sistema explota vulnerabilidades de personas por su edad, discapacidad o situación socioeconómica?",
    en: "Does the system exploit vulnerabilities of people due to their age, disability, or socioeconomic situation?",
  },
  social_scoring: {
    es: "¿El sistema clasifica o puntúa personas basándose en su comportamiento social o características personales, con consecuencias perjudiciales desproporcionadas?",
    en: "Does the system classify or score people based on their social behaviour or personal characteristics, with disproportionate detrimental consequences?",
  },
  realtime_biometric_public: {
    es: "¿El sistema utiliza identificación biométrica remota en tiempo real en espacios públicos?",
    en: "Does the system use real-time remote biometric identification in publicly accessible spaces?",
  },
  emotion_recognition_prohibited: {
    es: "¿El sistema infiere emociones de personas en el lugar de trabajo o en centros educativos?",
    en: "Does the system infer emotions of people in the workplace or educational institutions?",
  },
  facial_scraping: {
    es: "¿El sistema crea o amplía bases de datos de reconocimiento facial extrayendo imágenes de internet o CCTV sin consentimiento?",
    en: "Does the system create or expand facial recognition databases by scraping images from the internet or CCTV without consent?",
  },
  biometric_identification: {
    es: "¿El sistema realiza identificación o categorización biométrica de personas?",
    en: "Does the system perform biometric identification or categorisation of people?",
  },
  critical_infrastructure_safety: {
    es: "¿El sistema es un componente de seguridad de infraestructura crítica (agua, gas, electricidad, transporte)?",
    en: "Is the system a safety component of critical infrastructure (water, gas, electricity, transport)?",
  },
  education_access: {
    es: "¿El sistema determina el acceso, admisión o asignación de personas a instituciones educativas?",
    en: "Does the system determine access, admission, or assignment of people to educational institutions?",
  },
  employment_decisions: {
    es: "¿El sistema se usa para decisiones de contratación, selección, evaluación de rendimiento, ascensos o despidos?",
    en: "Is the system used for recruitment, selection, performance evaluation, promotion, or dismissal decisions?",
  },
  essential_services_access: {
    es: "¿El sistema determina el acceso a servicios esenciales (crédito, seguros, prestaciones sociales, servicios de emergencia)?",
    en: "Does the system determine access to essential services (credit, insurance, social benefits, emergency services)?",
  },
  law_enforcement_use: {
    es: "¿El sistema se usa en la aplicación de la ley (evaluación de riesgo, detección de delitos, investigación)?",
    en: "Is the system used in law enforcement (risk assessment, crime detection, investigation)?",
  },
  migration_asylum: {
    es: "¿El sistema se usa en contextos de migración, asilo o control de fronteras?",
    en: "Is the system used in migration, asylum, or border control contexts?",
  },
  justice_democratic: {
    es: "¿El sistema se usa en la administración de justicia o procesos democráticos?",
    en: "Is the system used in the administration of justice or democratic processes?",
  },
  processes_personal_data: {
    es: "¿El sistema procesa datos personales?",
    en: "Does the system process personal data?",
  },
  personal_data_types: {
    es: "¿Qué tipos de datos personales procesa?",
    en: "What types of personal data does it process?",
  },
  autonomous_decisions: {
    es: "¿El sistema toma decisiones que afectan significativamente a personas sin intervención humana?",
    en: "Does the system make decisions that significantly affect people without human intervention?",
  },
  number_affected: {
    es: "¿A cuántas personas afecta el sistema?",
    en: "How many people does the system affect?",
  },
  reversibility: {
    es: "Si el sistema comete un error, ¿las consecuencias son fácilmente reversibles?",
    en: "If the system makes an error, are the consequences easily reversible?",
  },
  interacts_with_humans: {
    es: "¿Las personas interactúan directamente con el sistema de IA (por ejemplo, chatbot, asistente virtual)?",
    en: "Do people interact directly with the AI system (e.g., chatbot, virtual assistant)?",
  },
  generates_content: {
    es: "¿El sistema genera o manipula contenido (texto, imágenes, audio, vídeo)?",
    en: "Does the system generate or manipulate content (text, images, audio, video)?",
  },
  generates_deepfakes: {
    es: "¿El sistema genera o manipula imágenes, audio o vídeo que parecen reales (deepfakes)?",
    en: "Does the system generate or manipulate images, audio, or video that appear real (deepfakes)?",
  },
};

// ============================================================
// HELP TEXT
// ============================================================

export const questionHelpText: Record<string, Record<Locale, string>> = {
  subliminal_manipulation: {
    es: "Ejemplo: técnicas de persuasión oculta que el usuario no puede detectar, diseñadas para alterar su comportamiento de forma perjudicial.",
    en: "Example: hidden persuasion techniques that the user cannot detect, designed to harmfully alter their behaviour.",
  },
  vulnerability_exploitation: {
    es: "Ejemplo: un sistema que dirige publicidad engañosa específicamente a personas mayores o con discapacidad cognitiva.",
    en: "Example: a system that targets misleading advertising specifically at elderly people or those with cognitive disabilities.",
  },
  social_scoring: {
    es: "Ejemplo: un sistema de 'scoring social' que afecte al acceso a servicios basándose en comportamiento en redes sociales.",
    en: "Example: a 'social scoring' system that affects access to services based on social media behaviour.",
  },
  realtime_biometric_public: {
    es: "Ejemplo: reconocimiento facial en vivo en calles o centros comerciales. (Hay excepciones muy limitadas para fuerzas de seguridad.)",
    en: "Example: live facial recognition on streets or shopping centres. (There are very limited exceptions for law enforcement.)",
  },
  emotion_recognition_prohibited: {
    es: "Ejemplo: cámaras que analizan expresiones faciales de empleados o estudiantes para medir su 'nivel de atención'.",
    en: "Example: cameras that analyse facial expressions of employees or students to measure their 'attention level'.",
  },
  biometric_identification: {
    es: "Incluye: reconocimiento facial, de voz, de huella, categorización por raza, género, etc.",
    en: "Includes: facial recognition, voice recognition, fingerprint, categorisation by race, gender, etc.",
  },
  education_access: {
    es: "Ejemplo: sistema que filtra candidatos para becas, asigna estudiantes a grupos, o evalúa exámenes.",
    en: "Example: system that filters scholarship candidates, assigns students to groups, or evaluates exams.",
  },
  employment_decisions: {
    es: "Ejemplo: filtrado automático de CVs, scoring de candidatos, evaluación periódica de rendimiento con IA.",
    en: "Example: automatic CV filtering, candidate scoring, periodic AI-based performance evaluation.",
  },
  essential_services_access: {
    es: "Ejemplo: scoring crediticio con IA, evaluación automática de solicitudes de seguros, priorización de servicios de emergencia.",
    en: "Example: AI credit scoring, automatic insurance application evaluation, emergency services prioritisation.",
  },
  justice_democratic: {
    es: "Ejemplo: asistencia a jueces en sentencias, análisis de jurisprudencia con influencia en resoluciones, o influencia en procesos electorales.",
    en: "Example: assisting judges in sentencing, case law analysis influencing rulings, or influencing electoral processes.",
  },
  autonomous_decisions: {
    es: "Ejemplo: rechazar automáticamente una solicitud de crédito, denegar un servicio, o asignar una calificación sin revisión humana.",
    en: "Example: automatically rejecting a credit application, denying a service, or assigning a grade without human review.",
  },
  reversibility: {
    es: "Ejemplo: un chatbot que da información incorrecta es reversible. Un sistema que deniega un crédito automáticamente tiene consecuencias más difíciles de revertir.",
    en: "Example: a chatbot giving incorrect information is reversible. A system that automatically denies credit has consequences that are harder to reverse.",
  },
};

// ============================================================
// OPTION LABELS
// ============================================================

export const optionLabels: Record<string, Record<string, Record<Locale, string>>> = {
  system_type: {
    chatbot: { es: "Chatbot / Asistente conversacional", en: "Chatbot / Conversational assistant" },
    content_generation: { es: "Generación de contenido (texto, imagen, audio, vídeo)", en: "Content generation (text, image, audio, video)" },
    decision_support: { es: "Sistema de apoyo a la decisión", en: "Decision support system" },
    autonomous_decision: { es: "Sistema de decisión autónoma (sin intervención humana)", en: "Autonomous decision system (no human intervention)" },
    biometric: { es: "Sistema biométrico (reconocimiento facial, voz, etc.)", en: "Biometric system (facial recognition, voice, etc.)" },
    scoring_profiling: { es: "Scoring / Perfilado de personas", en: "Scoring / People profiling" },
    monitoring: { es: "Monitorización / Vigilancia", en: "Monitoring / Surveillance" },
    recommendation: { es: "Sistema de recomendación", en: "Recommendation system" },
    predictive_analytics: { es: "Analítica predictiva", en: "Predictive analytics" },
    automation: { es: "Automatización de procesos (RPA con IA)", en: "Process automation (RPA with AI)" },
    other: { es: "Otro", en: "Other" },
  },
  sector: {
    employment_hr: { es: "Empleo / Recursos Humanos", en: "Employment / Human Resources" },
    education: { es: "Educación y formación", en: "Education and training" },
    healthcare: { es: "Sanidad / Salud", en: "Healthcare / Health" },
    finance_insurance: { es: "Finanzas / Seguros / Banca", en: "Finance / Insurance / Banking" },
    law_enforcement: { es: "Aplicación de la ley / Seguridad", en: "Law enforcement / Security" },
    justice: { es: "Administración de justicia", en: "Administration of justice" },
    migration: { es: "Migración / Asilo / Control de fronteras", en: "Migration / Asylum / Border control" },
    critical_infrastructure: { es: "Infraestructura crítica (agua, gas, electricidad, transporte)", en: "Critical infrastructure (water, gas, electricity, transport)" },
    public_services: { es: "Servicios públicos esenciales", en: "Essential public services" },
    marketing: { es: "Marketing / Publicidad", en: "Marketing / Advertising" },
    customer_service: { es: "Atención al cliente", en: "Customer service" },
    retail: { es: "Comercio minorista", en: "Retail" },
    manufacturing: { es: "Fabricación / Industria", en: "Manufacturing / Industry" },
    technology: { es: "Tecnología / Software", en: "Technology / Software" },
    other: { es: "Otro sector", en: "Other sector" },
  },
  personal_data_types: {
    basic_identity: { es: "Datos básicos (nombre, email, teléfono)", en: "Basic data (name, email, phone)" },
    financial: { es: "Datos financieros", en: "Financial data" },
    health: { es: "Datos de salud", en: "Health data" },
    biometric: { es: "Datos biométricos", en: "Biometric data" },
    genetic: { es: "Datos genéticos", en: "Genetic data" },
    racial_ethnic: { es: "Origen racial o étnico", en: "Racial or ethnic origin" },
    political: { es: "Opiniones políticas", en: "Political opinions" },
    religious: { es: "Creencias religiosas", en: "Religious beliefs" },
    sexual_orientation: { es: "Orientación sexual", en: "Sexual orientation" },
    criminal: { es: "Datos penales", en: "Criminal records data" },
    location: { es: "Datos de localización", en: "Location data" },
    behavioral: { es: "Datos de comportamiento", en: "Behavioural data" },
    minors: { es: "Datos de menores de edad", en: "Data of minors" },
  },
  number_affected: {
    few: { es: "Menos de 100 personas", en: "Fewer than 100 people" },
    moderate: { es: "100 - 1.000 personas", en: "100 - 1,000 people" },
    large: { es: "1.000 - 10.000 personas", en: "1,000 - 10,000 people" },
    very_large: { es: "Más de 10.000 personas", en: "More than 10,000 people" },
  },
  reversibility: {
    easily_reversible: { es: "Fácilmente reversibles", en: "Easily reversible" },
    reversible_with_effort: { es: "Reversibles con esfuerzo", en: "Reversible with effort" },
    difficult_to_reverse: { es: "Difíciles de revertir", en: "Difficult to reverse" },
    irreversible: { es: "Irreversibles o muy graves", en: "Irreversible or very serious" },
  },
};

// ============================================================
// PROHIBITION REASONS
// ============================================================

export const prohibitionReasons: Record<string, Record<Locale, string>> = {
  subliminal_manipulation: {
    es: "Uso de técnicas subliminales o manipuladoras que causan daño (Art. 5.1.a)",
    en: "Use of subliminal or manipulative techniques causing harm (Art. 5.1.a)",
  },
  vulnerability_exploitation: {
    es: "Explotación de vulnerabilidades por edad, discapacidad o situación socioeconómica (Art. 5.1.b)",
    en: "Exploitation of vulnerabilities due to age, disability, or socioeconomic situation (Art. 5.1.b)",
  },
  social_scoring: {
    es: "Puntuación social con consecuencias perjudiciales desproporcionadas (Art. 5.1.c)",
    en: "Social scoring with disproportionate detrimental consequences (Art. 5.1.c)",
  },
  realtime_biometric_public: {
    es: "Identificación biométrica remota en tiempo real en espacios públicos (Art. 5.1.h)",
    en: "Real-time remote biometric identification in publicly accessible spaces (Art. 5.1.h)",
  },
  emotion_recognition_prohibited: {
    es: "Reconocimiento de emociones en el lugar de trabajo o centros educativos (Art. 5.1.f)",
    en: "Emotion recognition in the workplace or educational institutions (Art. 5.1.f)",
  },
  facial_scraping: {
    es: "Creación de BBDD de reconocimiento facial sin consentimiento (Art. 5.1.e)",
    en: "Creation of facial recognition databases without consent (Art. 5.1.e)",
  },
};

// ============================================================
// RESULT TEXTS (summaries, explanations)
// ============================================================

export const resultTexts = {
  unacceptable: {
    summary: {
      es: "Sistema PROHIBIDO por el EU AI Act",
      en: "PROHIBITED system under the EU AI Act",
    },
    detailedExplanation: {
      es: "Este sistema de IA ha sido clasificado como de riesgo inaceptable según el Artículo 5 del Reglamento (UE) 2024/1689. Las prácticas identificadas están expresamente prohibidas por la legislación europea desde el 2 de febrero de 2025. Su uso puede conllevar multas de hasta 35 millones de euros o el 7% de la facturación anual global.",
      en: "This AI system has been classified as unacceptable risk under Article 5 of Regulation (EU) 2024/1689. The identified practices have been expressly prohibited by European legislation since 2 February 2025. Its use may result in fines of up to €35 million or 7% of annual global turnover.",
    },
    recommendations: {
      es: [
        "ACCIÓN INMEDIATA: Este sistema debe ser retirado del servicio.",
        "Consulte con un abogado especialista en regulación de IA.",
        "Documente la retirada y las medidas correctivas adoptadas.",
        "Evalúe alternativas que cumplan con el Artículo 5 del AI Act.",
      ],
      en: [
        "IMMEDIATE ACTION: This system must be withdrawn from service.",
        "Consult with a lawyer specialising in AI regulation.",
        "Document the withdrawal and the corrective measures adopted.",
        "Evaluate alternatives that comply with Article 5 of the AI Act.",
      ],
    },
  },
  high: {
    summary: {
      es: "Sistema de ALTO RIESGO según el EU AI Act",
      en: "HIGH-RISK system under the EU AI Act",
    },
  },
  highByFactors: {
    summary: {
      es: "Sistema potencialmente de ALTO RIESGO por combinación de factores",
      en: "Potentially HIGH-RISK system due to combination of factors",
    },
    detailedExplanation: {
      es: "Este sistema no está explícitamente listado en el Anexo III del EU AI Act, pero la combinación de factores de riesgo identificados (decisiones autónomas sobre personas, procesamiento de datos sensibles, impacto difícilmente reversible) indica que debería tratarse como sistema de alto riesgo según los criterios del Artículo 6.2.",
      en: "This system is not explicitly listed in Annex III of the EU AI Act, but the combination of identified risk factors (autonomous decisions about people, sensitive data processing, difficult-to-reverse impact) indicates it should be treated as a high-risk system under the criteria of Article 6.2.",
    },
    recommendations: {
      es: [
        "Aunque no está explícitamente listado en el Anexo III, la combinación de factores (decisiones autónomas, datos sensibles, impacto a gran escala) sugiere tratamiento como alto riesgo.",
        "Recomendamos aplicar las obligaciones de alto riesgo como medida de precaución.",
        "Consulte con un especialista para confirmar la clasificación.",
      ],
      en: [
        "Although not explicitly listed in Annex III, the combination of factors (autonomous decisions, sensitive data, large-scale impact) suggests treatment as high risk.",
        "We recommend applying high-risk obligations as a precautionary measure.",
        "Consult with a specialist to confirm the classification.",
      ],
    },
  },
  limited: {
    summary: {
      es: "Sistema de RIESGO LIMITADO — Obligaciones de transparencia",
      en: "LIMITED RISK system — Transparency obligations",
    },
    detailedExplanation: (interactsWithHumans: boolean, generatesContent: boolean, generatesDeepfakes: boolean): Record<Locale, string> => ({
      es: `Este sistema de IA tiene obligaciones de transparencia según el Artículo 50 del EU AI Act. ${interactsWithHumans ? "Los usuarios deben ser informados de que interactúan con un sistema de IA. " : ""}${generatesContent ? "El contenido generado por IA debe estar marcado como tal (incluido marcado técnico C2PA). " : ""}${generatesDeepfakes ? "Los deepfakes deben estar claramente etiquetados como contenido generado artificialmente." : ""}`,
      en: `This AI system has transparency obligations under Article 50 of the EU AI Act. ${interactsWithHumans ? "Users must be informed that they are interacting with an AI system. " : ""}${generatesContent ? "AI-generated content must be marked as such (including C2PA technical marking). " : ""}${generatesDeepfakes ? "Deepfakes must be clearly labelled as artificially generated content." : ""}`,
    }),
  },
  minimal: {
    summary: {
      es: "Sistema de RIESGO MÍNIMO — Sin obligaciones específicas",
      en: "MINIMAL RISK system — No specific obligations",
    },
    detailedExplanation: {
      es: "Este sistema de IA no está sujeto a obligaciones específicas bajo el EU AI Act más allá del requisito general de alfabetización en IA (Artículo 4). Se recomienda adoptar voluntariamente buenas prácticas de transparencia y documentación.",
      en: "This AI system is not subject to specific obligations under the EU AI Act beyond the general AI literacy requirement (Article 4). Voluntary adoption of good transparency and documentation practices is recommended.",
    },
    recommendations: {
      es: [
        "Tu sistema no tiene obligaciones específicas bajo el AI Act, pero recomendamos adoptar buenas prácticas voluntarias.",
        "Cumple con la obligación de alfabetización en IA (Art. 4) para tu equipo.",
        "Documenta el uso de IA en tu organización como buena práctica.",
        "Revisa periódicamente si cambios en el sistema alteran su clasificación.",
      ],
      en: [
        "Your system has no specific obligations under the AI Act, but we recommend adopting voluntary best practices.",
        "Comply with the AI literacy obligation (Art. 4) for your team.",
        "Document AI usage in your organisation as a best practice.",
        "Periodically review whether changes to the system alter its classification.",
      ],
    },
  },
};

// ============================================================
// OBLIGATION TEXTS
// ============================================================

interface ObligationI18n {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  deadline: Record<Locale, string>;
}

export const obligationTexts: Record<string, ObligationI18n> = {
  prohibited_cessation: {
    title: { es: "Cesación inmediata", en: "Immediate cessation" },
    description: {
      es: "El sistema debe ser retirado del servicio de forma inmediata. Las prácticas prohibidas no admiten excepciones generales.",
      en: "The system must be withdrawn from service immediately. Prohibited practices do not admit general exceptions.",
    },
    deadline: { es: "Inmediato (en vigor desde 2 feb 2025)", en: "Immediate (in force since 2 Feb 2025)" },
  },
  art9_risk_management: {
    title: { es: "Sistema de Gestión de Riesgos", en: "Risk Management System" },
    description: {
      es: "Establecer, implementar, documentar y mantener un sistema de gestión de riesgos durante todo el ciclo de vida del sistema de IA. Debe incluir identificación, análisis, evaluación y tratamiento de riesgos.",
      en: "Establish, implement, document, and maintain a risk management system throughout the AI system's lifecycle. It must include risk identification, analysis, evaluation, and treatment.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art10_data_governance: {
    title: { es: "Gobernanza de Datos", en: "Data Governance" },
    description: {
      es: "Los conjuntos de datos de entrenamiento, validación y prueba deben cumplir criterios de calidad: ser relevantes, suficientemente representativos, y en la medida de lo posible, libres de errores y completos.",
      en: "Training, validation, and testing datasets must meet quality criteria: be relevant, sufficiently representative, and as far as possible, free from errors and complete.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art11_technical_doc: {
    title: { es: "Documentación Técnica", en: "Technical Documentation" },
    description: {
      es: "Elaborar documentación técnica completa ANTES de la comercialización o puesta en servicio. Debe demostrar cumplimiento de requisitos y proporcionar información suficiente para la evaluación.",
      en: "Prepare complete technical documentation BEFORE placing on the market or putting into service. It must demonstrate compliance with requirements and provide sufficient information for evaluation.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art12_logging: {
    title: { es: "Registro de Actividades (Logging)", en: "Activity Logging" },
    description: {
      es: "El sistema debe permitir el registro automático de eventos durante su funcionamiento, con trazabilidad de las acciones y decisiones del sistema.",
      en: "The system must allow automatic event logging during operation, with traceability of the system's actions and decisions.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art13_transparency: {
    title: { es: "Transparencia e Instrucciones de Uso", en: "Transparency and Instructions for Use" },
    description: {
      es: "Proporcionar instrucciones de uso claras y comprensibles al usuario que permitan interpretar los resultados del sistema y usarlo adecuadamente.",
      en: "Provide clear and comprehensible instructions for use that allow the user to interpret the system's results and use it appropriately.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art14_human_oversight: {
    title: { es: "Supervisión Humana", en: "Human Oversight" },
    description: {
      es: "El sistema debe diseñarse para permitir una supervisión humana efectiva, incluyendo la capacidad de comprender, monitorizar y, cuando sea necesario, anular o interrumpir el sistema.",
      en: "The system must be designed to allow effective human oversight, including the ability to understand, monitor, and where necessary, override or interrupt the system.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art15_accuracy: {
    title: { es: "Precisión, Robustez y Ciberseguridad", en: "Accuracy, Robustness, and Cybersecurity" },
    description: {
      es: "El sistema debe alcanzar niveles adecuados de precisión, robustez frente a errores y ataques, y ciberseguridad apropiada.",
      en: "The system must achieve appropriate levels of accuracy, robustness against errors and attacks, and appropriate cybersecurity.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art27_fria: {
    title: { es: "Evaluación de Impacto en Derechos Fundamentales", en: "Fundamental Rights Impact Assessment" },
    description: {
      es: "Los desplegadores de sistemas de alto riesgo deben realizar una evaluación del impacto en los derechos fundamentales antes de poner en uso el sistema.",
      en: "Deployers of high-risk systems must carry out a fundamental rights impact assessment before putting the system into use.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art47_conformity: {
    title: { es: "Declaración de Conformidad UE", en: "EU Declaration of Conformity" },
    description: {
      es: "Elaborar una declaración de conformidad UE por escrito para cada sistema de alto riesgo, y mantenerla a disposición de las autoridades durante 10 años.",
      en: "Draw up a written EU declaration of conformity for each high-risk system and keep it at the disposal of authorities for 10 years.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art49_registration: {
    title: { es: "Registro en Base de Datos de la UE", en: "Registration in the EU Database" },
    description: {
      es: "Los sistemas de IA de alto riesgo deben registrarse en la base de datos de la UE antes de su comercialización o puesta en servicio.",
      en: "High-risk AI systems must be registered in the EU database before being placed on the market or put into service.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art72_post_market: {
    title: { es: "Monitorización Post-Comercialización", en: "Post-Market Monitoring" },
    description: {
      es: "Establecer un sistema de monitorización posterior a la comercialización proporcional a la naturaleza y riesgo del sistema de IA.",
      en: "Establish a post-market monitoring system proportionate to the nature and risk of the AI system.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art4_literacy: {
    title: { es: "Alfabetización en IA", en: "AI Literacy" },
    description: {
      es: "Garantizar que el personal que opera y supervisa el sistema tiene un nivel suficiente de alfabetización en IA.",
      en: "Ensure that personnel operating and overseeing the system have a sufficient level of AI literacy.",
    },
    deadline: { es: "En vigor desde 2 feb 2025", en: "In force since 2 Feb 2025" },
  },
  art4_literacy_general: {
    title: { es: "Alfabetización en IA", en: "AI Literacy" },
    description: {
      es: "Obligación general: garantizar que el personal que opera sistemas de IA tiene un nivel adecuado de conocimiento sobre IA.",
      en: "General obligation: ensure that personnel operating AI systems have an adequate level of AI knowledge.",
    },
    deadline: { es: "En vigor desde 2 feb 2025", en: "In force since 2 Feb 2025" },
  },
  voluntary_code: {
    title: { es: "Código de Conducta Voluntario", en: "Voluntary Code of Conduct" },
    description: {
      es: "Se anima a los proveedores de sistemas de riesgo mínimo a adoptar voluntariamente códigos de conducta con requisitos similares a los de alto riesgo.",
      en: "Providers of minimal-risk systems are encouraged to voluntarily adopt codes of conduct with requirements similar to high-risk ones.",
    },
    deadline: { es: "Recomendado", en: "Recommended" },
  },
  // --- Limited risk obligations ---
  art50_1_interaction: {
    title: { es: "Notificación de Interacción con IA", en: "AI Interaction Notification" },
    description: {
      es: "Los usuarios deben ser informados de forma clara y oportuna de que están interactuando con un sistema de IA, salvo que sea evidente por las circunstancias.",
      en: "Users must be clearly and timely informed that they are interacting with an AI system, unless it is obvious from the circumstances.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art50_2_content: {
    title: { es: "Marcado de Contenido Generado por IA", en: "AI-Generated Content Marking" },
    description: {
      es: "El contenido generado por IA debe marcarse en formato legible por máquina (estándar C2PA o equivalente) para que sea detectable como generado artificialmente.",
      en: "AI-generated content must be marked in machine-readable format (C2PA standard or equivalent) so that it is detectable as artificially generated.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art50_4_deepfakes: {
    title: { es: "Etiquetado de Deepfakes", en: "Deepfake Labelling" },
    description: {
      es: "Contenido de imagen, audio o vídeo que constituya un deepfake debe etiquetarse de forma clara y visible como generado o manipulado artificialmente.",
      en: "Image, audio, or video content constituting a deepfake must be clearly and visually labelled as artificially generated or manipulated.",
    },
    deadline: { es: "2 de agosto de 2026", en: "2 August 2026" },
  },
  art4_literacy_limited: {
    title: { es: "Alfabetización en IA", en: "AI Literacy" },
    description: {
      es: "Garantizar que el personal relevante tiene un nivel suficiente de alfabetización en IA.",
      en: "Ensure that relevant personnel have a sufficient level of AI literacy.",
    },
    deadline: { es: "En vigor desde 2 feb 2025", en: "In force since 2 Feb 2025" },
  },
};

// ============================================================
// HIGH-RISK RECOMMENDATIONS
// ============================================================

export const highRiskRecommendations = {
  base: {
    es: [
      "PRIORIDAD: Comienza por la documentación técnica (Art. 11) y el sistema de gestión de riesgos (Art. 9).",
      "Designa un responsable interno de compliance del AI Act.",
      "Realiza la Evaluación de Impacto en Derechos Fundamentales (Art. 27) lo antes posible.",
    ],
    en: [
      "PRIORITY: Start with technical documentation (Art. 11) and the risk management system (Art. 9).",
      "Designate an internal AI Act compliance officer.",
      "Carry out the Fundamental Rights Impact Assessment (Art. 27) as soon as possible.",
    ],
  },
  employment: {
    es: "SECTOR EMPLEO: Informa a candidatos y empleados del uso de IA. Garantiza supervisión humana en todas las decisiones de RRHH.",
    en: "EMPLOYMENT SECTOR: Inform candidates and employees of the use of AI. Ensure human oversight in all HR decisions.",
  },
  essentialServices: {
    es: "SERVICIOS ESENCIALES: Implementa mecanismos de explicabilidad para las decisiones del sistema y canales de reclamación.",
    en: "ESSENTIAL SERVICES: Implement explainability mechanisms for system decisions and complaint channels.",
  },
  personalData: {
    es: "DATOS PERSONALES: Asegura cumplimiento simultáneo con el RGPD. Realiza una Evaluación de Impacto en Protección de Datos (EIPD).",
    en: "PERSONAL DATA: Ensure simultaneous GDPR compliance. Carry out a Data Protection Impact Assessment (DPIA).",
  },
  registration: {
    es: "Registra el sistema en la base de datos de la UE antes del 2 de agosto de 2026.",
    en: "Register the system in the EU database before 2 August 2026.",
  },
  sandbox: {
    es: "Considera participar en el sandbox regulatorio de España (AESIA) para validar tu enfoque de compliance.",
    en: "Consider participating in Spain's regulatory sandbox (AESIA) to validate your compliance approach.",
  },
};

// ============================================================
// LIMITED-RISK RECOMMENDATIONS
// ============================================================

export const limitedRiskRecommendations = {
  base: {
    es: "Implementa avisos claros de que el usuario interactúa con IA.",
    en: "Implement clear notices that the user is interacting with AI.",
  },
  contentMarking: {
    es: "Implementa el marcado técnico C2PA en todo contenido generado por IA.",
    en: "Implement C2PA technical marking on all AI-generated content.",
  },
  policyUpdate: {
    es: "Actualiza tu política de uso de IA para incluir las obligaciones de transparencia.",
    en: "Update your AI usage policy to include transparency obligations.",
  },
  training: {
    es: "Forma a tu equipo en las obligaciones de transparencia del AI Act.",
    en: "Train your team on the AI Act transparency obligations.",
  },
  documentation: {
    es: "Documenta los sistemas de IA que usas como buena práctica (Art. 4 — Alfabetización).",
    en: "Document the AI systems you use as a best practice (Art. 4 — Literacy).",
  },
};

// ============================================================
// HIGH-RISK EXPLANATION
// ============================================================

export const highRiskExplanation = {
  intro: {
    es: "Este sistema de IA ha sido clasificado como de ALTO RIESGO según el EU AI Act (Reglamento (UE) 2024/1689).",
    en: "This AI system has been classified as HIGH RISK under the EU AI Act (Regulation (EU) 2024/1689).",
  },
  areasTitle: {
    es: "Áreas de alto riesgo identificadas:",
    en: "Identified high-risk areas:",
  },
  areaMap: {
    "Anexo III.1": {
      es: "Identificación/categorización biométrica (Anexo III, punto 1)",
      en: "Biometric identification/categorisation (Annex III, point 1)",
    },
    "Anexo III.2": {
      es: "Componente de seguridad de infraestructura crítica (Anexo III, punto 2)",
      en: "Safety component of critical infrastructure (Annex III, point 2)",
    },
    "Anexo III.3": {
      es: "Acceso a educación y formación (Anexo III, punto 3)",
      en: "Access to education and training (Annex III, point 3)",
    },
    "Anexo III.4": {
      es: "Empleo, gestión de trabajadores y acceso al autoempleo (Anexo III, punto 4)",
      en: "Employment, worker management, and access to self-employment (Annex III, point 4)",
    },
    "Anexo III.5": {
      es: "Acceso a servicios esenciales (Anexo III, punto 5)",
      en: "Access to essential services (Annex III, point 5)",
    },
    "Anexo III.6": {
      es: "Aplicación de la ley (Anexo III, punto 6)",
      en: "Law enforcement (Annex III, point 6)",
    },
    "Anexo III.7": {
      es: "Migración, asilo y control de fronteras (Anexo III, punto 7)",
      en: "Migration, asylum, and border control (Annex III, point 7)",
    },
    "Anexo III.8": {
      es: "Administración de justicia y procesos democráticos (Anexo III, punto 8)",
      en: "Administration of justice and democratic processes (Annex III, point 8)",
    },
  } as Record<string, Record<Locale, string>>,
  obligationsSummary: {
    es: "Obligaciones principales: Sistema de gestión de riesgos, documentación técnica completa, gobernanza de datos, transparencia, supervisión humana, evaluación de impacto en derechos fundamentales, y registro en la base de datos de la UE.",
    en: "Main obligations: Risk management system, complete technical documentation, data governance, transparency, human oversight, fundamental rights impact assessment, and registration in the EU database.",
  },
  deadlineWarning: {
    es: "Fecha límite: 2 de agosto de 2026. Las multas por incumplimiento pueden alcanzar los 15 millones de euros o el 3% de la facturación anual global.",
    en: "Deadline: 2 August 2026. Fines for non-compliance can reach €15 million or 3% of annual global turnover.",
  },
};

// ============================================================
// MISC LABELS
// ============================================================

export const miscLabels = {
  unclassified: { es: "sin clasificar", en: "unclassified" },
};
