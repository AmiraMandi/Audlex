export type Locale = "es" | "en";

export const defaultLocale: Locale = "es";

export const locales: Locale[] = ["es", "en"];

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

// Landing page translations
export const translations: Record<Locale, Record<string, string>> = {
  es: {
    // Nav
    "nav.features": "Funcionalidades",
    "nav.pricing": "Precios",
    "nav.consultoras": "Consultoras",
    "nav.login": "Iniciar sesión",
    "nav.cta": "Empezar gratis",
    "nav.about": "Sobre nosotros",

    // Hero
    "hero.badge": "Quedan {days} días hasta el 2 de agosto de 2026",
    "hero.title1": "Tu empresa usa IA.",
    "hero.title2": "Europa la regula.",
    "hero.subtitle": "Clasifica tus sistemas de IA, genera toda la documentación necesaria y cumple con el EU AI Act en una tarde —no en meses.",
    "hero.cta": "Clasificar mi primer sistema gratis",
    "hero.secondary": "Ver cómo funciona",
    "hero.proof": "Basado en el Reglamento (UE) 2024/1689 y las 16 guías de AESIA",

    // Problem
    "problem.fines.title": "Multas de hasta 35M€",
    "problem.fines.desc": "O el 7% de tu facturación global. El AI Act no es voluntario.",
    "problem.deadline.title": "{days} días para cumplir",
    "problem.deadline.desc": "Las obligaciones para sistemas de alto riesgo entran en vigor el 2 de agosto de 2026.",
    "problem.affected.title": "Afecta a tu empresa",
    "problem.affected.desc": "Si usas chatbots, CRM con scoring, IA en RRHH o cualquier herramienta con IA — te aplica.",

    // Features
    "features.badge": "Automatizado con IA",
    "features.title": "De 0 a compliance en 4 pasos",
    "features.subtitle": "Sin consultores. Sin abogados. Sin perder semanas.",
    "features.step1.title": "Inventaría tus sistemas de IA",
    "features.step1.desc": "Nuestro asistente te guía: ¿Usas chatbot? ¿CRM con scoring? ¿IA en contratación? Detectamos sistemas que quizá no sabías que tenías.",
    "features.step2.title": "Clasificación automática de riesgo",
    "features.step2.desc": "Cuestionario adaptativo basado en el texto literal del reglamento. Clasificación inmediata: prohibido, alto, limitado o mínimo riesgo.",
    "features.step3.title": "Documentación generada al instante",
    "features.step3.desc": "Hasta 13 documentos: gestión de riesgos, ficha técnica, evaluación de impacto, declaración de conformidad... Auto-rellenados con tus datos.",
    "features.step4.title": "Dashboard y monitorización",
    "features.step4.desc": "Score global de compliance, checklist interactivo, alertas de plazos, y exportación en PDF/DOCX listo para inspección.",

    // Security
    "security.badge": "Seguridad y confianza",
    "security.title": "Tus datos, protegidos",
    "security.subtitle": "La seguridad no es un extra — es la base de todo lo que hacemos.",
    "security.encryption.title": "Cifrado extremo a extremo",
    "security.encryption.desc": "TLS 1.3 en tránsito y AES-256 en reposo. Tus datos siempre cifrados.",
    "security.servers.title": "Servidores en la UE",
    "security.servers.desc": "Infraestructura alojada en AWS eu-west-1 (Irlanda). Tus datos nunca salen de Europa.",
    "security.gdpr.title": "Cumplimiento RGPD",
    "security.gdpr.desc": "Totalmente conforme con el Reglamento General de Protección de Datos europeo.",
    "security.audit.title": "Audit log completo",
    "security.audit.desc": "Registro inmutable de cada acción. Trazabilidad total para inspecciones.",

    // Pricing
    "pricing.title": "Planes desde 0€",
    "pricing.subtitle": "Empieza gratis. Escala cuando lo necesites.",
    "pricing.popular": "Más popular",
    "pricing.free.name": "Gratis",
    "pricing.free.desc": "Para explorar",
    "pricing.starter.name": "Starter",
    "pricing.starter.desc": "Para autónomos y microempresas",
    "pricing.business.name": "Business",
    "pricing.business.desc": "Para PYMEs",
    "pricing.enterprise.name": "Enterprise",
    "pricing.enterprise.desc": "Para grandes empresas",

    // Consultoras
    "consultoras.badge": "Para consultoras",
    "consultoras.title": "Ofrece compliance del AI Act a tus clientes — sin equipo técnico",
    "consultoras.desc": "White-label completo: tu logo, tus colores, tu dominio. Gestiona 10, 50 o 100 clientes desde un solo panel. Cobra lo que quieras — nosotros nos encargamos de la plataforma.",
    "consultoras.cta": "Solicitar demo para consultoras",

    // CTA
    "cta.title1": "Quedan {days} días.",
    "cta.title2": "Empieza hoy.",
    "cta.subtitle": "Clasificar tu primer sistema de IA es gratis y tarda menos de 10 minutos.",
    "cta.button": "Clasificar mi primer sistema gratis",

    // FAQ
    "nav.faq": "FAQ",
    "faq.badge": "Preguntas frecuentes",
    "faq.title": "Todo lo que necesitas saber",
    "faq.subtitle": "Resolvemos las dudas más comunes sobre el EU AI Act y cómo Audlex te ayuda.",
    "faq.q1": "¿Qué es el EU AI Act (Reglamento Europeo de Inteligencia Artificial)?",
    "faq.a1": "Es el Reglamento (UE) 2024/1689 del Parlamento Europeo, la primera ley integral del mundo que regula la inteligencia artificial. Clasifica los sistemas de IA en 4 niveles de riesgo (inaceptable, alto, limitado, mínimo) e impone obligaciones de transparencia, documentación y supervisión humana a proveedores y deployers en la UE.",
    "faq.q2": "¿A quién le aplica el EU AI Act?",
    "faq.a2": "A cualquier organización que desarrolle, despliegue o utilice sistemas de IA en el mercado europeo — independientemente de dónde esté la sede. Si tu empresa usa un chatbot, CRM con scoring, IA en RRHH, herramientas de generación de contenido o analítica predictiva, te aplica.",
    "faq.q3": "¿Cuáles son las multas por incumplimiento?",
    "faq.a3": "Las sanciones son significativas: hasta 35 millones de euros o el 7% de la facturación global anual (la mayor de las dos) por prácticas prohibidas, 15M€ o 3% por incumplimiento de alto riesgo, y 7.5M€ o 1.5% por proporcionar información incorrecta.",
    "faq.q4": "¿Cómo me ayuda Audlex a cumplir?",
    "faq.a4": "Audlex automatiza el proceso completo: 1) Inventariamos tus sistemas de IA, 2) Clasificamos su nivel de riesgo según el reglamento, 3) Generamos toda la documentación obligatoria (hasta 13 documentos), 4) Te guiamos con un checklist interactivo y dashboard de compliance. Todo en una tarde.",
    "faq.q5": "¿Es diferente del ISO 42001?",
    "faq.a5": "Sí. ISO 42001 es un estándar voluntario de gestión de IA. El EU AI Act es una ley vinculante con sanciones. Son complementarios: ISO 42001 te ayuda a tener un sistema de gestión, pero el AI Act tiene requisitos específicos de clasificación, documentación técnica y registro obligatorio que ISO no cubre. Audlex se centra en los requisitos legales del AI Act.",
    "faq.q6": "¿Cuánto tiempo tengo para cumplir?",
    "faq.a6": "Las obligaciones para sistemas de alto riesgo entran en vigor el 2 de agosto de 2026. Sin embargo, las prácticas prohibidas ya están en vigor desde febrero de 2025, y los requisitos de transparencia para IA de propósito general desde agosto de 2025. Cuanto antes empieces, mejor.",

    // Testimonials
    "testimonials.badge": "Lo que dicen nuestros usuarios",
    "testimonials.title": "Empresas que ya cumplen con el AI Act",
    "testimonials.subtitle": "Más de 200 organizaciones usan Audlex para gestionar su compliance.",

    // Newsletter
    "newsletter.title": "Mantente al día con el AI Act",
    "newsletter.subtitle": "Recibe actualizaciones sobre cambios regulatorios, guías prácticas y novedades de Audlex.",
    "newsletter.placeholder": "tu@empresa.com",
    "newsletter.button": "Suscribirse",
    "newsletter.privacy": "Sin spam. Puedes darte de baja en cualquier momento.",

    // Industry
    "industry.badge": "Por industria",
    "industry.title": "Soluciones para tu sector",
    "industry.subtitle": "El AI Act afecta a todos los sectores, pero cada uno tiene sus particularidades.",

    // Footer
    "footer.disclaimer": "Herramienta informativa — no sustituye asesoramiento legal.",
    "footer.privacy": "Privacidad",
    "footer.terms": "Términos",
    "footer.cookies": "Cookies",
    "footer.blog": "Blog",
  },
  en: {
    // Nav
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.consultoras": "Consultants",
    "nav.login": "Sign in",
    "nav.cta": "Start free",
    "nav.about": "About us",

    // Hero
    "hero.badge": "{days} days left until August 2, 2026",
    "hero.title1": "Your company uses AI.",
    "hero.title2": "Europe regulates it.",
    "hero.subtitle": "Classify your AI systems, generate all required documentation and comply with the EU AI Act in an afternoon — not months.",
    "hero.cta": "Classify my first system for free",
    "hero.secondary": "See how it works",
    "hero.proof": "Based on Regulation (EU) 2024/1689 and the 16 AESIA guidelines",

    // Problem
    "problem.fines.title": "Fines up to €35M",
    "problem.fines.desc": "Or 7% of your global revenue. The AI Act is not voluntary.",
    "problem.deadline.title": "{days} days to comply",
    "problem.deadline.desc": "Obligations for high-risk systems take effect on August 2, 2026.",
    "problem.affected.title": "It affects your company",
    "problem.affected.desc": "If you use chatbots, CRM with scoring, AI in HR or any AI-powered tool — it applies to you.",

    // Features
    "features.badge": "AI-powered",
    "features.title": "From 0 to compliance in 4 steps",
    "features.subtitle": "No consultants. No lawyers. No wasted weeks.",
    "features.step1.title": "Inventory your AI systems",
    "features.step1.desc": "Our assistant guides you: Do you use chatbots? CRM with scoring? AI in hiring? We detect systems you might not know you had.",
    "features.step2.title": "Automatic risk classification",
    "features.step2.desc": "Adaptive questionnaire based on the regulation's literal text. Instant classification: prohibited, high, limited or minimal risk.",
    "features.step3.title": "Documentation generated instantly",
    "features.step3.desc": "Up to 13 documents: risk management, technical file, impact assessment, conformity declaration... Auto-filled with your data.",
    "features.step4.title": "Dashboard & monitoring",
    "features.step4.desc": "Global compliance score, interactive checklist, deadline alerts, and PDF/DOCX export ready for inspection.",

    // Security
    "security.badge": "Security & trust",
    "security.title": "Your data, protected",
    "security.subtitle": "Security is not an add-on — it's the foundation of everything we do.",
    "security.encryption.title": "End-to-end encryption",
    "security.encryption.desc": "TLS 1.3 in transit and AES-256 at rest. Your data always encrypted.",
    "security.servers.title": "EU-based servers",
    "security.servers.desc": "Infrastructure hosted on AWS eu-west-1 (Ireland). Your data never leaves Europe.",
    "security.gdpr.title": "GDPR compliant",
    "security.gdpr.desc": "Fully compliant with the European General Data Protection Regulation.",
    "security.audit.title": "Complete audit log",
    "security.audit.desc": "Immutable record of every action. Full traceability for inspections.",

    // Pricing
    "pricing.title": "Plans from €0",
    "pricing.subtitle": "Start free. Scale when you need it.",
    "pricing.popular": "Most popular",
    "pricing.free.name": "Free",
    "pricing.free.desc": "To explore",
    "pricing.starter.name": "Starter",
    "pricing.starter.desc": "For freelancers & micro-businesses",
    "pricing.business.name": "Business",
    "pricing.business.desc": "For SMEs",
    "pricing.enterprise.name": "Enterprise",
    "pricing.enterprise.desc": "For large companies",

    // Consultoras
    "consultoras.badge": "For consultants",
    "consultoras.title": "Offer AI Act compliance to your clients — without a tech team",
    "consultoras.desc": "Complete white-label: your logo, your colors, your domain. Manage 10, 50 or 100 clients from a single panel. Charge what you want — we handle the platform.",
    "consultoras.cta": "Request a demo for consultants",

    // CTA
    "cta.title1": "{days} days left.",
    "cta.title2": "Start today.",
    "cta.subtitle": "Classifying your first AI system is free and takes less than 10 minutes.",
    "cta.button": "Classify my first system for free",

    // FAQ
    "nav.faq": "FAQ",
    "faq.badge": "Frequently asked questions",
    "faq.title": "Everything you need to know",
    "faq.subtitle": "We answer the most common questions about the EU AI Act and how Audlex helps you.",
    "faq.q1": "What is the EU AI Act?",
    "faq.a1": "It's Regulation (EU) 2024/1689 of the European Parliament, the world's first comprehensive law regulating artificial intelligence. It classifies AI systems into 4 risk levels (unacceptable, high, limited, minimal) and imposes transparency, documentation and human oversight obligations on providers and deployers in the EU.",
    "faq.q2": "Who does the EU AI Act apply to?",
    "faq.a2": "Any organisation that develops, deploys or uses AI systems in the European market — regardless of where its headquarters are. If your company uses chatbots, CRM with scoring, AI in HR, content generation tools or predictive analytics, it applies to you.",
    "faq.q3": "What are the penalties for non-compliance?",
    "faq.a3": "Penalties are significant: up to €35 million or 7% of global annual turnover (whichever is higher) for prohibited practices, €15M or 3% for high-risk non-compliance, and €7.5M or 1.5% for providing incorrect information.",
    "faq.q4": "How does Audlex help me comply?",
    "faq.a4": "Audlex automates the entire process: 1) We inventory your AI systems, 2) Classify their risk level according to the regulation, 3) Generate all mandatory documentation (up to 13 documents), 4) Guide you with an interactive checklist and compliance dashboard. All in one afternoon.",
    "faq.q5": "Is it different from ISO 42001?",
    "faq.a5": "Yes. ISO 42001 is a voluntary AI management standard. The EU AI Act is a binding law with penalties. They're complementary: ISO 42001 helps with governance, but the AI Act has specific requirements for classification, technical documentation and mandatory registration that ISO doesn't cover. Audlex focuses on the AI Act's legal requirements.",
    "faq.q6": "How long do I have to comply?",
    "faq.a6": "Obligations for high-risk systems take effect on August 2, 2026. However, prohibited practices are already in force since February 2025, and transparency requirements for general-purpose AI since August 2025. The sooner you start, the better.",

    // Testimonials
    "testimonials.badge": "What our users say",
    "testimonials.title": "Companies already complying with the AI Act",
    "testimonials.subtitle": "Over 200 organisations use Audlex to manage their compliance.",

    // Newsletter
    "newsletter.title": "Stay up to date with the AI Act",
    "newsletter.subtitle": "Receive updates on regulatory changes, practical guides and Audlex news.",
    "newsletter.placeholder": "you@company.com",
    "newsletter.button": "Subscribe",
    "newsletter.privacy": "No spam. Unsubscribe at any time.",

    // Industry
    "industry.badge": "By industry",
    "industry.title": "Solutions for your sector",
    "industry.subtitle": "The AI Act affects all sectors, but each has its particularities.",

    // Footer
    "footer.disclaimer": "Informational tool — does not replace legal advice.",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.cookies": "Cookies",
    "footer.blog": "Blog",
  },
};

export function t(locale: Locale, key: string, replacements?: Record<string, string | number>): string {
  let text = translations[locale]?.[key] || translations.es[key] || key;
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}
