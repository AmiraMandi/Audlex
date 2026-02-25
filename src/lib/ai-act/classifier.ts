/**
 * ============================================================
 * Audlex — Motor de Clasificación de Riesgo del EU AI Act
 * ============================================================
 * 
 * Este módulo implementa la lógica de clasificación de riesgo
 * basada en el Reglamento (UE) 2024/1689 (EU AI Act).
 * 
 * NO usa IA — es lógica determinista y verificable basada
 * en el texto literal del reglamento.
 * 
 * Fuentes:
 * - Artículo 5: Prácticas de IA prohibidas
 * - Artículo 6 + Anexo I: Sistemas de alto riesgo (productos regulados)
 * - Anexo III: Sistemas de alto riesgo (por área)
 * - Artículo 50: Obligaciones de transparencia (riesgo limitado)
 * - Guías AESIA (dic 2025): 16 guías de compliance
 * 
 * Bilingual: es/en — all user-facing text is locale-aware.
 */

import {
  type Locale,
  questionText,
  questionHelpText,
  optionLabels,
  prohibitionReasons as prohibitionReasonTexts,
  resultTexts,
  obligationTexts,
  highRiskRecommendations,
  limitedRiskRecommendations,
  highRiskExplanation,
} from "./classifier-i18n";

export type { Locale };

// ============================================================
// TYPES
// ============================================================

export type RiskLevel = "unacceptable" | "high" | "limited" | "minimal";

export interface ClassificationQuestion {
  id: string;
  text: string;
  helpText?: string;
  type: "boolean" | "single_choice" | "multi_choice";
  options?: { value: string; label: string }[];
  conditionalOn?: { questionId: string; value: string | boolean };
  articleReference?: string;
  weight: number;
}

export interface ClassificationAnswer {
  questionId: string;
  value: string | boolean | string[];
}

export interface ClassificationResult {
  riskLevel: RiskLevel;
  isProhibited: boolean;
  prohibitionReasons: string[];
  applicableArticles: string[];
  obligations: Obligation[];
  recommendations: string[];
  score: number;
  summary: string;
  detailedExplanation: string;
}

export interface Obligation {
  article: string;
  title: string;
  description: string;
  category: ObligationCategory;
  deadline: string;
  priority: "critical" | "high" | "medium" | "low";
  documentType?: string;
}

export type ObligationCategory =
  | "risk_management"
  | "data_governance"
  | "technical_documentation"
  | "transparency"
  | "human_oversight"
  | "accuracy_robustness"
  | "post_market_monitoring"
  | "registration"
  | "conformity_assessment"
  | "ai_literacy";

// ============================================================
// BASE QUESTION STRUCTURE (language-independent)
// ============================================================

interface BaseQuestion {
  id: string;
  type: "boolean" | "single_choice" | "multi_choice";
  optionValues?: string[];
  conditionalOn?: { questionId: string; value: string | boolean };
  articleReference?: string;
  weight: number;
}

