import { notFound } from "next/navigation";
import { BlogArticleContent } from "./article-content";

// Static blog content
const articles: Record<string, {
  title: string;
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  content: { type: "p" | "h2" | "h3" | "ul" | "callout"; text: string | string[] }[];
}> = {
  "que-es-eu-ai-act-guia-completa": {
    title: "¿Qué es el EU AI Act? Guía completa para empresas españolas en 2025",
    date: "2025-06-15",
    readTime: "12 min",
    category: "Guía",
    categoryColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    content: [
      { type: "p", text: "El Reglamento (UE) 2024/1689, conocido como EU AI Act o Ley de Inteligencia Artificial de la UE, es la primera legislación integral del mundo diseñada para regular el desarrollo, comercialización y uso de sistemas de inteligencia artificial. Fue aprobado por el Parlamento Europeo en marzo de 2024 y publicado en el Diario Oficial de la UE en julio de 2024." },
      { type: "h2", text: "¿Por qué existe el EU AI Act?" },
      { type: "p", text: "La Unión Europea ha sido pionera en establecer un marco regulatorio para la IA con un enfoque basado en el riesgo. El objetivo es doble: proteger los derechos fundamentales de los ciudadanos europeos frente a los riesgos que plantea la IA, y al mismo tiempo fomentar la innovación responsable y la competitividad europea en el sector." },
      { type: "p", text: "A diferencia de enfoques más laxos como el de Estados Unidos, la UE ha optado por un reglamento vinculante con sanciones significativas, similar al modelo del RGPD que en su día transformó la protección de datos a nivel mundial." },
      { type: "h2", text: "Los 4 niveles de riesgo" },
      { type: "p", text: "El AI Act clasifica los sistemas de IA en cuatro categorías de riesgo, cada una con obligaciones diferentes:" },
      { type: "h3", text: "1. Riesgo inaceptable (Prohibido) — Art. 5" },
      { type: "p", text: "Sistemas completamente prohibidos en la UE. Incluyen: manipulación subliminal, explotación de vulnerabilidades de personas, scoring social por parte de gobiernos, y reconocimiento facial en tiempo real en espacios públicos (con excepciones limitadas para seguridad)." },
      { type: "h3", text: "2. Alto riesgo — Anexo III" },
      { type: "p", text: "Sistemas que requieren evaluación de conformidad, documentación técnica exhaustiva y supervisión humana obligatoria. Incluyen IA en: identificación biométrica, infraestructuras críticas, educación, empleo, servicios esenciales, migración, administración de justicia, y aplicación de la ley." },
      { type: "ul", text: ["Evaluación de conformidad obligatoria", "Sistema de gestión de riesgos (Art. 9)", "Gobernanza de datos (Art. 10)", "Documentación técnica (Art. 11 + Anexo IV)", "Registro de actividades (Art. 12)", "Transparencia e información (Art. 13)", "Supervisión humana (Art. 14)", "Precisión, robustez y ciberseguridad (Art. 15)"] },
      { type: "h3", text: "3. Riesgo limitado — Art. 50" },
      { type: "p", text: "Sistemas con obligaciones de transparencia específicas. Los usuarios deben ser informados de que interactúan con una IA. Aplica a: chatbots, sistemas de generación de contenido (deepfakes), y sistemas de reconocimiento de emociones." },
      { type: "h3", text: "4. Riesgo mínimo" },
      { type: "p", text: "Sin obligaciones específicas, aunque se recomienda seguir códigos de conducta voluntarios. Ejemplos: filtros de spam, videojuegos con IA, herramientas de recomendación de contenido." },
      { type: "h2", text: "Plazos clave que debes conocer" },
      { type: "callout", text: "Las prácticas prohibidas (Art. 5) ya están en vigor desde febrero de 2025. No esperes." },
      { type: "ul", text: ["Febrero 2025: Prohibición de prácticas de IA inaceptables", "Agosto 2025: Obligaciones para IA de propósito general (GPAI)", "Agosto 2026: Obligaciones para sistemas de alto riesgo del Anexo III", "Agosto 2027: Obligaciones para alto riesgo del Anexo I (productos regulados)"] },
      { type: "h2", text: "¿Cómo afecta a las empresas españolas?" },
      { type: "p", text: "Si tu empresa opera en la UE y usa cualquier sistema de IA — ya sea desarrollado internamente o comprado a un tercero (como ChatGPT, Salesforce Einstein, HubSpot AI, etc.) — te aplica el AI Act. Esto incluye PYMEs, autónomos y grandes empresas." },
      { type: "p", text: "La AESIA (Agencia Española de Supervisión de la IA) ya está operativa como autoridad nacional de supervisión y ha publicado 16 guías prácticas para facilitar el cumplimiento." },
      { type: "h2", text: "Cómo prepararte: 5 pasos esenciales" },
      { type: "ul", text: ["Inventaría todos los sistemas de IA de tu organización (incluso los que no sabías que tenías)", "Clasifica cada sistema según su nivel de riesgo", "Genera la documentación técnica obligatoria para sistemas de alto riesgo", "Implementa mecanismos de supervisión humana", "Establece un sistema de monitorización continua"] },
      { type: "callout", text: "Con Audlex puedes completar estos 5 pasos en una tarde. Clasifica tu primer sistema gratis y genera toda la documentación de forma automática." },
    ],
  },
  "sistemas-ia-alto-riesgo-como-identificarlos": {
    title: "Sistemas de IA de Alto Riesgo: ¿Cómo identificar si tu empresa tiene alguno?",
    date: "2025-06-08",
    readTime: "8 min",
    category: "Compliance",
    categoryColor: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    content: [
      { type: "p", text: "Una de las preguntas más frecuentes que recibimos es: '¿Mi chatbot es de alto riesgo?', '¿Necesito documentar mi CRM?'. La respuesta depende del contexto de uso, y el Anexo III del EU AI Act es meridianamente claro en las categorías." },
      { type: "h2", text: "¿Qué hace que un sistema de IA sea de alto riesgo?" },
      { type: "p", text: "El Artículo 6 del AI Act establece dos vías por las que un sistema de IA puede ser considerado de alto riesgo:" },
      { type: "ul", text: ["Vía 1 (Anexo I): Si el sistema de IA es un componente de seguridad de un producto regulado por la legislación de la UE (juguetes, máquinas, dispositivos médicos, etc.)", "Vía 2 (Anexo III): Si el sistema se utiliza en alguna de las 8 áreas de alto riesgo listadas"] },
      { type: "h2", text: "Las 8 categorías de alto riesgo del Anexo III" },
      { type: "h3", text: "1. Identificación biométrica y categorización de personas" },
      { type: "p", text: "Reconocimiento facial, huellas dactilares, análisis de voz para identificar personas. Si usas control de acceso biométrico o fichaje por rostro, entra aquí." },
      { type: "h3", text: "2. Gestión y explotación de infraestructuras críticas" },
      { type: "p", text: "IA para gestionar redes de energía, agua, transporte o telecomunicaciones. Incluye mantenimiento predictivo en infraestructuras esenciales." },
      { type: "h3", text: "3. Educación y formación profesional" },
      { type: "p", text: "Sistemas que determinan acceso a instituciones educativas, evalúan estudiantes o detectan comportamiento prohibido durante exámenes." },
      { type: "h3", text: "4. Empleo, gestión de trabajadores y acceso al autoempleo" },
      { type: "p", text: "Esta es la categoría que más sorprende a las PYMEs. Incluye:" },
      { type: "ul", text: ["Filtrado o clasificación de CVs y candidaturas", "Publicación de ofertas de empleo dirigidas con IA", "Evaluación de candidatos en entrevistas", "Decisiones de ascenso, despido o asignación de tareas basadas en IA", "Monitorización del rendimiento de empleados"] },
      { type: "callout", text: "Si usas LinkedIn Recruiter, Workable, Factorial o cualquier herramienta de RRHH con IA para filtrar candidatos, tienes un sistema de alto riesgo." },
      { type: "h3", text: "5. Acceso a servicios públicos y privados esenciales" },
      { type: "p", text: "Scoring crediticio, evaluación de riesgo en seguros, priorización en servicios de emergencia, y sistemas que evalúen la elegibilidad para prestaciones públicas." },
      { type: "h3", text: "6. Aplicación de la ley" },
      { type: "p", text: "Sistemas de evaluación individual de riesgo de reincidencia, polígrafos con IA, análisis de pruebas, o perfilado de personas." },
      { type: "h3", text: "7. Migración, asilo y control de fronteras" },
      { type: "p", text: "Evaluación de riesgo de seguridad, verificación de autenticidad de documentos, o examen de solicitudes de asilo." },
      { type: "h3", text: "8. Administración de justicia y procesos democráticos" },
      { type: "p", text: "Sistemas que asistan a autoridades judiciales en investigar e interpretar hechos y la ley, o que influyan en resultados de elecciones." },
      { type: "h2", text: "Ejemplos prácticos para PYMEs" },
      { type: "p", text: "Veamos ejemplos concretos de sistemas que una PYME española podría estar usando sin saber que son de alto riesgo:" },
      { type: "ul", text: ["ChatGPT integrado en atención al cliente → Riesgo limitado (solo transparencia)", "HubSpot scoring de leads → Depende: si es B2B, generalmente riesgo limitado. Si afecta a consumidores para crédito o seguros, alto riesgo.", "Workable para filtrar CVs → Alto riesgo (categoría 4: empleo)", "Google Analytics 4 → Riesgo mínimo", "Factorial con módulo de evaluación de rendimiento IA → Alto riesgo si determina decisiones sobre empleados", "DeepL para traducción → Riesgo mínimo"] },
      { type: "h2", text: "¿Qué documentación necesitas?" },
      { type: "p", text: "Si tienes un sistema de alto riesgo, necesitarás preparar:" },
      { type: "ul", text: ["Sistema de gestión de riesgos (Art. 9)", "Plan de gobernanza de datos (Art. 10)", "Documentación técnica completa (Art. 11 + Anexo IV)", "Sistema de registro de actividades (Art. 12)", "Información de transparencia para usuarios (Art. 13)", "Protocolo de supervisión humana (Art. 14)", "Declaración de conformidad UE (Art. 47)", "Evaluación de impacto en derechos fundamentales (Art. 27, si eres deployer)"] },
      { type: "callout", text: "Audlex genera automáticamente estos 8+ documentos a partir de un cuestionario guiado. Ahorra semanas de trabajo legal y técnico." },
    ],
  },
  "multas-ai-act-como-evitarlas": {
    title: "Multas del AI Act: Hasta 35M€ — Cómo evitarlas con un plan de compliance",
    date: "2025-05-28",
    readTime: "10 min",
    category: "Legal",
    categoryColor: "bg-red-500/10 text-red-600 border-red-500/20",
    content: [
      { type: "p", text: "El régimen sancionador del EU AI Act es uno de los más severos de la legislación europea, comparable con el RGPD. Comprender las multas y cómo evitarlas es esencial para cualquier empresa que utilice IA." },
      { type: "h2", text: "Estructura de las sanciones" },
      { type: "p", text: "El AI Act establece tres niveles de sanciones, graduadas según la gravedad de la infracción:" },
      { type: "h3", text: "Nivel 1: Prácticas prohibidas — Hasta 35M€ o 7% facturación" },
      { type: "p", text: "Las multas más altas se reservan para las prácticas completamente prohibidas por el Artículo 5: manipulación subliminal, explotación de vulnerabilidades, scoring social estatal, y reconocimiento facial en tiempo real no autorizado. La sanción puede llegar a 35 millones de euros o el 7% de la facturación anual global (la mayor de las dos cifras)." },
      { type: "h3", text: "Nivel 2: Incumplimiento de sistemas de alto riesgo — Hasta 15M€ o 3%" },
      { type: "p", text: "Para empresas que incumplan las obligaciones previstas para sistemas de alto riesgo (documentación, supervisión humana, evaluación de conformidad, etc.), las multas pueden alcanzar 15 millones de euros o el 3% de la facturación global." },
      { type: "h3", text: "Nivel 3: Información incorrecta — Hasta 7.5M€ o 1.5%" },
      { type: "p", text: "Proporcionar información incorrecta o engañosa a las autoridades de supervisión puede suponer multas de hasta 7.5 millones de euros o el 1.5% de la facturación global." },
      { type: "callout", text: "Para PYMEs y startups, las multas se calculan como el menor entre la cantidad fija y el porcentaje. Aún así, 7.5M€ puede ser existencial para una PYME." },
      { type: "h2", text: "Factores agravantes y atenuantes" },
      { type: "p", text: "Las autoridades considerarán varios factores al determinar la cuantía de la sanción:" },
      { type: "h3", text: "Agravantes" },
      { type: "ul", text: ["Infracción deliberada o por negligencia grave", "Reincidencia", "No cooperación con la autoridad de supervisión", "Número de personas afectadas y gravedad del daño", "Duración de la infracción"] },
      { type: "h3", text: "Atenuantes" },
      { type: "ul", text: ["Medidas proactivas de compliance implementadas", "Cooperación activa con las autoridades", "Notificación voluntaria de la infracción", "Tamaño de la empresa (PYMEs tienen trato más favorable)", "Acciones correctivas inmediatas"] },
      { type: "callout", text: "Tener un plan de compliance documentado es el mejor atenuante posible. Demuestra diligencia debida y puede reducir significativamente las sanciones." },
      { type: "h2", text: "Plan de acción en 5 pasos para evitar multas" },
      { type: "h3", text: "Paso 1: Realiza un inventario de IA (ahora)" },
      { type: "p", text: "El primer paso es saber qué sistemas de IA usa tu organización. Muchas empresas se sorprenden al descubrir que usan más de 10 herramientas con IA sin haberlas catalogado. Haz un inventario completo." },
      { type: "h3", text: "Paso 2: Clasifica cada sistema por riesgo" },
      { type: "p", text: "Usa la metodología del AI Act para clasificar cada sistema. No adivines: sigue los criterios del Anexo III literalmente. Un sistema mal clasificado es peor que uno no clasificado." },
      { type: "h3", text: "Paso 3: Genera la documentación obligatoria" },
      { type: "p", text: "Para cada sistema de alto riesgo, necesitarás hasta 13 documentos diferentes. No tienen que ser perfectos el primer día, pero deben existir y demostrar esfuerzo de compliance." },
      { type: "h3", text: "Paso 4: Implementa supervisión humana" },
      { type: "p", text: "Designa responsables internos para cada sistema de IA de alto riesgo. Documenta los protocolos de intervención humana y los criterios de escalado." },
      { type: "h3", text: "Paso 5: Establece monitorización continua" },
      { type: "p", text: "El compliance no es un evento único — es un proceso continuo. Configura alertas para cambios regulatorios, vencimientos de documentación y revisiones periódicas." },
      { type: "h2", text: "¿Qué pasa si no hago nada?" },
      { type: "p", text: "Además de las multas económicas, las consecuencias incluyen: prohibición temporal o permanente de operar el sistema de IA en la UE, daño reputacional significativo, pérdida de confianza de clientes y socios, y responsabilidad civil frente a personas afectadas." },
      { type: "callout", text: "No esperes a agosto de 2026. Las prácticas prohibidas ya están en vigor. Audlex te permite completar los 5 pasos en una tarde. Empieza clasificando tu primer sistema gratis." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return { title: "Artículo no encontrado" };
  return {
    title: `${article.title} | Audlex Blog`,
    description: article.content.find((b) => b.type === "p")?.text as string,
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) notFound();

  return <BlogArticleContent article={article} />;
}
