import { type Locale, translations } from "./translations";

/**
 * Translations for all public pages: blog, trust, about, legal, demo, auth.
 * Merged with landing-page translations so a single `tp()` function works everywhere.
 */
const publicTranslations: Record<Locale, Record<string, string>> = {
  es: {
    /* ── Common public nav ─────────────────────────────────── */
    "public.home": "Inicio",
    "public.back": "Volver",
    "public.startFree": "Empezar gratis",
    "public.signIn": "Iniciar sesión",
    "public.register": "Registrarme gratis",

    /* ── Blog listing ──────────────────────────────────────── */
    "blog.hero.title": "Blog de {brand}",
    "blog.hero.subtitle":
      "Guías prácticas, análisis legal y novedades sobre el EU AI Act. Todo lo que necesitas para mantener tu empresa en compliance.",
    "blog.readArticle": "Leer artículo",
    "blog.readTime": "min de lectura",
    "blog.cta.title": "¿Listo para cumplir con el EU AI Act?",
    "blog.cta.subtitle":
      "Clasifica tu primer sistema de IA gratis en menos de 10 minutos.",
    "blog.post1.title":
      "¿Qué es el EU AI Act? Guía completa para empresas españolas en 2025",
    "blog.post1.excerpt":
      "Todo lo que necesitas saber sobre el Reglamento Europeo de Inteligencia Artificial: clasificación de riesgos, obligaciones, plazos y cómo preparar tu empresa para cumplir antes de agosto de 2026.",
    "blog.post1.category": "Guía",
    "blog.post2.title":
      "Sistemas de IA de Alto Riesgo: ¿Cómo identificar si tu empresa tiene alguno?",
    "blog.post2.excerpt":
      "El Anexo III del AI Act lista las categorías de alto riesgo. Te explicamos con ejemplos prácticos cómo saber si tu chatbot, CRM o herramienta de RRHH entra en esta categoría y qué documentación necesitas.",
    "blog.post2.category": "Compliance",
    "blog.post3.title":
      "Multas del AI Act: Hasta 35M€ — Cómo evitarlas con un plan de compliance",
    "blog.post3.excerpt":
      "Análisis detallado del régimen sancionador del EU AI Act: tipos de infracciones, cuantías, agravantes y atenuantes. Incluye un plan de acción en 5 pasos para blindar tu empresa.",
    "blog.post3.category": "Legal",

    /* ── Blog article ──────────────────────────────────────── */
    "blog.backToBlog": "← Blog",
    "blog.backToList": "Volver al blog",
    "blog.article.cta.title": "¿Listo para empezar tu compliance?",
    "blog.article.cta.subtitle":
      "Clasifica tu primer sistema de IA gratis y genera toda la documentación automáticamente.",

    /* ── Trust Center ──────────────────────────────────────── */
    "trust.badge": "Trust Center",
    "trust.hero.title": "Transparencia y {accent}",
    "trust.hero.accent": "confianza",
    "trust.hero.subtitle":
      "En Audlex, la seguridad y privacidad de tus datos son nuestra máxima prioridad. Aquí encontrarás toda la información sobre nuestras prácticas de seguridad y compliance.",
    "trust.security.title": "Medidas de seguridad",
    "trust.active": "Activo",
    "trust.compliance.title": "Marco de compliance",
    "trust.dataProcessing.title": "Tratamiento de datos",
    "trust.dataProcessing.subtitle":
      "Detalle de los datos que recopilamos, su finalidad, período de retención y base legal.",
    "trust.subProcessors.title": "Sub-encargados del tratamiento",
    "trust.contact.title": "¿Tienes preguntas de seguridad?",
    "trust.contact.subtitle":
      "Nuestro equipo de seguridad está disponible para resolver cualquier duda sobre protección de datos, compliance o prácticas de seguridad.",
    "trust.contact.button": "Contactar con seguridad",
    "trust.table.data": "Dato",
    "trust.table.purpose": "Finalidad",
    "trust.table.retention": "Retención",
    "trust.table.legal": "Base legal",
    // Security measures
    "trust.enc.title": "Cifrado extremo a extremo",
    "trust.enc.desc":
      "TLS 1.3 para datos en tránsito. AES-256 para datos en reposo. Todas las comunicaciones están cifradas.",
    "trust.infra.title": "Infraestructura en la UE",
    "trust.infra.desc":
      "Servidores alojados en AWS eu-west-1 (Irlanda). Los datos nunca salen de la Unión Europea.",
    "trust.gdpr.title": "Cumplimiento RGPD",
    "trust.gdpr.desc":
      "Totalmente conforme con el Reglamento General de Protección de Datos. DPO designado.",
    "trust.auditlog.title": "Audit Log inmutable",
    "trust.auditlog.desc":
      "Registro completo de cada acción en la plataforma. Trazabilidad total para inspecciones.",
    // Compliance frameworks
    "trust.fw.euaiact.desc": "Reglamento (UE) 2024/1689",
    "trust.fw.euaiact.status": "Conforme",
    "trust.fw.rgpd.desc": "Protección de datos personales",
    "trust.fw.rgpd.status": "Conforme",
    "trust.fw.iso.desc": "Seguridad de la información",
    "trust.fw.iso.status": "En proceso",
    "trust.fw.soc2.desc": "Controles de servicio",
    "trust.fw.soc2.status": "Planificado",
    // Data processing rows
    "trust.dp.user.data": "Datos de usuario",
    "trust.dp.user.purpose": "Autenticación y gestión de cuenta",
    "trust.dp.user.retention": "Mientras la cuenta esté activa",
    "trust.dp.ai.data": "Datos de sistemas IA",
    "trust.dp.ai.purpose": "Inventario y clasificación de riesgo",
    "trust.dp.ai.retention": "Mientras la cuenta esté activa",
    "trust.dp.docs.data": "Documentos generados",
    "trust.dp.docs.purpose": "Generación de compliance",
    "trust.dp.docs.retention": "5 años tras el cierre",
    "trust.dp.logs.data": "Logs de auditoría",
    "trust.dp.logs.purpose": "Trazabilidad y seguridad",
    "trust.dp.logs.retention": "7 años",
    "trust.dp.payment.data": "Datos de pago",
    "trust.dp.payment.purpose": "Procesamiento de pagos (Stripe)",
    "trust.dp.payment.retention": "Según requisitos fiscales",
    // Sub-processors
    "trust.sp.supabase": "Base de datos y autenticación",
    "trust.sp.vercel": "Hosting y CDN",
    "trust.sp.stripe": "Procesamiento de pagos",
    "trust.sp.resend": "Envío de emails transaccionales",

    /* ── Sobre nosotros (About) ────────────────────────────── */
    "about.hero.title":
      "Hacemos que cumplir con el {accent} sea accesible para todos",
    "about.hero.accent": " EU AI Act",
    "about.hero.subtitle":
      "Audlex nació con una misión clara: que ninguna empresa —sea grande o pequeña— se quede atrás en la regulación europea de inteligencia artificial.",
    "about.mission.title": "Nuestra misión",
    "about.mission.desc":
      "Democratizar el cumplimiento del EU AI Act. Creemos que la regulación de la IA no debería ser un privilegio de las grandes corporaciones con equipos legales enormes. Cada empresa que usa IA merece herramientas claras, asequibles y eficaces para cumplir.",
    "about.vision.title": "Nuestra visión",
    "about.vision.desc":
      "Un ecosistema europeo de IA donde la innovación y la regulación van de la mano. Donde cumplir no sea un obstáculo, sino una ventaja competitiva. Donde la confianza en la IA se construya sobre transparencia y responsabilidad.",
    "about.values.title": "Nuestros valores",
    "about.values.rigor.title": "Rigor regulatorio",
    "about.values.rigor.desc":
      "Basamos todo en el texto literal del reglamento y las guías oficiales de AESIA.",
    "about.values.access.title": "Accesibilidad",
    "about.values.access.desc":
      "Precios justos, lenguaje claro, sin jerga innecesaria. Compliance para todos.",
    "about.values.privacy.title": "Privacidad primero",
    "about.values.privacy.desc":
      "Tus datos nunca salen de la UE. RGPD no es un checkbox — es un principio.",
    "about.values.impact.title": "Impacto europeo",
    "about.values.impact.desc":
      "Construido en Europa, para Europa. Contribuimos a un ecosistema de IA responsable.",
    "about.why.title": "¿Por qué Audlex?",
    "about.why.problem.title": "El problema",
    "about.why.problem.desc":
      "El EU AI Act afecta a miles de empresas en España. La mayoría no sabe si le aplica, qué debe hacer, ni tiene presupuesto para consultores especializados que cobran miles de euros por un informe básico.",
    "about.why.solution.title": "Nuestra solución",
    "about.why.solution.desc":
      "Automatizamos el proceso completo: inventariar, clasificar, documentar y monitorizar. Lo que antes llevaba semanas y costaba miles de euros, ahora se hace en una tarde desde 0€.",
    "about.contact.title": "¿Hablamos?",
    "about.contact.subtitle":
      "Si tienes preguntas sobre el EU AI Act, necesitas una demo personalizada o quieres colaborar, no dudes en contactarnos.",

    /* ── Demo ──────────────────────────────────────────────── */
    "demo.badge": "Modo demo — sin registro",
    "demo.title": "Clasifica tu sistema de IA",
    "demo.subtitle":
      "Responde 5 preguntas rápidas y descubre tu nivel de riesgo según el EU AI Act.",
    "demo.questionOf": "Pregunta {current} de {total}",
    "demo.previous": "Anterior",
    "demo.q.category": "¿Qué tipo de sistema de IA quieres clasificar?",
    "demo.o.chatbot": "Chatbot / Asistente virtual",
    "demo.o.scoring": "Scoring / Puntuación automatizada",
    "demo.o.rrhh": "IA en Recursos Humanos",
    "demo.o.biometria": "Reconocimiento biométrico",
    "demo.o.analytics": "Analítica / Reporting con IA",
    "demo.o.other": "Otro",
    "demo.q.autonomous":
      "¿El sistema toma decisiones sin intervención humana?",
    "demo.o.autonomous.yes": "Sí, decisiones completamente autónomas",
    "demo.o.autonomous.partial": "Parcialmente, con supervisión humana",
    "demo.o.autonomous.no": "No, solo asiste a humanos",
    "demo.q.affected": "¿A quién afectan las decisiones del sistema?",
    "demo.o.employees": "Empleados internos",
    "demo.o.customers": "Clientes / Usuarios",
    "demo.o.citizens": "Ciudadanos en general",
    "demo.o.vulnerable":
      "Grupos vulnerables (menores, personas con discapacidad...)",
    "demo.q.domain": "¿En qué ámbito se usa el sistema?",
    "demo.o.education": "Educación / Formación",
    "demo.o.employment": "Empleo / Selección de personal",
    "demo.o.financial": "Servicios financieros / Crédito",
    "demo.o.health": "Salud / Medicina",
    "demo.o.justice": "Justicia / Fuerzas de seguridad",
    "demo.o.general": "Uso general / Marketing",
    "demo.q.data": "¿Qué tipo de datos procesa?",
    "demo.o.personal": "Datos personales básicos",
    "demo.o.sensitive":
      "Datos sensibles (salud, etnia, orientación sexual...)",
    "demo.o.biometric": "Datos biométricos",
    "demo.o.anonymous": "Datos anonimizados / agregados",
    "demo.result.why": "¿Por qué este nivel de riesgo?",
    "demo.result.obligations": "Obligaciones aplicables",
    "demo.result.fullReport": "¿Quieres el informe completo?",
    "demo.result.fullReportDesc":
      "Regístrate gratis para obtener la clasificación detallada, generar documentación y gestionar tu checklist de compliance.",
    "demo.result.classifyAnother": "Clasificar otro sistema",
    "demo.risk.unacceptable": "Riesgo inaceptable",
    "demo.risk.unacceptable.desc":
      "Este sistema podría estar PROHIBIDO bajo el AI Act. Se recomienda asesoramiento legal urgente.",
    "demo.risk.high": "Alto riesgo",
    "demo.risk.high.desc":
      "Este sistema requiere cumplir con múltiples obligaciones del EU AI Act antes del 2 de agosto de 2026.",
    "demo.risk.limited": "Riesgo limitado",
    "demo.risk.limited.desc":
      "Este sistema tiene obligaciones de transparencia. Debe informar a los usuarios de que interactúan con IA.",
    "demo.risk.minimal": "Riesgo mínimo",
    "demo.risk.minimal.desc":
      "Este sistema tiene un riesgo bajo. No hay obligaciones específicas, pero se recomienda seguir buenas prácticas.",
    // Classifier reasons (kept in Spanish for SEO; the labels above handle UI)
    "demo.reason.biometric":
      "Los sistemas biométricos están regulados como alto riesgo (Anexo III)",
    "demo.reason.scoring":
      "Los sistemas de scoring pueden clasificarse como alto riesgo",
    "demo.reason.rrhh":
      "La IA en RRHH está explícitamente en el Anexo III del AI Act",
    "demo.reason.chatbot":
      "Los chatbots tienen obligaciones de transparencia (Art. 50)",
    "demo.reason.analytics":
      "Los sistemas analíticos generalmente son de riesgo mínimo",
    "demo.reason.autonomous":
      "Las decisiones autónomas sin supervisión humana aumentan el nivel de riesgo",
    "demo.reason.vulnerable":
      "Afectar a grupos vulnerables eleva significativamente el riesgo",
    "demo.reason.citizens":
      "El impacto en ciudadanos en general es un factor de riesgo",
    "demo.reason.justice":
      "El uso en justicia/seguridad es alto riesgo por definición (Anexo III)",
    "demo.reason.employment":
      "IA en empleo/selección de personal: alto riesgo (Anexo III, punto 4)",
    "demo.reason.financial":
      "IA en servicios financieros: posible alto riesgo (Anexo III, punto 5)",
    "demo.reason.health":
      "IA en salud puede ser alto riesgo según su uso específico",
    "demo.reason.education":
      "IA en educación: posible alto riesgo (Anexo III, punto 3)",
    "demo.reason.biometricData":
      "El procesamiento de datos biométricos conlleva obligaciones especiales",
    "demo.reason.sensitiveData":
      "Los datos sensibles requieren medidas de protección adicionales",
    // Obligations
    "demo.obl.prohibited":
      "Este sistema podría estar PROHIBIDO según el Art. 5 del AI Act",
    "demo.obl.consultLegal":
      "Consulte con un experto legal antes de continuar operándolo",
    "demo.obl.riskMgmt": "Sistema de Gestión de Riesgos (Art. 9)",
    "demo.obl.dataGov": "Gobernanza de datos (Art. 10)",
    "demo.obl.techDoc": "Documentación técnica (Art. 11)",
    "demo.obl.humanOverride": "Supervisión humana (Art. 14)",
    "demo.obl.transparency": "Transparencia (Art. 13)",
    "demo.obl.euDb": "Registro en base de datos de la UE (Art. 49)",
    "demo.obl.conformity": "Evaluación de conformidad (Art. 43)",
    "demo.obl.transparencyArt50": "Obligaciones de transparencia (Art. 50)",
    "demo.obl.informUsers":
      "Informar a los usuarios que interactúan con IA",
    "demo.obl.labelContent":
      "Etiquetar contenido generado por IA (si aplica)",
    "demo.obl.noSpecific":
      "Sin obligaciones específicas del AI Act",
    "demo.obl.voluntaryCodes":
      "Se recomienda adoptar códigos de conducta voluntarios (Art. 95)",
    "demo.obl.literacy":
      "Alfabetización en IA para el personal (Art. 4)",

    /* ── Auth ──────────────────────────────────────────────── */
    "auth.login.subtitle": "Inicia sesión en tu cuenta",
    "auth.login.google": "Continuar con Google",
    "auth.login.orEmail": "o con email",
    "auth.login.email": "Email",
    "auth.login.password": "Contraseña",
    "auth.login.submit": "Iniciar sesión",
    "auth.login.forgot": "¿Has olvidado tu contraseña?",
    "auth.login.noAccount": "¿No tienes cuenta?",
    "auth.login.registerLink": "Regístrate gratis",
    "auth.login.invalidCredentials": "Email o contraseña incorrectos",
    "auth.register.subtitle": "Crea tu cuenta — es gratis",
    "auth.register.google": "Continuar con Google",
    "auth.register.orEmail": "o con email",
    "auth.register.name": "Nombre",
    "auth.register.namePlaceholder": "Tu nombre",
    "auth.register.email": "Email",
    "auth.register.password": "Contraseña",
    "auth.register.passwordPlaceholder": "Mínimo 8 caracteres",
    "auth.register.submit": "Crear cuenta",
    "auth.register.terms":
      "Al registrarte aceptas nuestros {terms} y {privacy}",
    "auth.register.termsLink": "términos",
    "auth.register.privacyLink": "política de privacidad",
    "auth.register.hasAccount": "¿Ya tienes cuenta?",
    "auth.register.loginLink": "Inicia sesión",
    "auth.register.created": "¡Cuenta creada!",
    "auth.register.companySetup":
      "Cuéntanos sobre tu empresa para personalizar tu experiencia",
    "auth.register.companyName": "Nombre de la empresa",
    "auth.register.companyPlaceholder": "Mi Empresa SL",
    "auth.register.sector": "Sector",
    "auth.register.sectorPlaceholder": "Selecciona un sector",
    "auth.register.size": "Tamaño",
    "auth.register.sizeMicro": "Micro",
    "auth.register.sizeSmall": "Pequeña",
    "auth.register.sizeMedium": "Mediana",
    "auth.register.sizeLarge": "Grande",
    "auth.register.goToDashboard": "Ir al dashboard",
    // Sector options
    "auth.sector.technology": "Tecnología / Software",
    "auth.sector.finance_insurance": "Finanzas / Seguros",
    "auth.sector.healthcare": "Sanidad / Salud",
    "auth.sector.education": "Educación",
    "auth.sector.employment_hr": "RRHH / Consultoría",
    "auth.sector.retail": "Comercio",
    "auth.sector.manufacturing": "Fabricación / Industria",
    "auth.sector.marketing": "Marketing / Publicidad",
    "auth.sector.legal": "Legal / Jurídico",
    "auth.sector.public_services": "Administración Pública",
    "auth.sector.other": "Otro",

    /* ── Reset / Update password ───────────────────────────── */
    "auth.reset.subtitle": "Recupera tu contraseña",
    "auth.reset.instructions": "Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.",
    "auth.reset.submit": "Enviar enlace de recuperación",
    "auth.reset.sent.title": "Email enviado",
    "auth.reset.sent.text": "Si existe una cuenta con <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.",
    "auth.reset.backToLogin": "Volver a iniciar sesión",
    "auth.update.subtitle": "Establece tu nueva contraseña",
    "auth.update.newPassword": "Nueva contraseña",
    "auth.update.newPasswordPlaceholder": "Mínimo 6 caracteres",
    "auth.update.confirmPassword": "Confirmar contraseña",
    "auth.update.confirmPlaceholder": "Repite la contraseña",
    "auth.update.submit": "Actualizar contraseña",
    "auth.update.success.title": "Contraseña actualizada",
    "auth.update.success.text": "Tu contraseña ha sido actualizada correctamente. Redirigiendo al dashboard...",
    "auth.update.errorMinLength": "La contraseña debe tener al menos 6 caracteres",
    "auth.update.errorMismatch": "Las contraseñas no coinciden",

    /* ── Footer extras ─────────────────────────────────────── */
    "footer.aboutUs": "Sobre nosotros",
    "footer.trustCenter": "Trust Center",
  },

  en: {
    /* ── Common public nav ─────────────────────────────────── */
    "public.home": "Home",
    "public.back": "Back",
    "public.startFree": "Start free",
    "public.signIn": "Sign in",
    "public.register": "Register free",

    /* ── Blog listing ──────────────────────────────────────── */
    "blog.hero.title": "{brand} Blog",
    "blog.hero.subtitle":
      "Practical guides, legal analysis and news about the EU AI Act. Everything you need to keep your company in compliance.",
    "blog.readArticle": "Read article",
    "blog.readTime": "min read",
    "blog.cta.title": "Ready to comply with the EU AI Act?",
    "blog.cta.subtitle":
      "Classify your first AI system for free in under 10 minutes.",
    "blog.post1.title":
      "What is the EU AI Act? Complete guide for companies in 2025",
    "blog.post1.excerpt":
      "Everything you need to know about the European AI Regulation: risk classification, obligations, deadlines and how to prepare your company to comply before August 2026.",
    "blog.post1.category": "Guide",
    "blog.post2.title":
      "High-Risk AI Systems: How to identify if your company has one?",
    "blog.post2.excerpt":
      "Annex III of the AI Act lists the high-risk categories. We explain with practical examples how to know if your chatbot, CRM or HR tool falls into this category and what documentation you need.",
    "blog.post2.category": "Compliance",
    "blog.post3.title":
      "AI Act Fines: Up to €35M — How to avoid them with a compliance plan",
    "blog.post3.excerpt":
      "Detailed analysis of the EU AI Act penalty regime: types of infringements, amounts, aggravating and mitigating factors. Includes a 5-step action plan to protect your company.",
    "blog.post3.category": "Legal",

    /* ── Blog article ──────────────────────────────────────── */
    "blog.backToBlog": "← Blog",
    "blog.backToList": "Back to blog",
    "blog.article.cta.title": "Ready to start your compliance?",
    "blog.article.cta.subtitle":
      "Classify your first AI system for free and generate all documentation automatically.",

    /* ── Trust Center ──────────────────────────────────────── */
    "trust.badge": "Trust Center",
    "trust.hero.title": "Transparency and {accent}",
    "trust.hero.accent": "trust",
    "trust.hero.subtitle":
      "At Audlex, the security and privacy of your data is our top priority. Here you will find all the information about our security and compliance practices.",
    "trust.security.title": "Security measures",
    "trust.active": "Active",
    "trust.compliance.title": "Compliance framework",
    "trust.dataProcessing.title": "Data processing",
    "trust.dataProcessing.subtitle":
      "Details of the data we collect, its purpose, retention period and legal basis.",
    "trust.subProcessors.title": "Sub-processors",
    "trust.contact.title": "Have security questions?",
    "trust.contact.subtitle":
      "Our security team is available to answer any questions about data protection, compliance or security practices.",
    "trust.contact.button": "Contact security",
    "trust.table.data": "Data",
    "trust.table.purpose": "Purpose",
    "trust.table.retention": "Retention",
    "trust.table.legal": "Legal basis",
    "trust.enc.title": "End-to-end encryption",
    "trust.enc.desc":
      "TLS 1.3 for data in transit. AES-256 for data at rest. All communications are encrypted.",
    "trust.infra.title": "EU-based infrastructure",
    "trust.infra.desc":
      "Servers hosted on AWS eu-west-1 (Ireland). Your data never leaves the European Union.",
    "trust.gdpr.title": "GDPR compliant",
    "trust.gdpr.desc":
      "Fully compliant with the General Data Protection Regulation. DPO appointed.",
    "trust.auditlog.title": "Immutable audit log",
    "trust.auditlog.desc":
      "Complete record of every action on the platform. Full traceability for inspections.",
    "trust.fw.euaiact.desc": "Regulation (EU) 2024/1689",
    "trust.fw.euaiact.status": "Compliant",
    "trust.fw.rgpd.desc": "Personal data protection",
    "trust.fw.rgpd.status": "Compliant",
    "trust.fw.iso.desc": "Information security",
    "trust.fw.iso.status": "In progress",
    "trust.fw.soc2.desc": "Service controls",
    "trust.fw.soc2.status": "Planned",
    "trust.dp.user.data": "User data",
    "trust.dp.user.purpose": "Authentication and account management",
    "trust.dp.user.retention": "While account is active",
    "trust.dp.ai.data": "AI systems data",
    "trust.dp.ai.purpose": "Inventory and risk classification",
    "trust.dp.ai.retention": "While account is active",
    "trust.dp.docs.data": "Generated documents",
    "trust.dp.docs.purpose": "Compliance generation",
    "trust.dp.docs.retention": "5 years after closing",
    "trust.dp.logs.data": "Audit logs",
    "trust.dp.logs.purpose": "Traceability and security",
    "trust.dp.logs.retention": "7 years",
    "trust.dp.payment.data": "Payment data",
    "trust.dp.payment.purpose": "Payment processing (Stripe)",
    "trust.dp.payment.retention": "Per tax requirements",
    "trust.sp.supabase": "Database and authentication",
    "trust.sp.vercel": "Hosting and CDN",
    "trust.sp.stripe": "Payment processing",
    "trust.sp.resend": "Transactional email delivery",

    /* ── About ─────────────────────────────────────────────── */
    "about.hero.title":
      "We make complying with the {accent} accessible for everyone",
    "about.hero.accent": "EU AI Act",
    "about.hero.subtitle":
      "Audlex was born with a clear mission: that no company — big or small — is left behind in European AI regulation.",
    "about.mission.title": "Our mission",
    "about.mission.desc":
      "Democratise EU AI Act compliance. We believe AI regulation should not be a privilege of large corporations with huge legal teams. Every company using AI deserves clear, affordable and effective tools to comply.",
    "about.vision.title": "Our vision",
    "about.vision.desc":
      "A European AI ecosystem where innovation and regulation go hand in hand. Where compliance is not an obstacle but a competitive advantage. Where trust in AI is built on transparency and accountability.",
    "about.values.title": "Our values",
    "about.values.rigor.title": "Regulatory rigour",
    "about.values.rigor.desc":
      "We base everything on the literal text of the regulation and the official AESIA guidelines.",
    "about.values.access.title": "Accessibility",
    "about.values.access.desc":
      "Fair prices, clear language, no unnecessary jargon. Compliance for everyone.",
    "about.values.privacy.title": "Privacy first",
    "about.values.privacy.desc":
      "Your data never leaves the EU. GDPR is not a checkbox — it's a principle.",
    "about.values.impact.title": "European impact",
    "about.values.impact.desc":
      "Built in Europe, for Europe. We contribute to a responsible AI ecosystem.",
    "about.why.title": "Why Audlex?",
    "about.why.problem.title": "The problem",
    "about.why.problem.desc":
      "The EU AI Act affects thousands of companies in Spain. Most don't know if it applies to them, what they need to do, or have the budget for specialised consultants charging thousands of euros for a basic report.",
    "about.why.solution.title": "Our solution",
    "about.why.solution.desc":
      "We automate the complete process: inventory, classify, document and monitor. What used to take weeks and cost thousands of euros now gets done in an afternoon from €0.",
    "about.contact.title": "Let's talk?",
    "about.contact.subtitle":
      "If you have questions about the EU AI Act, need a personalised demo or want to collaborate, don't hesitate to contact us.",

    /* ── Demo ──────────────────────────────────────────────── */
    "demo.badge": "Demo mode — no sign-up required",
    "demo.title": "Classify your AI system",
    "demo.subtitle":
      "Answer 5 quick questions and discover your risk level under the EU AI Act.",
    "demo.questionOf": "Question {current} of {total}",
    "demo.previous": "Previous",
    "demo.q.category": "What type of AI system do you want to classify?",
    "demo.o.chatbot": "Chatbot / Virtual assistant",
    "demo.o.scoring": "Scoring / Automated rating",
    "demo.o.rrhh": "AI in Human Resources",
    "demo.o.biometria": "Biometric recognition",
    "demo.o.analytics": "Analytics / AI-powered reporting",
    "demo.o.other": "Other",
    "demo.q.autonomous":
      "Does the system make decisions without human intervention?",
    "demo.o.autonomous.yes": "Yes, fully autonomous decisions",
    "demo.o.autonomous.partial": "Partially, with human oversight",
    "demo.o.autonomous.no": "No, it only assists humans",
    "demo.q.affected": "Who is affected by the system's decisions?",
    "demo.o.employees": "Internal employees",
    "demo.o.customers": "Customers / End users",
    "demo.o.citizens": "General public",
    "demo.o.vulnerable":
      "Vulnerable groups (minors, people with disabilities…)",
    "demo.q.domain": "In which domain is the system used?",
    "demo.o.education": "Education / Training",
    "demo.o.employment": "Employment / Recruitment",
    "demo.o.financial": "Financial services / Credit",
    "demo.o.health": "Health / Medicine",
    "demo.o.justice": "Justice / Law enforcement",
    "demo.o.general": "General purpose / Marketing",
    "demo.q.data": "What type of data does it process?",
    "demo.o.personal": "Basic personal data",
    "demo.o.sensitive":
      "Sensitive data (health, ethnicity, sexual orientation…)",
    "demo.o.biometric": "Biometric data",
    "demo.o.anonymous": "Anonymised / Aggregated data",
    "demo.result.why": "Why this risk level?",
    "demo.result.obligations": "Applicable obligations",
    "demo.result.fullReport": "Want the full report?",
    "demo.result.fullReportDesc":
      "Register for free to get the detailed classification, generate documentation and manage your compliance checklist.",
    "demo.result.classifyAnother": "Classify another system",
    "demo.risk.unacceptable": "Unacceptable risk",
    "demo.risk.unacceptable.desc":
      "This system may be PROHIBITED under the AI Act. Urgent legal advice is recommended.",
    "demo.risk.high": "High risk",
    "demo.risk.high.desc":
      "This system must comply with multiple EU AI Act obligations before August 2, 2026.",
    "demo.risk.limited": "Limited risk",
    "demo.risk.limited.desc":
      "This system has transparency obligations. Users must be informed that they are interacting with AI.",
    "demo.risk.minimal": "Minimal risk",
    "demo.risk.minimal.desc":
      "This system has low risk. No specific obligations, but following best practices is recommended.",
    "demo.reason.biometric":
      "Biometric systems are regulated as high risk (Annex III)",
    "demo.reason.scoring":
      "Scoring systems may be classified as high risk",
    "demo.reason.rrhh":
      "AI in HR is explicitly listed in Annex III of the AI Act",
    "demo.reason.chatbot":
      "Chatbots have transparency obligations (Art. 50)",
    "demo.reason.analytics":
      "Analytical systems are generally minimal risk",
    "demo.reason.autonomous":
      "Autonomous decisions without human oversight increase the risk level",
    "demo.reason.vulnerable":
      "Affecting vulnerable groups significantly raises the risk",
    "demo.reason.citizens":
      "Impact on the general public is a risk factor",
    "demo.reason.justice":
      "Use in justice/security is high risk by definition (Annex III)",
    "demo.reason.employment":
      "AI in employment/recruitment: high risk (Annex III, point 4)",
    "demo.reason.financial":
      "AI in financial services: possible high risk (Annex III, point 5)",
    "demo.reason.health":
      "AI in health may be high risk depending on specific use",
    "demo.reason.education":
      "AI in education: possible high risk (Annex III, point 3)",
    "demo.reason.biometricData":
      "Processing biometric data entails special obligations",
    "demo.reason.sensitiveData":
      "Sensitive data requires additional protection measures",
    "demo.obl.prohibited":
      "This system may be PROHIBITED under Art. 5 of the AI Act",
    "demo.obl.consultLegal":
      "Consult a legal expert before continuing to operate it",
    "demo.obl.riskMgmt": "Risk Management System (Art. 9)",
    "demo.obl.dataGov": "Data governance (Art. 10)",
    "demo.obl.techDoc": "Technical documentation (Art. 11)",
    "demo.obl.humanOverride": "Human oversight (Art. 14)",
    "demo.obl.transparency": "Transparency (Art. 13)",
    "demo.obl.euDb": "EU database registration (Art. 49)",
    "demo.obl.conformity": "Conformity assessment (Art. 43)",
    "demo.obl.transparencyArt50": "Transparency obligations (Art. 50)",
    "demo.obl.informUsers":
      "Inform users they are interacting with AI",
    "demo.obl.labelContent":
      "Label AI-generated content (if applicable)",
    "demo.obl.noSpecific":
      "No specific AI Act obligations",
    "demo.obl.voluntaryCodes":
      "Voluntary codes of conduct are recommended (Art. 95)",
    "demo.obl.literacy":
      "AI literacy for staff (Art. 4)",

    /* ── Auth ──────────────────────────────────────────────── */
    "auth.login.subtitle": "Sign in to your account",
    "auth.login.google": "Continue with Google",
    "auth.login.orEmail": "or with email",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.submit": "Sign in",
    "auth.login.forgot": "Forgot your password?",
    "auth.login.noAccount": "Don't have an account?",
    "auth.login.registerLink": "Register for free",
    "auth.login.invalidCredentials": "Invalid email or password",
    "auth.register.subtitle": "Create your account — it's free",
    "auth.register.google": "Continue with Google",
    "auth.register.orEmail": "or with email",
    "auth.register.name": "Name",
    "auth.register.namePlaceholder": "Your name",
    "auth.register.email": "Email",
    "auth.register.password": "Password",
    "auth.register.passwordPlaceholder": "At least 8 characters",
    "auth.register.submit": "Create account",
    "auth.register.terms":
      "By registering you accept our {terms} and {privacy}",
    "auth.register.termsLink": "terms",
    "auth.register.privacyLink": "privacy policy",
    "auth.register.hasAccount": "Already have an account?",
    "auth.register.loginLink": "Sign in",
    "auth.register.created": "Account created!",
    "auth.register.companySetup":
      "Tell us about your company to personalise your experience",
    "auth.register.companyName": "Company name",
    "auth.register.companyPlaceholder": "My Company Ltd",
    "auth.register.sector": "Sector",
    "auth.register.sectorPlaceholder": "Select a sector",
    "auth.register.size": "Size",
    "auth.register.sizeMicro": "Micro",
    "auth.register.sizeSmall": "Small",
    "auth.register.sizeMedium": "Medium",
    "auth.register.sizeLarge": "Large",
    "auth.register.goToDashboard": "Go to dashboard",
    "auth.sector.technology": "Technology / Software",
    "auth.sector.finance_insurance": "Finance / Insurance",
    "auth.sector.healthcare": "Healthcare",
    "auth.sector.education": "Education",
    "auth.sector.employment_hr": "HR / Consulting",
    "auth.sector.retail": "Retail",
    "auth.sector.manufacturing": "Manufacturing / Industry",
    "auth.sector.marketing": "Marketing / Advertising",
    "auth.sector.legal": "Legal",
    "auth.sector.public_services": "Public Administration",
    "auth.sector.other": "Other",

    /* ── Reset / Update password ───────────────────────────── */
    "auth.reset.subtitle": "Reset your password",
    "auth.reset.instructions": "Enter your email and we'll send you a link to reset your password.",
    "auth.reset.submit": "Send reset link",
    "auth.reset.sent.title": "Email sent",
    "auth.reset.sent.text": "If an account exists with <strong>{email}</strong>, you'll receive a link to reset your password. Check your spam folder too.",
    "auth.reset.backToLogin": "Back to sign in",
    "auth.update.subtitle": "Set your new password",
    "auth.update.newPassword": "New password",
    "auth.update.newPasswordPlaceholder": "At least 6 characters",
    "auth.update.confirmPassword": "Confirm password",
    "auth.update.confirmPlaceholder": "Repeat the password",
    "auth.update.submit": "Update password",
    "auth.update.success.title": "Password updated",
    "auth.update.success.text": "Your password has been updated successfully. Redirecting to dashboard...",
    "auth.update.errorMinLength": "Password must be at least 6 characters",
    "auth.update.errorMismatch": "Passwords do not match",

    /* ── Footer extras ─────────────────────────────────────── */
    "footer.aboutUs": "About us",
    "footer.trustCenter": "Trust Center",
  },
};

/* ── Merged dictionary: landing + public-page translations ── */
const merged: Record<Locale, Record<string, string>> = {
  es: { ...translations.es, ...publicTranslations.es },
  en: { ...translations.en, ...publicTranslations.en },
};

/**
 * Translate any key (landing + public pages).
 * Use `tp()` everywhere instead of the narrower `t()`.
 */
export function tp(
  locale: Locale,
  key: string,
  replacements?: Record<string, string | number>,
): string {
  let text = merged[locale]?.[key] || merged.es[key] || key;
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}