const baseQuestions: BaseQuestion[] = [
  { id: "system_type", type: "single_choice", optionValues: ["chatbot", "content_generation", "decision_support", "autonomous_decision", "biometric", "scoring_profiling", "monitoring", "recommendation", "predictive_analytics", "automation", "other"], weight: 10 },
  { id: "sector", type: "single_choice", optionValues: ["employment_hr", "education", "healthcare", "finance_insurance", "law_enforcement", "justice", "migration", "critical_infrastructure", "public_services", "marketing", "customer_service", "retail", "manufacturing", "technology", "other"], weight: 15 },
  { id: "subliminal_manipulation", type: "boolean", articleReference: "Art. 5.1(a)", weight: 100 },
  { id: "vulnerability_exploitation", type: "boolean", articleReference: "Art. 5.1(b)", weight: 100 },
  { id: "social_scoring", type: "boolean", articleReference: "Art. 5.1(c)", weight: 100 },
  { id: "realtime_biometric_public", type: "boolean", articleReference: "Art. 5.1(h)", weight: 100 },
  { id: "emotion_recognition_prohibited", type: "boolean", articleReference: "Art. 5.1(f)", weight: 100 },
  { id: "facial_scraping", type: "boolean", articleReference: "Art. 5.1(e)", weight: 100 },
  { id: "biometric_identification", type: "boolean", articleReference: "Anexo III.1", weight: 80 },
  { id: "critical_infrastructure_safety", type: "boolean", articleReference: "Anexo III.2", weight: 80 },
  { id: "education_access", type: "boolean", articleReference: "Anexo III.3", weight: 80 },
  { id: "employment_decisions", type: "boolean", articleReference: "Anexo III.4", weight: 80 },
  { id: "essential_services_access", type: "boolean", articleReference: "Anexo III.5", weight: 80 },
  { id: "law_enforcement_use", type: "boolean", articleReference: "Anexo III.6", weight: 80 },
  { id: "migration_asylum", type: "boolean", articleReference: "Anexo III.7", weight: 80 },
  { id: "justice_democratic", type: "boolean", articleReference: "Anexo III.8", weight: 80 },
  { id: "processes_personal_data", type: "boolean", articleReference: "Art. 10", weight: 20 },
  { id: "personal_data_types", type: "multi_choice", optionValues: ["basic_identity", "financial", "health", "biometric", "genetic", "racial_ethnic", "political", "religious", "sexual_orientation", "criminal", "location", "behavioral", "minors"], conditionalOn: { questionId: "processes_personal_data", value: true }, articleReference: "Art. 10, RGPD Art. 9", weight: 25 },
  { id: "autonomous_decisions", type: "boolean", articleReference: "Art. 14", weight: 30 },
  { id: "number_affected", type: "single_choice", optionValues: ["few", "moderate", "large", "very_large"], weight: 15 },
  { id: "reversibility", type: "single_choice", optionValues: ["easily_reversible", "reversible_with_effort", "difficult_to_reverse", "irreversible"], weight: 20 },
  { id: "interacts_with_humans", type: "boolean", articleReference: "Art. 50.1", weight: 10 },
  { id: "generates_content", type: "boolean", articleReference: "Art. 50.2", weight: 10 },
  { id: "generates_deepfakes", type: "boolean", articleReference: "Art. 50.4", weight: 15 },
];

// ============================================================
// LEGACY EXPORT (Spanish, for backward compatibility)
// ============================================================

/** @deprecated Use getClassificationQuestions(locale) instead */
export const classificationQuestions: ClassificationQuestion[] = buildQuestions("es");

// ============================================================
// LOCALE-AWARE QUESTION BUILDER
// ============================================================

function buildQuestions(locale: Locale): ClassificationQuestion[] {
  return baseQuestions.map((bq) => {
    const text = questionText[bq.id]?.[locale] || questionText[bq.id]?.es || bq.id;
    const helpText = questionHelpText[bq.id]?.[locale] || undefined;
    const options = bq.optionValues?.map((v) => ({
      value: v,
      label: optionLabels[bq.id]?.[v]?.[locale] || optionLabels[bq.id]?.[v]?.es || v,
    }));

    return {
      id: bq.id,
      text,
      helpText,
      type: bq.type,
      options,
      conditionalOn: bq.conditionalOn,
      articleReference: bq.articleReference,
      weight: bq.weight,
    };
  });
}

/** Returns classification questions in the specified locale */
export function getClassificationQuestions(locale: Locale): ClassificationQuestion[] {
  return buildQuestions(locale);
}

// ============================================================
// MOTOR DE CLASIFICACIÓN
// ============================================================

export function classifyRisk(answers: ClassificationAnswer[], locale: Locale = "es"): ClassificationResult {
  const answerMap = new Map<string, string | boolean | string[]>();
  answers.forEach((a) => answerMap.set(a.questionId, a.value));

  // --- Paso 1: Comprobar prácticas PROHIBIDAS (Art. 5) ---
  const prohibitionCheckIds = [
    "subliminal_manipulation",
    "vulnerability_exploitation",
    "social_scoring",
    "realtime_biometric_public",
    "emotion_recognition_prohibited",
    "facial_scraping",
  ];

  const reasons: string[] = [];
  for (const id of prohibitionCheckIds) {
    if (answerMap.get(id) === true) {
      reasons.push(prohibitionReasonTexts[id]?.[locale] || prohibitionReasonTexts[id]?.es || id);
    }
  }

  if (reasons.length > 0) {
    return {
      riskLevel: "unacceptable",
      isProhibited: true,
      prohibitionReasons: reasons,
      applicableArticles: ["Art. 5"],
      obligations: getProhibitedObligations(locale),
      recommendations: resultTexts.unacceptable.recommendations[locale],
      score: 100,
      summary: resultTexts.unacceptable.summary[locale],
      detailedExplanation: resultTexts.unacceptable.detailedExplanation[locale],
    };
  }

  // --- Paso 2: Comprobar si es ALTO RIESGO (Anexo III) ---
  const highRiskChecks = [
    { id: "biometric_identification", article: "Anexo III.1" },
    { id: "critical_infrastructure_safety", article: "Anexo III.2" },
    { id: "education_access", article: "Anexo III.3" },
    { id: "employment_decisions", article: "Anexo III.4" },
    { id: "essential_services_access", article: "Anexo III.5" },
    { id: "law_enforcement_use", article: "Anexo III.6" },
    { id: "migration_asylum", article: "Anexo III.7" },
    { id: "justice_democratic", article: "Anexo III.8" },
  ];

  const highRiskArticles: string[] = [];
  for (const check of highRiskChecks) {
    if (answerMap.get(check.id) === true) {
      highRiskArticles.push(check.article);
    }
  }

  // Factores agravantes que elevan a alto riesgo
  let riskScore = 0;
  const autonomousDecisions = answerMap.get("autonomous_decisions") === true;
  const sensitiveData = (answerMap.get("personal_data_types") as string[] || [])
    .some(d => ["health", "biometric", "genetic", "racial_ethnic", "criminal", "minors"].includes(d));
  const irreversible = ["difficult_to_reverse", "irreversible"].includes(answerMap.get("reversibility") as string);
  const largeScale = ["large", "very_large"].includes(answerMap.get("number_affected") as string);

  if (autonomousDecisions) riskScore += 25;
  if (sensitiveData) riskScore += 20;
  if (irreversible) riskScore += 20;
  if (largeScale) riskScore += 15;

  if (highRiskArticles.length > 0) {
    const articles = ["Art. 6", "Art. 9", "Art. 10", "Art. 11", "Art. 12", "Art. 13", "Art. 14", "Art. 15", "Art. 27", "Art. 47", "Art. 72", ...highRiskArticles];
    return {
      riskLevel: "high",
      isProhibited: false,
      prohibitionReasons: [],
      applicableArticles: articles,
      obligations: getHighRiskObligations(highRiskArticles, answerMap, locale),
      recommendations: getHighRiskRecommendationsList(highRiskArticles, answerMap, locale),
      score: Math.min(60 + riskScore, 95),
      summary: resultTexts.high.summary[locale],
      detailedExplanation: generateHighRiskExplanationText(highRiskArticles, answerMap, locale),
    };
  }

  // Combinación de factores que podría elevar a alto riesgo
  if (riskScore >= 50 && !highRiskArticles.length) {
    return {
      riskLevel: "high",
      isProhibited: false,
      prohibitionReasons: [],
      applicableArticles: ["Art. 6.2", "Art. 9", "Art. 10", "Art. 11", "Art. 14"],
      obligations: getHighRiskObligations([], answerMap, locale),
      recommendations: resultTexts.highByFactors.recommendations[locale],
      score: riskScore + 20,
      summary: resultTexts.highByFactors.summary[locale],
      detailedExplanation: resultTexts.highByFactors.detailedExplanation[locale],
    };
  }

  // --- Paso 3: Comprobar RIESGO LIMITADO (Art. 50) ---
  const interactsWithHumans = answerMap.get("interacts_with_humans") === true;
  const generatesContent = answerMap.get("generates_content") === true;
  const generatesDeepfakes = answerMap.get("generates_deepfakes") === true;

  if (interactsWithHumans || generatesContent || generatesDeepfakes) {
    const limitedArticles = ["Art. 50"];
    const limitedObligations = getLimitedRiskObligations(answerMap, locale);
    const explanationMap = resultTexts.limited.detailedExplanation(interactsWithHumans, generatesContent, generatesDeepfakes);

    return {
      riskLevel: "limited",
      isProhibited: false,
      prohibitionReasons: [],
      applicableArticles: limitedArticles,
      obligations: limitedObligations,
      recommendations: getLimitedRiskRecommendationsList(answerMap, locale),
      score: 20 + (generatesDeepfakes ? 15 : 0) + (riskScore / 4),
      summary: resultTexts.limited.summary[locale],
      detailedExplanation: explanationMap[locale],
    };
  }

  // --- Paso 4: RIESGO MÍNIMO ---
  return {
    riskLevel: "minimal",
    isProhibited: false,
    prohibitionReasons: [],
    applicableArticles: ["Art. 4"],
    obligations: getMinimalRiskObligations(locale),
    recommendations: resultTexts.minimal.recommendations[locale],
    score: Math.max(5, riskScore / 5),
    summary: resultTexts.minimal.summary[locale],
    detailedExplanation: resultTexts.minimal.detailedExplanation[locale],
  };
}

// ============================================================
// OBLIGACIONES POR NIVEL DE RIESGO
// ============================================================

function getProhibitedObligations(locale: Locale): Obligation[] {
  const t = obligationTexts.prohibited_cessation;
  return [{
    article: "Art. 5",
    title: t.title[locale],
    description: t.description[locale],
    category: "risk_management",
    deadline: t.deadline[locale],
    priority: "critical",
  }];
}

function getHighRiskObligations(
  highRiskArticles: string[],
  answers: Map<string, string | boolean | string[]>,
  locale: Locale
): Obligation[] {
  const o = obligationTexts;
  const obligations: Obligation[] = [
    {
      article: "Art. 9",
      title: o.art9_risk_management.title[locale],
      description: o.art9_risk_management.description[locale],
      category: "risk_management",
      deadline: o.art9_risk_management.deadline[locale],
      priority: "critical",
      documentType: "risk_management",
    },
    {
      article: "Art. 10",
      title: o.art10_data_governance.title[locale],
      description: o.art10_data_governance.description[locale],
      category: "data_governance",
      deadline: o.art10_data_governance.deadline[locale],
      priority: "critical",
      documentType: "data_governance",
    },
    {
      article: "Art. 11 + Anexo IV",
      title: o.art11_technical_doc.title[locale],
      description: o.art11_technical_doc.description[locale],
      category: "technical_documentation",
      deadline: o.art11_technical_doc.deadline[locale],
      priority: "critical",
      documentType: "technical_file",
    },
    {
      article: "Art. 12",
      title: o.art12_logging.title[locale],
      description: o.art12_logging.description[locale],
      category: "transparency",
      deadline: o.art12_logging.deadline[locale],
      priority: "high",
      documentType: "activity_logging",
    },
    {
      article: "Art. 13",
      title: o.art13_transparency.title[locale],
      description: o.art13_transparency.description[locale],
      category: "transparency",
      deadline: o.art13_transparency.deadline[locale],
      priority: "high",
      documentType: "instructions_for_use",
    },
    {
      article: "Art. 14",
      title: o.art14_human_oversight.title[locale],
      description: o.art14_human_oversight.description[locale],
      category: "human_oversight",
      deadline: o.art14_human_oversight.deadline[locale],
      priority: "critical",
      documentType: "human_oversight",
    },
    {
      article: "Art. 15",
      title: o.art15_accuracy.title[locale],
      description: o.art15_accuracy.description[locale],
      category: "accuracy_robustness",
      deadline: o.art15_accuracy.deadline[locale],
      priority: "high",
    },
    {
      article: "Art. 27",
      title: o.art27_fria.title[locale],
      description: o.art27_fria.description[locale],
      category: "risk_management",
      deadline: o.art27_fria.deadline[locale],
      priority: "critical",
      documentType: "impact_assessment",
    },
    {
      article: "Art. 47",
      title: o.art47_conformity.title[locale],
      description: o.art47_conformity.description[locale],
      category: "conformity_assessment",
      deadline: o.art47_conformity.deadline[locale],
      priority: "high",
      documentType: "conformity_declaration",
    },
    {
      article: "Art. 49",
      title: o.art49_registration.title[locale],
      description: o.art49_registration.description[locale],
      category: "registration",
      deadline: o.art49_registration.deadline[locale],
      priority: "high",
    },
    {
      article: "Art. 72",
      title: o.art72_post_market.title[locale],
      description: o.art72_post_market.description[locale],
      category: "post_market_monitoring",
      deadline: o.art72_post_market.deadline[locale],
      priority: "high",
      documentType: "post_market_monitoring",
    },
    {
      article: "Art. 4",
      title: o.art4_literacy.title[locale],
      description: o.art4_literacy.description[locale],
      category: "ai_literacy",
      deadline: o.art4_literacy.deadline[locale],
      priority: "medium",
    },
  ];

  return obligations;
}

function getLimitedRiskObligations(
  answers: Map<string, string | boolean | string[]>,
  locale: Locale
): Obligation[] {
  const obligations: Obligation[] = [];
  const o = obligationTexts;

  if (answers.get("interacts_with_humans") === true) {
    obligations.push({
      article: "Art. 50.1",
      title: o.art50_1_interaction.title[locale],
      description: o.art50_1_interaction.description[locale],
      category: "transparency",
      deadline: o.art50_1_interaction.deadline[locale],
      priority: "high",
      documentType: "transparency_notice",
    });
  }

  if (answers.get("generates_content") === true) {
    obligations.push({
      article: "Art. 50.2",
      title: o.art50_2_content.title[locale],
      description: o.art50_2_content.description[locale],
      category: "transparency",
      deadline: o.art50_2_content.deadline[locale],
      priority: "high",
      documentType: "content_labeling_policy",
    });
  }

  if (answers.get("generates_deepfakes") === true) {
    obligations.push({
      article: "Art. 50.4",
      title: o.art50_4_deepfakes.title[locale],
      description: o.art50_4_deepfakes.description[locale],
      category: "transparency",
      deadline: o.art50_4_deepfakes.deadline[locale],
      priority: "critical",
      documentType: "content_labeling_policy",
    });
  }

  obligations.push({
    article: "Art. 4",
    title: o.art4_literacy_limited.title[locale],
    description: o.art4_literacy_limited.description[locale],
    category: "ai_literacy",
    deadline: o.art4_literacy_limited.deadline[locale],
    priority: "medium",
  });

  return obligations;
}

function getMinimalRiskObligations(locale: Locale): Obligation[] {
  const o = obligationTexts;
  return [
    {
      article: "Art. 4",
      title: o.art4_literacy_general.title[locale],
      description: o.art4_literacy_general.description[locale],
      category: "ai_literacy",
      deadline: o.art4_literacy_general.deadline[locale],
      priority: "medium",
    },
    {
      article: locale === "en" ? "Voluntary" : "Voluntario",
      title: o.voluntary_code.title[locale],
      description: o.voluntary_code.description[locale],
      category: "transparency",
      deadline: o.voluntary_code.deadline[locale],
      priority: "low",
    },
  ];
}

// ============================================================
// RECOMENDACIONES
// ============================================================

function getHighRiskRecommendationsList(
  articles: string[],
  answers: Map<string, string | boolean | string[]>,
  locale: Locale
): string[] {
  const recs: string[] = [...highRiskRecommendations.base[locale]];

  if (answers.get("employment_decisions") === true) {
    recs.push(highRiskRecommendations.employment[locale]);
  }
  if (answers.get("essential_services_access") === true) {
    recs.push(highRiskRecommendations.essentialServices[locale]);
  }
  if (answers.get("processes_personal_data") === true) {
    recs.push(highRiskRecommendations.personalData[locale]);
  }

  recs.push(highRiskRecommendations.registration[locale]);
  recs.push(highRiskRecommendations.sandbox[locale]);

  return recs;
}

function getLimitedRiskRecommendationsList(
  answers: Map<string, string | boolean | string[]>,
  locale: Locale
): string[] {
  const recs: string[] = [limitedRiskRecommendations.base[locale]];

  if (answers.get("generates_content") === true) {
    recs.push(limitedRiskRecommendations.contentMarking[locale]);
    recs.push(limitedRiskRecommendations.policyUpdate[locale]);
  }

  recs.push(limitedRiskRecommendations.training[locale]);
  recs.push(limitedRiskRecommendations.documentation[locale]);

  return recs;
}

function generateHighRiskExplanationText(
  articles: string[],
  answers: Map<string, string | boolean | string[]>,
  locale: Locale
): string {
  const h = highRiskExplanation;
  const parts: string[] = [
    h.intro[locale],
    "",
    h.areasTitle[locale],
  ];

  articles.forEach(a => {
    if (h.areaMap[a]) parts.push(`• ${h.areaMap[a][locale]}`);
  });

  parts.push("");
  parts.push(h.obligationsSummary[locale]);
  parts.push("");
  parts.push(h.deadlineWarning[locale]);

  return parts.join("\n");
}

// ============================================================
// UTILIDADES
// ============================================================

/** Devuelve solo las preguntas visibles según las respuestas actuales */
export function getVisibleQuestions(answers: ClassificationAnswer[], locale: Locale = "es"): ClassificationQuestion[] {
  const answerMap = new Map<string, string | boolean | string[]>();
  answers.forEach((a) => answerMap.set(a.questionId, a.value));

  const questions = buildQuestions(locale);
  return questions.filter((q) => {
    if (!q.conditionalOn) return true;
    return answerMap.get(q.conditionalOn.questionId) === q.conditionalOn.value;
  });
}

/** Calcula el progreso del cuestionario */
export function getProgress(answers: ClassificationAnswer[]): number {
  const visible = getVisibleQuestions(answers);
  const answered = answers.filter((a) => a.value !== undefined && a.value !== "").length;
  return visible.length > 0 ? Math.round((answered / visible.length) * 100) : 0;
}

/** Comprueba si se puede ejecutar la clasificación */
export function canClassify(answers: ClassificationAnswer[]): boolean {
  const required = ["system_type", "sector"];
  return required.every((id) => answers.some((a) => a.questionId === id && a.value !== undefined && a.value !== ""));
}
