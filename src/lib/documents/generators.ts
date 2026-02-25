/**
 * ============================================================
 * Audlex — Bilingual Document Generation Engine (ES / EN)
 * ============================================================
 *
 * Generates structured compliance documents based on the EU AI Act:
 * - Fundamental Rights Impact Assessment (FRIA) - Art. 27
 * - Risk Management Plan - Art. 9
 * - AI System Technical File - Art. 11 + Annex IV
 * - EU Declaration of Conformity - Art. 47
 * - Human Oversight Protocol - Art. 14
 * - Transparency Notice - Art. 50
 * - Data Governance Plan - Art. 10
 * - Post-Market Monitoring Plan - Art. 72
 * - Organisation AI Usage Policy - Corporate
 * - AI Systems Inventory - Art. 4
 *
 * Every user-visible string supports both Spanish (es) and
 * English (en) via a `locale` parameter that defaults to "es"
 * for backward compatibility.
 */

import type { AiSystem, RiskAssessment, Organization, Obligation } from "@/lib/db/schema";
import {
  type Locale,
  templateTitles,
  templateDescriptions,
  markdownLabels,
  commonLabels,
} from "./generators-i18n";

// Re-export the Locale type so consumers can import from this file
export type { Locale };

// ============================================================
// TYPES
// ============================================================

export type DocumentTemplateType =
  | "impact_assessment"
  | "risk_management"
  | "technical_file"
  | "conformity_declaration"
  | "human_oversight"
  | "transparency_notice"
  | "data_governance"
  | "post_market_monitoring"
  | "ai_usage_policy"
  | "ai_inventory";

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  subsections?: DocumentSection[];
}

export interface GeneratedDocument {
  type: DocumentTemplateType;
  title: string;
  version: string;
  generatedAt: string;
  organization: {
    name: string;
    cif?: string;
    sector?: string;
  };
  system?: {
    name: string;
    category: string;
    purpose: string;
    provider?: string;
  };
  riskLevel?: string;
  sections: DocumentSection[];
  metadata: {
    articleReference: string;
    deadline: string;
    applicableTo: string[];
    requiredForRiskLevel: string[];
  };
}

// ============================================================
// DOCUMENT TEMPLATES METADATA
// ============================================================

interface DocumentTemplateMeta {
  title: string;
  description: string;
  articleReference: string;
  deadline: string;
  requiredForRiskLevel: string[];
  estimatedTime: string;
}

/**
 * Returns localised document template metadata.
 */
export function getDocumentTemplates(locale: Locale): Record<DocumentTemplateType, DocumentTemplateMeta> {
  return {
    impact_assessment: {
      title: templateTitles.impact_assessment[locale],
      description: templateDescriptions.impact_assessment[locale],
      articleReference: "Art. 27",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      requiredForRiskLevel: ["high"],
      estimatedTime: "15-20 min",
    },
    risk_management: {
      title: templateTitles.risk_management[locale],
      description: templateDescriptions.risk_management[locale],
      articleReference: "Art. 9",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      requiredForRiskLevel: ["high"],
      estimatedTime: "20-30 min",
    },
    technical_file: {
      title: templateTitles.technical_file[locale],
      description: templateDescriptions.technical_file[locale],
      articleReference: "Art. 11 + Anexo IV",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      requiredForRiskLevel: ["high"],
      estimatedTime: "25-35 min",
    },
    conformity_declaration: {
      title: templateTitles.conformity_declaration[locale],
      description: templateDescriptions.conformity_declaration[locale],
      articleReference: "Art. 47",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      requiredForRiskLevel: ["high"],
      estimatedTime: "5-10 min",
    },
    human_oversight: {
      title: templateTitles.human_oversight[locale],
      description: templateDescriptions.human_oversight[locale],
      articleReference: "Art. 14",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      requiredForRiskLevel: ["high"],
      estimatedTime: "15-20 min",
    },
    transparency_notice: {
      title: templateTitles.transparency_notice[locale],
      description: templateDescriptions.transparency_notice[locale],
      articleReference: "Art. 50",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      requiredForRiskLevel: ["high", "limited"],
      estimatedTime: "10-15 min",
    },
    data_governance: {
      title: templateTitles.data_governance[locale],
      description: templateDescriptions.data_governance[locale],
      articleReference: "Art. 10",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      requiredForRiskLevel: ["high"],
      estimatedTime: "20-25 min",
    },
    post_market_monitoring: {
      title: templateTitles.post_market_monitoring[locale],
      description: templateDescriptions.post_market_monitoring[locale],
      articleReference: "Art. 72",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      requiredForRiskLevel: ["high"],
      estimatedTime: "15-20 min",
    },
    ai_usage_policy: {
      title: templateTitles.ai_usage_policy[locale],
      description: templateDescriptions.ai_usage_policy[locale],
      articleReference: locale === "en" ? "Art. 4 (AI Literacy)" : "Art. 4 (Alfabetización IA)",
      deadline: locale === "en" ? "2 February 2025 (already in force)" : "2 febrero 2025 (ya vigente)",
      requiredForRiskLevel: ["high", "limited", "minimal"],
      estimatedTime: "15-20 min",
    },
    ai_inventory: {
      title: templateTitles.ai_inventory[locale],
      description: templateDescriptions.ai_inventory[locale],
      articleReference: "Art. 4",
      deadline: locale === "en" ? "2 February 2025 (already in force)" : "2 febrero 2025 (ya vigente)",
      requiredForRiskLevel: ["high", "limited", "minimal"],
      estimatedTime: "10-15 min",
    },
  };
}

/**
 * @deprecated Use `getDocumentTemplates("es")` instead. Kept for backward compatibility.
 */
export const documentTemplates: Record<DocumentTemplateType, DocumentTemplateMeta> = getDocumentTemplates("es");

// ============================================================
// HELPERS
// ============================================================

function formatDate(date: Date = new Date(), locale: Locale = "es"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildOrganizationInfo(org: Organization) {
  return {
    name: org.name,
    cif: org.cifNif || undefined,
    sector: org.sector || undefined,
  };
}

function buildSystemInfo(system: AiSystem) {
  return {
    name: system.name,
    category: system.category,
    purpose: system.purpose,
    provider: system.provider || undefined,
  };
}

// ============================================================
// DOCUMENT GENERATORS
// ============================================================

// --- FRIA (Impact Assessment) ---
export function generateImpactAssessment(
  org: Organization,
  system: AiSystem,
  assessment?: RiskAssessment | null,
  locale: Locale = "es"
): GeneratedDocument {
  const obligations = (assessment?.obligations as Obligation[]) || [];
  const dataTypes = (system.dataTypes as string[]) || [];
  const affected = (system.affectedPersons as string[]) || [];
  const ns = commonLabels.notSpecified[locale];
  const complete = commonLabels.complete[locale];

  return {
    type: "impact_assessment",
    title: locale === "en"
      ? `Fundamental Rights Impact Assessment — ${system.name}`
      : `Evaluación de Impacto de Derechos Fundamentales — ${system.name}`,
    version: "1.0",
    generatedAt: formatDate(new Date(), locale),
    organization: buildOrganizationInfo(org),
    system: buildSystemInfo(system),
    riskLevel: assessment?.riskLevel || commonLabels.unclassified[locale],
    metadata: {
      articleReference: "Art. 27",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      applicableTo: ["high"],
      requiredForRiskLevel: ["high"],
    },
    sections: [
      {
        id: "1",
        title: locale === "en"
          ? "1. AI System Identification"
          : "1. Identificación del Sistema de IA",
        content: locale === "en"
          ? `
**System name:** ${system.name}
**Provider:** ${system.provider || ns}
**Model/Version:** ${system.providerModel || ns}
**Category:** ${system.category}
**Purpose:** ${system.purpose}
**Status:** ${system.status}
**Deployment date:** ${system.deploymentDate || ns}

**Detailed description:**
${system.description || commonLabels.noDescription[locale]}
          `.trim()
          : `
**Nombre del sistema:** ${system.name}
**Proveedor:** ${system.provider || ns}
**Modelo/Versión:** ${system.providerModel || ns}
**Categoría:** ${system.category}
**Propósito:** ${system.purpose}
**Estado:** ${system.status}
**Fecha de despliegue:** ${system.deploymentDate || "No especificada"}

**Descripción detallada:**
${system.description || commonLabels.noDescription[locale]}
          `.trim(),
      },
      {
        id: "2",
        title: locale === "en"
          ? "2. Determined Risk Level"
          : "2. Nivel de Riesgo Determinado",
        content: locale === "en"
          ? `
**Risk level:** ${assessment?.riskLevel ? assessment.riskLevel.toUpperCase() : commonLabels.pendingClassification[locale]}
**Risk score:** ${assessment?.assessmentScore ?? "N/A"}/100
**Is prohibited system:** ${assessment?.isProhibited ? "YES" : "No"}
${assessment?.prohibitionReason ? `**Prohibition reason:** ${assessment.prohibitionReason}` : ""}

**Applicable articles:** ${(assessment?.applicableArticles as string[])?.join(", ") || commonLabels.pendingEval[locale]}
          `.trim()
          : `
**Nivel de riesgo:** ${assessment?.riskLevel ? assessment.riskLevel.toUpperCase() : commonLabels.pendingClassification[locale]}
**Puntuación de riesgo:** ${assessment?.assessmentScore ?? "N/A"}/100
**Es sistema prohibido:** ${assessment?.isProhibited ? "SÍ" : "No"}
${assessment?.prohibitionReason ? `**Motivo de prohibición:** ${assessment.prohibitionReason}` : ""}

**Artículos aplicables:** ${(assessment?.applicableArticles as string[])?.join(", ") || commonLabels.pendingEval[locale]}
          `.trim(),
      },
      {
        id: "3",
        title: locale === "en"
          ? "3. Processed Data"
          : "3. Datos Procesados",
        content: locale === "en"
          ? `
**Data types processed:**
${dataTypes.length > 0 ? dataTypes.map(d => `- ${d}`).join("\n") : "- Not specified"}

**Data volume:** ${system.dataVolume || ns}

**Legal basis for personal data processing:**
Data processing is carried out in accordance with the GDPR and applicable data protection laws. The specific legal basis for each type of processed data must be verified.
          `.trim()
          : `
**Tipos de datos tratados:**
${dataTypes.length > 0 ? dataTypes.map(d => `- ${d}`).join("\n") : "- No especificados"}

**Volumen de datos:** ${system.dataVolume || ns}

**Base de legitimación para el tratamiento de datos personales:**
El tratamiento de datos se realiza conforme al RGPD y las leyes de protección de datos aplicables. Se debe verificar la base legal específica para cada tipo de dato procesado.
          `.trim(),
      },
      {
        id: "4",
        title: locale === "en"
          ? "4. Affected Persons"
          : "4. Personas Afectadas",
        content: locale === "en"
          ? `
**Categories of affected persons:**
${affected.length > 0 ? affected.map(a => `- ${a}`).join("\n") : "- Not specified"}

**Estimated number of affected persons:** ${system.numberOfAffected || commonLabels.notEstimated[locale]}

**Identified vulnerable groups:**
${affected.includes("minors") ? "- WARNING: Minors have been identified as affected persons. This requires reinforced protection measures.\n" : ""}${affected.includes("patients") ? "- WARNING: Patients have been identified. Health data requires special protection.\n" : ""}${affected.includes("job_applicants") ? "- WARNING: Job applicants have been identified. The system may fall under high risk per Annex III.4.\n" : ""}${!affected.includes("minors") && !affected.includes("patients") && !affected.includes("job_applicants") ? "No particularly vulnerable groups have been identified." : ""}
          `.trim()
          : `
**Categorías de personas afectadas:**
${affected.length > 0 ? affected.map(a => `- ${a}`).join("\n") : "- No especificadas"}

**Número estimado de personas afectadas:** ${system.numberOfAffected || commonLabels.notEstimated[locale]}

**Grupos vulnerables identificados:**
${affected.includes("minors") ? "- ATENCIÓN: Se identifican menores de edad como personas afectadas. Esto requiere medidas de protección reforzadas.\n" : ""}${affected.includes("patients") ? "- ATENCIÓN: Se identifican pacientes. Datos de salud requieren protección especial.\n" : ""}${affected.includes("job_applicants") ? "- ATENCIÓN: Se identifican candidatos a empleo. El sistema puede caer en alto riesgo según Anexo III.4.\n" : ""}${!affected.includes("minors") && !affected.includes("patients") && !affected.includes("job_applicants") ? "No se han identificado grupos especialmente vulnerables." : ""}
          `.trim(),
      },
      {
        id: "5",
        title: locale === "en"
          ? "5. Fundamental Rights Impact Assessment"
          : "5. Evaluación de Impacto en Derechos Fundamentales",
        content: locale === "en"
          ? `
**5.1 Right to non-discrimination (Art. 21 CFREU)**
${system.isAutonomousDecision ? "HIGH RISK: The system makes autonomous decisions, increasing the risk of algorithmic discrimination. Regular bias audits must be implemented." : "Moderate risk: The system has human oversight, which partially mitigates the risk of discrimination."}

**5.2 Right to the protection of personal data (Art. 8 CFREU)**
${dataTypes.includes("sensitive_data") || dataTypes.includes("biometric_data") ? "HIGH RISK: The system processes sensitive / biometric data. Reinforced protection measures are required." : "Standard risk: Compliance in accordance with the GDPR and national legislation."}

**5.3 Right to equality before the law (Art. 20 CFREU)**
Periodically assess that the system does not produce discriminatory results based on origin, gender, orientation, disability or other protected factors.

**5.4 Right to human dignity (Art. 1 CFREU)**
${system.category === "biometric" || system.category === "monitoring" ? "WARNING: Biometric or surveillance systems require special attention to respect for human dignity." : "No specific elevated risks to human dignity have been identified for the described use."}

**5.5 Right to an effective remedy (Art. 47 CFREU)**
It must be ensured that persons affected by AI system decisions can challenge those decisions and obtain explanations about the process.
          `.trim()
          : `
**5.1 Derecho a la no discriminación (Art. 21 CDFUE)**
${system.isAutonomousDecision ? "RIESGO ELEVADO: El sistema toma decisiones autónomas, lo que incrementa el riesgo de discriminación algorítmica. Se deben implementar auditorías de sesgo regulares." : "Riesgo moderado: El sistema cuenta con supervisión humana que mitiga parcialmente el riesgo de discriminación."}

**5.2 Derecho a la protección de datos personales (Art. 8 CDFUE)**
${dataTypes.includes("sensitive_data") || dataTypes.includes("biometric_data") ? "RIESGO ELEVADO: El sistema procesa datos sensibles/biométricos. Se requieren medidas reforzadas de protección." : "Riesgo estándar: Cumplimiento conforme al RGPD y normativa nacional."}

**5.3 Derecho a la igualdad ante la ley (Art. 20 CDFUE)**
Evaluar periódicamente que el sistema no genere resultados discriminatorios basados en origen, género, orientación, discapacidad u otros factores protegidos.

**5.4 Derecho a la dignidad humana (Art. 1 CDFUE)**
${system.category === "biometric" || system.category === "monitoring" ? "ATENCIÓN: Los sistemas biométricos o de vigilancia requieren especial atención al respeto de la dignidad humana." : "No se identifican riesgos específicos elevados para la dignidad humana en el uso descrito."}

**5.5 Derecho a la tutela judicial efectiva (Art. 47 CDFUE)**
Se debe garantizar que las personas afectadas por decisiones del sistema de IA puedan impugnar dichas decisiones y obtener explicaciones sobre el proceso.
          `.trim(),
      },
      {
        id: "6",
        title: locale === "en"
          ? "6. Mitigation Measures"
          : "6. Medidas de Mitigación",
        content: locale === "en"
          ? `
**6.1 Human oversight:**
${system.hasHumanOversight ? "- The system has active human oversight.\n- It is recommended to document the intervention procedures." : "- ACTION REQUIRED: Implement an effective human oversight mechanism.\n- Designate oversight personnel.\n- Establish intervention protocols."}

**6.2 Transparency:**
- Inform affected persons that they are interacting with an AI system.
- Provide understandable explanations about the system's decisions.
- Maintain a record of decisions taken.

**6.3 Bias prevention:**
- Conduct periodic bias and discrimination audits.
- Document the fairness metrics used.
- Establish acceptability thresholds for fairness metrics.

**6.4 Safety and robustness:**
- Implement safeguards against adversarial manipulation.
- Ensure the system's accuracy and reliability.
- Establish contingency procedures.
          `.trim()
          : `
**6.1 Supervisión humana:**
${system.hasHumanOversight ? "- El sistema cuenta con supervisión humana activa.\n- Se recomienda documentar los procedimientos de intervención." : "- ACCIÓN REQUERIDA: Implementar mecanismo de supervisión humana efectiva.\n- Designar responsables de supervisión.\n- Establecer protocolos de intervención."}

**6.2 Transparencia:**
- Informar a las personas afectadas de que interactúan con un sistema de IA.
- Proporcionar explicaciones comprensibles sobre las decisiones del sistema.
- Mantener registro de las decisiones tomadas.

**6.3 Prevención de sesgos:**
- Realizar auditorías periódicas de sesgo y discriminación.
- Documentar las métricas de equidad utilizadas.
- Establecer umbrales de aceptabilidad para métricas de equidad.

**6.4 Seguridad y robustez:**
- Implementar medidas contra manipulación adversaria.
- Garantizar la precisión y fiabilidad del sistema.
- Establecer procedimientos de contingencia.
          `.trim(),
      },
      {
        id: "7",
        title: locale === "en"
          ? "7. Identified Compliance Obligations"
          : "7. Obligaciones de Compliance Identificadas",
        content: obligations.length > 0
          ? obligations.map((o, i) =>
              locale === "en"
                ? `**${i + 1}. ${o.title}** (${o.article})\n${o.description}\n- Priority: ${o.priority}\n- Deadline: ${o.deadline}`
                : `**${i + 1}. ${o.title}** (${o.article})\n${o.description}\n- Prioridad: ${o.priority}\n- Fecha límite: ${o.deadline}`
            ).join("\n\n")
          : locale === "en"
            ? "Pending system classification to determine specific obligations."
            : "Pendiente de clasificación del sistema para determinar obligaciones específicas.",
      },
      {
        id: "8",
        title: locale === "en"
          ? "8. Conclusions and Action Plan"
          : "8. Conclusiones y Plan de Acción",
        content: locale === "en"
          ? `
**General conclusion:**
This document contains the fundamental rights impact assessment for the system "${system.name}" in accordance with Article 27 of Regulation (EU) 2024/1689 (EU AI Act).

**Immediate actions required:**
1. Review and complete all information marked as "not specified"
2. Implement the identified mitigation measures
3. Establish a schedule for periodic reviews
4. Communicate the results to the responsible persons
5. Update this document when there are significant changes

**Next review:** It is recommended to review this assessment within a maximum period of 6 months or when significant changes are made to the system.

**Date of preparation:** ${formatDate(new Date(), locale)}
**Responsible person:** [Complete with the name of the responsible person]
**Signature:** ____________________
          `.trim()
          : `
**Conclusión general:**
Este documento recoge la evaluación de impacto en derechos fundamentales del sistema "${system.name}" conforme al Artículo 27 del Reglamento (UE) 2024/1689 (EU AI Act).

**Acciones inmediatas requeridas:**
1. Revisar y completar toda la información marcada como "no especificada"
2. Implementar las medidas de mitigación identificadas
3. Establecer un calendario de revisiones periódicas
4. Comunicar los resultados a las personas responsables
5. Actualizar este documento cuando haya cambios significativos

**Próxima revisión:** Se recomienda revisar esta evaluación en un plazo máximo de 6 meses o cuando se realicen cambios significativos en el sistema.

**Fecha de elaboración:** ${formatDate(new Date(), locale)}
**Responsable:** [Completar con el nombre del responsable]
**Firma:** ____________________
          `.trim(),
      },
    ],
  };
}

// --- Risk Management Plan ---
export function generateRiskManagement(
  org: Organization,
  system: AiSystem,
  assessment?: RiskAssessment | null,
  locale: Locale = "es"
): GeneratedDocument {
  const obligations = (assessment?.obligations as Obligation[]) || [];
  const complete = commonLabels.complete[locale];

  return {
    type: "risk_management",
    title: locale === "en"
      ? `Risk Management Plan — ${system.name}`
      : `Plan de Gestión de Riesgos — ${system.name}`,
    version: "1.0",
    generatedAt: formatDate(new Date(), locale),
    organization: buildOrganizationInfo(org),
    system: buildSystemInfo(system),
    riskLevel: assessment?.riskLevel || commonLabels.unclassified[locale],
    metadata: {
      articleReference: "Art. 9",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      applicableTo: ["high"],
      requiredForRiskLevel: ["high"],
    },
    sections: [
      {
        id: "1",
        title: locale === "en"
          ? "1. Purpose and Scope"
          : "1. Objeto y Alcance",
        content: locale === "en"
          ? `
This Risk Management Plan establishes the risk management system for the AI system "${system.name}" of ${org.name}, in accordance with Article 9 of Regulation (EU) 2024/1689.

The risk management system must:
a) Consist of a continuous iterative process carried out throughout the entire lifecycle of the system.
b) Require periodic and systematic updates.
c) Include the identification, estimation, evaluation and mitigation of risks.
          `.trim()
          : `
Este Plan de Gestión de Riesgos establece el sistema de gestión de riesgos para el sistema de IA "${system.name}" de ${org.name}, conforme al Artículo 9 del Reglamento (UE) 2024/1689.

El sistema de gestión de riesgos debe:
a) Consistir en un proceso iterativo continuo ejecutado durante todo el ciclo de vida del sistema.
b) Requerir actualizaciones periódicas y sistemáticas.
c) Incluir la identificación, estimación, evaluación y mitigación de riesgos.
          `.trim(),
      },
      {
        id: "2",
        title: locale === "en"
          ? "2. Risk Identification"
          : "2. Identificación de Riesgos",
        content: locale === "en"
          ? `
**2.1 Known and foreseeable risks:**
- Risk of bias and discrimination in results
- Risk of technical failure or unavailability
- Risk of misuse or use outside the intended purpose
- Risk of negative impact on fundamental rights
${system.isAutonomousDecision ? "- HIGH RISK: Autonomous decisions without human intervention\n" : ""}${!system.hasHumanOversight ? "- HIGH RISK: Absence of human oversight\n" : ""}

**2.2 Risks arising from intended use:**
The system is used for: ${system.purpose}
Specific risks arising from this use must be assessed based on the operational context.

**2.3 Risks of reasonably foreseeable misuse:**
- Use in contexts not foreseen by the designer
- Application to categories of persons not contemplated
- Excessive reliance on the system's results
          `.trim()
          : `
**2.1 Riesgos conocidos y previsibles:**
- Riesgo de sesgo y discriminación en resultados
- Riesgo de fallo técnico o indisponibilidad
- Riesgo de uso indebido o fuera del propósito previsto
- Riesgo de impacto negativo en derechos fundamentales
${system.isAutonomousDecision ? "- RIESGO ALTO: Decisiones autónomas sin intervención humana\n" : ""}${!system.hasHumanOversight ? "- RIESGO ALTO: Ausencia de supervisión humana\n" : ""}

**2.2 Riesgos derivados del uso previsto:**
El sistema se utiliza para: ${system.purpose}
Riesgos específicos derivados de este uso deben evaluarse en función del contexto operativo.

**2.3 Riesgos de uso indebido razonablemente previsible:**
- Uso en contextos no previstos por el diseñador
- Aplicación a categorías de personas no contempladas
- Dependencia excesiva en los resultados del sistema
          `.trim(),
      },
      {
        id: "3",
        title: locale === "en"
          ? "3. Risk Mitigation Measures"
          : "3. Medidas de Mitigación de Riesgos",
        content: locale === "en"
          ? `
**3.1 Technical measures:**
- Periodic validation and testing of the system
- Continuous monitoring of performance and accuracy
- Anomaly detection mechanisms
- Data encryption in transit and at rest

**3.2 Organisational measures:**
- Designation of a person responsible for system oversight
- Staff training in proper system use
- Incident escalation protocols
- Periodic reviews of the risk assessment

**3.3 Human oversight measures:**
${system.hasHumanOversight ? "- The system has human oversight in place\n- Define intervention levels (consultation, approval, veto)" : "- ACTION REQUIRED: Implement human oversight mechanisms\n- Define oversight roles and responsibilities"}
          `.trim()
          : `
**3.1 Medidas técnicas:**
- Validación y pruebas periódicas del sistema
- Monitorización continua de rendimiento y precisión
- Mecanismos de detección de anomalías
- Cifrado y protección de datos en tránsito y en reposo

**3.2 Medidas organizativas:**
- Designación de responsable de supervisión del sistema
- Formación del personal en uso adecuado del sistema
- Protocolos de escalamiento ante incidentes
- Revisiones periódicas de la evaluación de riesgos

**3.3 Medidas de supervisión humana:**
${system.hasHumanOversight ? "- El sistema cuenta con supervisión humana implementada\n- Definir niveles de intervención (consulta, aprobación, veto)" : "- ACCIÓN REQUERIDA: Implementar mecanismos de supervisión humana\n- Definir roles y responsabilidades de supervisión"}
          `.trim(),
      },
      {
        id: "4",
        title: locale === "en"
          ? "4. Residual Risks"
          : "4. Riesgos Residuales",
        content: locale === "en"
          ? `
After applying mitigation measures, the acceptable residual risks are:

| Risk | Probability | Impact | Residual Level | Acceptable |
|------|-------------|--------|----------------|------------|
| Result bias | Low | High | Medium | Yes, with monitoring |
| Technical failure | Low | Medium | Low | Yes |
| Misuse | Medium | High | Medium | Yes, with training |
| Rights impact | Low | High | Medium | Yes, with measures |

The residual risks are considered acceptable in view of the system's benefits and the measures implemented. Users will be informed of known residual risks.
          `.trim()
          : `
Tras la aplicación de las medidas de mitigación, los riesgos residuales aceptables son:

| Riesgo | Probabilidad | Impacto | Nivel Residual | Aceptable |
|--------|-------------|---------|----------------|-----------|
| Sesgo en resultados | Baja | Alto | Medio | Sí, con monitorización |
| Fallo técnico | Baja | Medio | Bajo | Sí |
| Uso indebido | Media | Alto | Medio | Sí, con formación |
| Impacto en derechos | Baja | Alto | Medio | Sí, con medidas |

Los riesgos residuales se consideran aceptables en vista de los beneficios del sistema y las medidas implementadas. Se informará a los usuarios de los riesgos residuales conocidos.
          `.trim(),
      },
      {
        id: "5",
        title: locale === "en"
          ? "5. Risk Metrics and KPIs"
          : "5. Métricas y KPIs de Riesgo",
        content: locale === "en"
          ? `
The following metrics are established for continuous monitoring:

- **System accuracy:** Measure and report monthly
- **False positive/negative rate:** Target < 5%
- **Reported incidents:** Record of all incidents
- **Incident response time:** Target < 24h
- **Bias reviews:** Quarterly at minimum
- **User satisfaction:** Periodic surveys
          `.trim()
          : `
Se establecen las siguientes métricas para el seguimiento continuo:

- **Precisión del sistema:** Medir y reportar mensualmente
- **Tasa de falsos positivos/negativos:** Objetivo < 5%
- **Incidencias reportadas:** Registro de todas las incidencias
- **Tiempo de respuesta ante incidentes:** Objetivo < 24h
- **Revisiones de sesgo:** Trimestral como mínimo
- **Satisfacción de usuarios:** Encuestas periódicas
          `.trim(),
      },
      {
        id: "6",
        title: locale === "en"
          ? "6. Review Procedure"
          : "6. Procedimiento de Revisión",
        content: locale === "en"
          ? `
This Risk Management Plan will be reviewed:
- **Every 6 months** on a regular basis
- **Immediately** when serious incidents are detected
- **When the system** is significantly modified
- **When the circumstances** of use change

**Review responsible:** ${complete}
**Next scheduled review:** ${complete}
**Date of preparation:** ${formatDate(new Date(), locale)}
          `.trim()
          : `
Este Plan de Gestión de Riesgos se revisará:
- **Cada 6 meses** de forma ordinaria
- **Inmediatamente** cuando se detecten incidentes graves
- **Cuando se modifique** significativamente el sistema
- **Cuando cambien** las circunstancias de uso

**Responsable de revisión:** ${complete}
**Próxima revisión programada:** ${complete}
**Fecha de elaboración:** ${formatDate(new Date(), locale)}
          `.trim(),
      },
    ],
  };
}

// --- Technical File ---
export function generateTechnicalFile(
  org: Organization,
  system: AiSystem,
  assessment?: RiskAssessment | null,
  locale: Locale = "es"
): GeneratedDocument {
  const dataTypes = (system.dataTypes as string[]) || [];
  const affected = (system.affectedPersons as string[]) || [];
  const complete = commonLabels.complete[locale];
  const ns = commonLabels.notSpecified[locale];

  return {
    type: "technical_file",
    title: locale === "en"
      ? `Technical File — ${system.name}`
      : `Ficha Técnica — ${system.name}`,
    version: "1.0",
    generatedAt: formatDate(new Date(), locale),
    organization: buildOrganizationInfo(org),
    system: buildSystemInfo(system),
    riskLevel: assessment?.riskLevel || commonLabels.unclassified[locale],
    metadata: {
      articleReference: "Art. 11 + Anexo IV",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      applicableTo: ["high"],
      requiredForRiskLevel: ["high"],
    },
    sections: [
      {
        id: "1",
        title: locale === "en"
          ? "1. General System Description"
          : "1. Descripción General del Sistema",
        content: locale === "en"
          ? `
**Name:** ${system.name}
**Provider:** ${system.provider || complete}
**Model/Version:** ${system.providerModel || complete}
**Category:** ${system.category}
**Current status:** ${system.status}
**Intended purpose:** ${system.purpose}
**Description:** ${system.description || "[Complete with detailed description]"}
          `.trim()
          : `
**Nombre:** ${system.name}
**Proveedor:** ${system.provider || "[Completar]"}
**Modelo/Versión:** ${system.providerModel || "[Completar]"}
**Categoría:** ${system.category}
**Estado actual:** ${system.status}
**Propósito previsto:** ${system.purpose}
**Descripción:** ${system.description || "[Completar con descripción detallada]"}
          `.trim(),
      },
      {
        id: "2",
        title: locale === "en"
          ? "2. Design and Development Elements"
          : "2. Elementos del Diseño y Desarrollo",
        content: locale === "en"
          ? `
**2.1 Development process:**
[Describe the system development process, including methodologies used]

**2.2 Design decisions:**
- System type: ${system.category}
- Autonomous decisions: ${system.isAutonomousDecision ? "Yes" : "No"}
- Human oversight: ${system.hasHumanOversight ? "Yes" : "No"}

**2.3 System architecture:**
[Include architecture diagram and description of main components]

**2.4 Computational requirements:**
[Specify hardware, software and infrastructure requirements]
          `.trim()
          : `
**2.1 Proceso de desarrollo:**
[Describir el proceso de desarrollo del sistema, incluyendo metodologías utilizadas]

**2.2 Decisiones de diseño:**
- Tipo de sistema: ${system.category}
- Decisiones autónomas: ${system.isAutonomousDecision ? "Sí" : "No"}
- Supervisión humana: ${system.hasHumanOversight ? "Sí" : "No"}

**2.3 Arquitectura del sistema:**
[Incluir diagrama de arquitectura y descripción de componentes principales]

**2.4 Requisitos computacionales:**
[Especificar requisitos de hardware, software e infraestructura]
          `.trim(),
      },
      {
        id: "3",
        title: locale === "en"
          ? "3. Training, Validation and Test Data"
          : "3. Datos de Entrenamiento, Validación y Prueba",
        content: locale === "en"
          ? `
**3.1 Data types used:**
${dataTypes.length > 0 ? dataTypes.map(d => `- ${d}`).join("\n") : "[Complete with data types]"}

**3.2 Datasets:**
[Describe the datasets used for training, validation and testing]

**3.3 Data volume:** ${system.dataVolume || complete}

**3.4 Persons affected by the data:**
${affected.length > 0 ? affected.map(a => `- ${a}`).join("\n") : complete}

**3.5 Data quality measures:**
[Describe the measures implemented to ensure data quality]
          `.trim()
          : `
**3.1 Tipos de datos utilizados:**
${dataTypes.length > 0 ? dataTypes.map(d => `- ${d}`).join("\n") : "[Completar con tipos de datos]"}

**3.2 Conjuntos de datos:**
[Describir los conjuntos de datos utilizados para entrenamiento, validación y pruebas]

**3.3 Volumen de datos:** ${system.dataVolume || "[Completar]"}

**3.4 Personas afectadas por los datos:**
${affected.length > 0 ? affected.map(a => `- ${a}`).join("\n") : "[Completar]"}

**3.5 Medidas de calidad de datos:**
[Describir las medidas implementadas para asegurar la calidad de los datos]
          `.trim(),
      },
      {
        id: "4",
        title: locale === "en"
          ? "4. Performance and Metrics"
          : "4. Rendimiento y Métricas",
        content: locale === "en"
          ? `
**4.1 Performance metrics:**
[Include relevant metrics: accuracy, recall, F1-score, etc.]

**4.2 Known limitations:**
[Describe conditions or scenarios where performance may degrade]

**4.3 Declared accuracy levels:**
[Specify accuracy levels for intended functions]
          `.trim()
          : `
**4.1 Métricas de rendimiento:**
[Incluir métricas relevantes: precisión, recall, F1-score, etc.]

**4.2 Limitaciones conocidas:**
[Describir condiciones o escenarios donde el rendimiento puede degradarse]

**4.3 Niveles de precisión declarados:**
[Especificar niveles de precisión para las funciones previstas]
          `.trim(),
      },
      {
        id: "5",
        title: locale === "en"
          ? "5. Human Interaction"
          : "5. Interacción Humana",
        content: locale === "en"
          ? `
**5.1 User interface:**
[Describe the interface through which users interact with the system]

**5.2 Human oversight:**
${system.hasHumanOversight ? "The system is designed to operate under human oversight." : "NOTE: The system does NOT have human oversight. It is recommended to implement it in accordance with Art. 14."}

**5.3 Required training:**
[Specify the training necessary to operate the system correctly]
          `.trim()
          : `
**5.1 Interfaz de usuario:**
[Describir la interfaz a través de la cual los usuarios interactúan con el sistema]

**5.2 Supervisión humana:**
${system.hasHumanOversight ? "El sistema está diseñado para funcionar bajo supervisión humana." : "NOTA: El sistema NO dispone de supervisión humana. Se recomienda implementarla conforme al Art. 14."}

**5.3 Formación requerida:**
[Especificar la formación necesaria para operar el sistema correctamente]
          `.trim(),
      },
      {
        id: "6",
        title: locale === "en"
          ? "6. Information for Authorities"
          : "6. Información para Autoridades",
        content: locale === "en"
          ? `
**Responsible organisation:** ${org.name}
**Tax ID:** ${org.cifNif || complete}
**Sector:** ${org.sector || complete}
**Country:** ${org.country}
**Contact:** [Complete with responsible person's contact details]
**Date of preparation:** ${formatDate(new Date(), locale)}
          `.trim()
          : `
**Organización responsable:** ${org.name}
**CIF/NIF:** ${org.cifNif || "[Completar]"}
**Sector:** ${org.sector || "[Completar]"}
**País:** ${org.country}
**Contacto:** [Completar con datos de contacto del responsable]
**Fecha de elaboración:** ${formatDate(new Date(), locale)}
          `.trim(),
      },
    ],
  };
}

// --- EU Declaration of Conformity ---
export function generateConformityDeclaration(
  org: Organization,
  system: AiSystem,
  assessment?: RiskAssessment | null,
  locale: Locale = "es"
): GeneratedDocument {
  const articles = (assessment?.applicableArticles as string[]) || [];
  const complete = commonLabels.complete[locale];

  return {
    type: "conformity_declaration",
    title: locale === "en"
      ? `EU Declaration of Conformity — ${system.name}`
      : `Declaración de Conformidad UE — ${system.name}`,
    version: "1.0",
    generatedAt: formatDate(new Date(), locale),
    organization: buildOrganizationInfo(org),
    system: buildSystemInfo(system),
    riskLevel: assessment?.riskLevel || commonLabels.unclassified[locale],
    metadata: {
      articleReference: "Art. 47",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      applicableTo: ["high"],
      requiredForRiskLevel: ["high"],
    },
    sections: [
      {
        id: "1",
        title: locale === "en"
          ? "EU DECLARATION OF CONFORMITY"
          : "DECLARACIÓN UE DE CONFORMIDAD",
        content: locale === "en"
          ? `
In accordance with Article 47 of Regulation (EU) 2024/1689 of the European Parliament and of the Council, of 13 June 2024, laying down harmonised rules on artificial intelligence (Artificial Intelligence Act),

**The organisation:**
${org.name}
Tax ID: ${org.cifNif || complete}
Address: [Complete]
Country: ${commonLabels.country[locale]}

**DECLARES that the AI system:**
Name: ${system.name}
Category: ${system.category}
Provider: ${system.provider || complete}
Version: ${system.providerModel || complete}

**Complies with the following requirements of Regulation (EU) 2024/1689:**

${articles.length > 0 ? articles.map(a => `- ${a}`).join("\n") : "- [To be completed after the conformity assessment]"}

**Conformity assessment procedure applied:**
In accordance with [Art. 43 — Conformity assessment / Art. 44 — Certificates]

**Place and date:** ${commonLabels.country[locale]}, ${formatDate(new Date(), locale)}

**Signed on behalf of:** ${org.name}
**By:** [Name and position of the responsible person]
**Signature:** ____________________
          `.trim()
          : `
De conformidad con el Artículo 47 del Reglamento (UE) 2024/1689 del Parlamento Europeo y del Consejo, de 13 de junio de 2024, por el que se establecen normas armonizadas en materia de inteligencia artificial (Reglamento de Inteligencia Artificial),

**La organización:**
${org.name}
CIF/NIF: ${org.cifNif || "[Completar]"}
Dirección: [Completar]
País: España

**DECLARA que el sistema de IA:**
Nombre: ${system.name}
Categoría: ${system.category}
Proveedor: ${system.provider || "[Completar]"}
Versión: ${system.providerModel || "[Completar]"}

**Cumple con los siguientes requisitos del Reglamento (UE) 2024/1689:**

${articles.length > 0 ? articles.map(a => `- ${a}`).join("\n") : "- [Se completará tras la evaluación de conformidad]"}

**Procedimiento de evaluación de conformidad aplicado:**
Conforme al [Art. 43 — Evaluación de conformidad / Art. 44 — Certificados]

**Lugar y fecha:** España, ${formatDate(new Date(), locale)}

**Firmado en nombre de:** ${org.name}
**Por:** [Nombre y cargo del responsable]
**Firma:** ____________________
          `.trim(),
      },
    ],
  };
}

// --- Transparency Notice ---
export function generateTransparencyNotice(
  org: Organization,
  system: AiSystem,
  assessment?: RiskAssessment | null,
  locale: Locale = "es"
): GeneratedDocument {
  const affected = (system.affectedPersons as string[]) || [];
  const complete = commonLabels.complete[locale];

  return {
    type: "transparency_notice",
    title: locale === "en"
      ? `Transparency Notice — ${system.name}`
      : `Aviso de Transparencia — ${system.name}`,
    version: "1.0",
    generatedAt: formatDate(new Date(), locale),
    organization: buildOrganizationInfo(org),
    system: buildSystemInfo(system),
    riskLevel: assessment?.riskLevel || commonLabels.unclassified[locale],
    metadata: {
      articleReference: "Art. 50",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      applicableTo: ["high", "limited"],
      requiredForRiskLevel: ["high", "limited"],
    },
    sections: [
      {
        id: "1",
        title: locale === "en"
          ? "1. Information about the Use of Artificial Intelligence"
          : "1. Información sobre el Uso de Inteligencia Artificial",
        content: locale === "en"
          ? `
In accordance with Article 50 of Regulation (EU) 2024/1689 (EU AI Act), ${org.name} informs that it uses the following artificial intelligence system:

**System:** ${system.name}
**Purpose:** ${system.purpose}
**System provider:** ${system.provider || complete}
          `.trim()
          : `
Conforme al Artículo 50 del Reglamento (UE) 2024/1689 (EU AI Act), ${org.name} informa de que utiliza el siguiente sistema de inteligencia artificial:

**Sistema:** ${system.name}
**Finalidad:** ${system.purpose}
**Proveedor del sistema:** ${system.provider || "[Completar]"}
          `.trim(),
      },
      {
        id: "2",
        title: locale === "en"
          ? "2. How does it work?"
          : "2. ¿Cómo funciona?",
        content: locale === "en"
          ? `
${system.description || `The system "${system.name}" is a ${system.category}-type system used for ${system.purpose}.`}

**Autonomous decisions:** ${system.isAutonomousDecision ? "This system CAN make decisions autonomously. Decisions can always be reviewed by a person." : "This system is a support tool. Final decisions are made by people."}

**Human oversight:** ${system.hasHumanOversight ? "Yes, the system operates under permanent human oversight." : "The system operates without direct human oversight for each decision."}
          `.trim()
          : `
${system.description || `El sistema "${system.name}" es un sistema de tipo ${system.category} que se utiliza para ${system.purpose}.`}

**Decisiones autónomas:** ${system.isAutonomousDecision ? "Este sistema PUEDE tomar decisiones de forma autónoma. Las decisiones siempre pueden ser revisadas por una persona." : "Este sistema es una herramienta de apoyo. Las decisiones finales son tomadas por personas."}

**Supervisión humana:** ${system.hasHumanOversight ? "Sí, el sistema funciona bajo supervisión humana permanente." : "El sistema opera sin supervisión humana directa en cada decisión."}
          `.trim(),
      },
      {
        id: "3",
        title: locale === "en"
          ? "3. Who is affected?"
          : "3. ¿A quién afecta?",
        content: locale === "en"
          ? `
This system may affect the following categories of persons:
${affected.length > 0 ? affected.map(a => `- ${a}`).join("\n") : `- ${complete}`}

Estimated number of affected persons: ${system.numberOfAffected || complete}
          `.trim()
          : `
Este sistema puede afectar a las siguientes categorías de personas:
${affected.length > 0 ? affected.map(a => `- ${a}`).join("\n") : "- [Completar]"}

Número estimado de personas afectadas: ${system.numberOfAffected || "[Completar]"}
          `.trim(),
      },
      {
        id: "4",
        title: locale === "en"
          ? "4. Your Rights"
          : "4. Sus Derechos",
        content: locale === "en"
          ? `
As a person affected by this AI system, you have the right to:

1. **Be informed** that you are interacting with an AI system
2. **Receive explanations** about decisions that affect you
3. **Request human intervention** at any time
4. **Challenge decisions** made or recommended by the system
5. **Access your data** in accordance with the GDPR

To exercise these rights, contact: [Include contact details]
          `.trim()
          : `
Como persona afectada por este sistema de IA, usted tiene derecho a:

1. **Ser informado** de que está interactuando con un sistema de IA
2. **Recibir explicaciones** sobre las decisiones que le afecten
3. **Solicitar intervención humana** en cualquier momento
4. **Impugnar decisiones** tomadas o recomendadas por el sistema
5. **Acceder a sus datos** conforme al RGPD

Para ejercer estos derechos, contacte con: [Incluir datos de contacto]
          `.trim(),
      },
      {
        id: "5",
        title: locale === "en"
          ? "5. Contact"
          : "5. Contacto",
        content: locale === "en"
          ? `
**System responsible:** ${org.name}
**Email:** ${complete}
**Data Protection Officer:** ${complete}
**Supervisory authority:** Spanish Agency for the Supervision of Artificial Intelligence (AESIA)

Last updated: ${formatDate(new Date(), locale)}
          `.trim()
          : `
**Responsable del sistema:** ${org.name}
**Correo electrónico:** [Completar]
**Delegado de Protección de Datos:** [Completar]
**Autoridad de supervisión:** Agencia Española de Supervisión de la Inteligencia Artificial (AESIA)

Última actualización: ${formatDate(new Date(), locale)}
          `.trim(),
      },
    ],
  };
}

// --- Human Oversight Protocol ---
export function generateHumanOversight(
  org: Organization,
  system: AiSystem,
  assessment?: RiskAssessment | null,
  locale: Locale = "es"
): GeneratedDocument {
  const complete = commonLabels.complete[locale];

  return {
    type: "human_oversight",
    title: locale === "en"
      ? `Human Oversight Protocol — ${system.name}`
      : `Protocolo de Supervisión Humana — ${system.name}`,
    version: "1.0",
    generatedAt: formatDate(new Date(), locale),
    organization: buildOrganizationInfo(org),
    system: buildSystemInfo(system),
    riskLevel: assessment?.riskLevel || commonLabels.unclassified[locale],
    metadata: {
      articleReference: "Art. 14",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      applicableTo: ["high"],
      requiredForRiskLevel: ["high"],
    },
    sections: [
      {
        id: "1",
        title: locale === "en"
          ? "1. Purpose of the Protocol"
          : "1. Objeto del Protocolo",
        content: locale === "en"
          ? `
This protocol establishes the human oversight measures for the AI system "${system.name}" of ${org.name}, in accordance with Article 14 of Regulation (EU) 2024/1689.

The objective is to ensure that the system is used and supervised effectively by persons with the necessary competence, training and authority.
          `.trim()
          : `
Este protocolo establece las medidas de supervisión humana para el sistema de IA "${system.name}" de ${org.name}, conforme al Artículo 14 del Reglamento (UE) 2024/1689.

El objetivo es garantizar que el sistema es utilizado y supervisado de forma efectiva por personas con la competencia, formación y autoridad necesarias.
          `.trim(),
      },
      {
        id: "2",
        title: locale === "en"
          ? "2. Roles and Responsibilities"
          : "2. Roles y Responsabilidades",
        content: locale === "en"
          ? `
**2.1 Primary supervisor:**
- Name: ${complete}
- Position: ${complete}
- Responsibilities: Daily monitoring, review of results, intervention when necessary

**2.2 Deputy supervisor:**
- Name: ${complete}
- Position: ${complete}

**2.3 Escalation responsible:**
- Name: ${complete}
- Position: ${complete}
- Responsibilities: Decisions in cases of serious incidents
          `.trim()
          : `
**2.1 Supervisor principal:**
- Nombre: [Completar]
- Cargo: [Completar]
- Responsabilidades: Monitorización diaria, revisión de resultados, intervención cuando sea necesario

**2.2 Supervisor suplente:**
- Nombre: [Completar]
- Cargo: [Completar]

**2.3 Responsable de escalamiento:**
- Nombre: [Completar]
- Cargo: [Completar]
- Responsabilidades: Decisiones en casos de incidentes graves
          `.trim(),
      },
      {
        id: "3",
        title: locale === "en"
          ? "3. Oversight Procedures"
          : "3. Procedimientos de Supervisión",
        content: locale === "en"
          ? `
**3.1 Routine monitoring:**
- Review of logs and results: [Frequency]
- Verification of performance metrics: [Frequency]
- Review of system decisions: [Frequency]

**3.2 Intervention capability:**
The supervisor has the ability to:
- Stop the system at any time (stop button)
- Override individual system decisions
- Modify operational parameters
- Activate degraded operation mode

**3.3 Stop mechanism:**
Procedure to safely stop the system:
1. Access the control panel
2. Activate "Emergency stop"
3. Notify the escalation responsible
4. Record the incident in the supervision log
          `.trim()
          : `
**3.1 Monitorización rutinaria:**
- Revisión de logs y resultados: [Frecuencia]
- Verificación de métricas de rendimiento: [Frecuencia]
- Revisión de decisiones del sistema: [Frecuencia]

**3.2 Capacidad de intervención:**
El supervisor tiene la capacidad de:
- Detener el sistema en cualquier momento (botón de parada)
- Anular decisiones individuales del sistema
- Modificar parámetros operativos
- Activar el modo de funcionamiento degradado

**3.3 Mecanismo de parada:**
Procedimiento para detener el sistema de forma segura:
1. Acceder al panel de control
2. Activar "Parada de emergencia"
3. Notificar al responsable de escalamiento
4. Registrar el incidente en el log de supervisión
          `.trim(),
      },
      {
        id: "4",
        title: locale === "en"
          ? "4. Supervisor Training"
          : "4. Formación de Supervisores",
        content: locale === "en"
          ? `
Supervisors must receive training in:
- Operation of the AI system
- Known limitations and risks
- Interpretation of results
- Intervention procedures
- EU AI Act legal framework

**Training plan:**
- Initial training: [Before starting supervision]
- Updates: [Frequency]
- Competence assessment: [Frequency]
          `.trim()
          : `
Los supervisores deben recibir formación en:
- Funcionamiento del sistema de IA
- Limitaciones y riesgos conocidos
- Interpretación de resultados
- Procedimientos de intervención
- Marco legal del EU AI Act

**Plan de formación:**
- Formación inicial: [Antes de comenzar a supervisar]
- Actualizaciones: [Frecuencia]
- Evaluación de competencias: [Frecuencia]
          `.trim(),
      },
      {
        id: "5",
        title: locale === "en"
          ? "5. Supervision Record"
          : "5. Registro de Supervisión",
        content: locale === "en"
          ? `
A supervision record will be maintained that includes:
- Date and time of each supervision session
- Incidents detected
- Interventions carried out
- Overridden decisions and reasons
- Supervisor observations

The record will be kept for a minimum of [specify] years.

**Date of preparation:** ${formatDate(new Date(), locale)}
          `.trim()
          : `
Se mantendrá un registro de supervisión que incluya:
- Fecha y hora de cada sesión de supervisión
- Incidencias detectadas
- Intervenciones realizadas
- Decisiones anuladas y motivos
- Observaciones del supervisor

El registro se conservará durante un mínimo de [especificar] años.

**Fecha de elaboración:** ${formatDate(new Date(), locale)}
          `.trim(),
      },
    ],
  };
}

// --- Data Governance Plan ---
export function generateDataGovernance(
  org: Organization,
  system: AiSystem,
  assessment?: RiskAssessment | null,
  locale: Locale = "es"
): GeneratedDocument {
  const dataTypes = (system.dataTypes as string[]) || [];
  const complete = commonLabels.complete[locale];

  return {
    type: "data_governance",
    title: locale === "en"
      ? `Data Governance Plan — ${system.name}`
      : `Plan de Gobernanza de Datos — ${system.name}`,
    version: "1.0",
    generatedAt: formatDate(new Date(), locale),
    organization: buildOrganizationInfo(org),
    system: buildSystemInfo(system),
    riskLevel: assessment?.riskLevel || commonLabels.unclassified[locale],
    metadata: {
      articleReference: "Art. 10",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      applicableTo: ["high"],
      requiredForRiskLevel: ["high"],
    },
    sections: [
      {
        id: "1",
        title: locale === "en"
          ? "1. Scope"
          : "1. Alcance",
        content: locale === "en"
          ? `
This Data Governance Plan establishes the data management practices and measures for the system "${system.name}" in accordance with Article 10 of the EU AI Act.

**System:** ${system.name}
**Data types processed:** ${dataTypes.join(", ") || complete}
**Data volume:** ${system.dataVolume || complete}
          `.trim()
          : `
Este Plan de Gobernanza de Datos establece las prácticas y medidas para la gestión de datos del sistema "${system.name}" conforme al Artículo 10 del EU AI Act.

**Sistema:** ${system.name}
**Tipos de datos procesados:** ${dataTypes.join(", ") || "[Completar]"}
**Volumen de datos:** ${system.dataVolume || "[Completar]"}
          `.trim(),
      },
      {
        id: "2",
        title: locale === "en"
          ? "2. Data Quality"
          : "2. Calidad de los Datos",
        content: locale === "en"
          ? `
**2.1 Quality criteria:**
- Data accuracy and completeness
- Representativeness with respect to the target population
- Absence of systematic errors and biases
- Currency and temporal validity

**2.2 Verification procedures:**
- Automatic validation at ingestion
- Manual review of random samples
- Statistical analysis of distributions
- Detection of anomalies and outliers
          `.trim()
          : `
**2.1 Criterios de calidad:**
- Exactitud y completitud de los datos
- Representatividad respecto a la población objetivo
- Ausencia de errores y sesgos sistemáticos
- Actualización y vigencia temporal

**2.2 Procedimientos de verificación:**
- Validación automática en la ingesta
- Revisión manual de muestras aleatorias
- Análisis estadístico de distribuciones
- Detección de anomalías y valores atípicos
          `.trim(),
      },
      {
        id: "3",
        title: locale === "en"
          ? "3. Bias Detection and Correction"
          : "3. Detección y Corrección de Sesgos",
        content: locale === "en"
          ? `
**3.1 Bias metrics:**
- Demographic parity by protected groups
- Equality of opportunity
- Predictive parity

**3.2 Detection procedure:**
1. Analyse the representation of protected groups in the data
2. Measure fairness metrics after each update
3. Compare results between subgroups
4. Document and mitigate detected biases

**3.3 Bias audit frequency:** [Complete — quarterly recommended]
          `.trim()
          : `
**3.1 Métricas de sesgo:**
- Paridad demográfica por grupos protegidos
- Igualdad de oportunidades
- Paridad predictiva

**3.2 Procedimiento de detección:**
1. Analizar la representación de grupos protegidos en los datos
2. Medir las métricas de equidad tras cada actualización
3. Comparar resultados entre subgrupos
4. Documentar y mitigar sesgos detectados

**3.3 Frecuencia de auditorías de sesgo:** [Completar — recomendado trimestral]
          `.trim(),
      },
      {
        id: "4",
        title: locale === "en"
          ? "4. Personal Data Protection"
          : "4. Protección de Datos Personales",
        content: locale === "en"
          ? `
**4.1 Legal basis for processing:** [Complete in accordance with the GDPR]

**4.2 Protection measures:**
${dataTypes.includes("sensitive_data") ? "- SENSITIVE DATA: Requires reinforced protection and specific legal basis\n" : ""}${dataTypes.includes("biometric_data") ? "- BIOMETRIC DATA: Processing restricted under the GDPR and EU AI Act\n" : ""}- Data encryption at rest and in transit
- Role-based access control
- Anonymisation/pseudonymisation where possible
- Data access logging

**4.3 Data retention:** [Complete with retention periods]
          `.trim()
          : `
**4.1 Base legal del tratamiento:** [Completar conforme al RGPD]

**4.2 Medidas de protección:**
${dataTypes.includes("sensitive_data") ? "- DATOS SENSIBLES: Requieren protección reforzada y base legal específica\n" : ""}${dataTypes.includes("biometric_data") ? "- DATOS BIOMÉTRICOS: Tratamiento restringido conforme al RGPD y EU AI Act\n" : ""}- Cifrado de datos en reposo y en tránsito
- Control de acceso basado en roles
- Anonimización/pseudonimización cuando sea posible
- Registro de accesos a datos

**4.3 Retención de datos:** [Completar con períodos de retención]
          `.trim(),
      },
    ],
  };
}

// --- Post-Market Monitoring Plan ---
export function generatePostMarketMonitoring(
  org: Organization,
  system: AiSystem,
  assessment?: RiskAssessment | null,
  locale: Locale = "es"
): GeneratedDocument {
  const complete = commonLabels.complete[locale];

  return {
    type: "post_market_monitoring",
    title: locale === "en"
      ? `Post-Market Monitoring Plan — ${system.name}`
      : `Plan de Monitorización Post-Comercialización — ${system.name}`,
    version: "1.0",
    generatedAt: formatDate(new Date(), locale),
    organization: buildOrganizationInfo(org),
    system: buildSystemInfo(system),
    riskLevel: assessment?.riskLevel || commonLabels.unclassified[locale],
    metadata: {
      articleReference: "Art. 72",
      deadline: locale === "en" ? "2 August 2026" : "2 agosto 2026",
      applicableTo: ["high"],
      requiredForRiskLevel: ["high"],
    },
    sections: [
      {
        id: "1",
        title: locale === "en"
          ? "1. Objective"
          : "1. Objetivo",
        content: locale === "en"
          ? `
Establish a post-deployment monitoring system for the AI system "${system.name}" in accordance with Art. 72 of the EU AI Act, to verify its continued correct functioning and detect potential risks.
          `.trim()
          : `
Establecer un sistema de seguimiento posterior a la puesta en servicio del sistema de IA "${system.name}" conforme al Art. 72 del EU AI Act, para verificar su correcto funcionamiento continuado y detectar posibles riesgos.
          `.trim(),
      },
      {
        id: "2",
        title: locale === "en"
          ? "2. Monitoring Indicators"
          : "2. Indicadores de Monitorización",
        content: locale === "en"
          ? `
**2.1 Technical KPIs:**
- System accuracy and precision
- Error and failure rate
- Response time
- System availability

**2.2 Security KPIs:**
- Security incidents
- Detected manipulation attempts
- Data breaches

**2.3 Impact KPIs:**
- Complaints and claims received
- Challenged decisions
- Reported fundamental rights impact
          `.trim()
          : `
**2.1 KPIs técnicos:**
- Precisión y exactitud del sistema
- Tasa de errores y fallos
- Tiempo de respuesta
- Disponibilidad del sistema

**2.2 KPIs de seguridad:**
- Incidencias de seguridad
- Intentos de manipulación detectados
- Brechas de datos

**2.3 KPIs de impacto:**
- Quejas y reclamaciones recibidas
- Decisiones impugnadas
- Impacto en derechos fundamentales reportado
          `.trim(),
      },
      {
        id: "3",
        title: locale === "en"
          ? "3. Incident Reporting Procedure"
          : "3. Procedimiento de Reporte de Incidentes",
        content: locale === "en"
          ? `
**Serious incidents (Art. 73):**
Serious incidents will be reported to the market surveillance authorities within a maximum of 72 hours, including:
- Death or serious harm to a person's health
- Serious infringement of fundamental rights
- Serious damage to property, the environment or critical infrastructure

**Procedure:**
1. Detection and recording of the incident
2. Severity assessment (< 2 hours)
3. Internal notification to the responsible person (< 4 hours)
4. Notification to authorities if applicable (< 72 hours)
5. Investigation and root cause analysis
6. Implementation of corrective measures
7. Follow-up and incident closure
          `.trim()
          : `
**Incidentes graves (Art. 73):**
Se comunicarán a las autoridades de vigilancia del mercado en un plazo máximo de 72 horas los incidentes graves, que incluyen:
- Muerte o daño grave a la salud de una persona
- Infracción grave de derechos fundamentales
- Daños graves a la propiedad, medio ambiente o infraestructuras críticas

**Procedimiento:**
1. Detección y registro del incidente
2. Evaluación de gravedad (< 2 horas)
3. Notificación interna al responsable (< 4 horas)
4. Notificación a autoridades si procede (< 72 horas)
5. Investigación y análisis de causa raíz
6. Implementación de medidas correctoras
7. Seguimiento y cierre del incidente
          `.trim(),
      },
      {
        id: "4",
        title: locale === "en"
          ? "4. Review Schedule"
          : "4. Calendario de Revisiones",
        content: locale === "en"
          ? `
| Activity | Frequency | Responsible |
|----------|-----------|-------------|
| KPI review | Weekly | ${complete} |
| Bias audit | Quarterly | ${complete} |
| Risk plan review | Semi-annual | ${complete} |
| Documentation update | Annual / significant change | ${complete} |
| Overall system evaluation | Annual | ${complete} |

**Date of preparation:** ${formatDate(new Date(), locale)}
          `.trim()
          : `
| Actividad | Frecuencia | Responsable |
|-----------|-----------|-------------|
| Revisión de KPIs | Semanal | [Completar] |
| Auditoría de sesgo | Trimestral | [Completar] |
| Revisión del plan de riesgos | Semestral | [Completar] |
| Actualización de documentación | Anual / cambio significativo | [Completar] |
| Evaluación global del sistema | Anual | [Completar] |

**Fecha de elaboración:** ${formatDate(new Date(), locale)}
          `.trim(),
      },
    ],
  };
}

// --- AI Usage Policy ---
export function generateAiUsagePolicy(
  org: Organization,
  systems: AiSystem[],
  locale: Locale = "es"
): GeneratedDocument {
  const complete = commonLabels.complete[locale];

  return {
    type: "ai_usage_policy",
    title: locale === "en"
      ? `Artificial Intelligence Usage Policy — ${org.name}`
      : `Política de Uso de Inteligencia Artificial — ${org.name}`,
    version: "1.0",
    generatedAt: formatDate(new Date(), locale),
    organization: buildOrganizationInfo(org),
    riskLevel: undefined,
    metadata: {
      articleReference: locale === "en" ? "Art. 4 (AI Literacy)" : "Art. 4 (Alfabetización IA)",
      deadline: locale === "en" ? "2 February 2025" : "2 febrero 2025",
      applicableTo: ["high", "limited", "minimal"],
      requiredForRiskLevel: ["high", "limited", "minimal"],
    },
    sections: [
      {
        id: "1",
        title: locale === "en"
          ? "1. Purpose and Scope"
          : "1. Objeto y Alcance",
        content: locale === "en"
          ? `
This policy establishes the rules and guidelines for the use of artificial intelligence systems in ${org.name}, in accordance with Regulation (EU) 2024/1689 (EU AI Act).

It applies to all employees, collaborators and third parties who use or manage AI systems on behalf of the organisation.
          `.trim()
          : `
Esta política establece las normas y directrices para el uso de sistemas de inteligencia artificial en ${org.name}, conforme al Reglamento (UE) 2024/1689 (EU AI Act).

Es de aplicación a todos los empleados, colaboradores y terceros que utilicen o gestionen sistemas de IA en nombre de la organización.
          `.trim(),
      },
      {
        id: "2",
        title: locale === "en"
          ? "2. Authorised AI Systems"
          : "2. Sistemas de IA Autorizados",
        content: locale === "en"
          ? `
The following AI systems are authorised for use in the organisation:

${systems.length > 0
  ? systems.map((s, i) => `${i + 1}. **${s.name}** — ${s.purpose} (${s.category})`).join("\n")
  : "[Complete with the inventory of authorised systems]"
}

Any AI system not included in this list requires prior approval from the designated responsible person.
          `.trim()
          : `
Los siguientes sistemas de IA están autorizados para su uso en la organización:

${systems.length > 0
  ? systems.map((s, i) => `${i + 1}. **${s.name}** — ${s.purpose} (${s.category})`).join("\n")
  : "[Completar con el inventario de sistemas autorizados]"
}

Cualquier sistema de IA no incluido en esta lista requiere aprobación previa del responsable designado.
          `.trim(),
      },
      {
        id: "3",
        title: locale === "en"
          ? "3. Principles of Use"
          : "3. Principios de Uso",
        content: locale === "en"
          ? `
The use of AI systems in ${org.name} is governed by the following principles:

1. **Transparency:** Always inform when AI is used for interacting with people or making decisions.
2. **Human oversight:** Always maintain the capacity for human intervention over AI decisions.
3. **Non-discrimination:** Ensure that AI systems do not produce discriminatory results.
4. **Privacy:** Respect the protection of personal data in accordance with the GDPR and applicable legislation.
5. **Accountability:** Each AI system has a designated responsible person.
6. **Proportionality:** Use AI only when it adds value and with appropriate safeguards.
          `.trim()
          : `
El uso de sistemas de IA en ${org.name} se rige por los siguientes principios:

1. **Transparencia:** Informar siempre cuando se utilice IA para interactuar con personas o tomar decisiones.
2. **Supervisión humana:** Mantener siempre la capacidad de intervención humana sobre las decisiones de la IA.
3. **No discriminación:** Velar por que los sistemas de IA no produzcan resultados discriminatorios.
4. **Privacidad:** Respetar la protección de datos personales conforme al RGPD y normativa aplicable.
5. **Responsabilidad:** Cada sistema de IA tiene un responsable designado.
6. **Proporcionalidad:** Usar IA solo cuando aporte valor y con las garantías adecuadas.
          `.trim(),
      },
      {
        id: "4",
        title: locale === "en"
          ? "4. Prohibited Uses"
          : "4. Usos Prohibidos",
        content: locale === "en"
          ? `
The following are expressly prohibited:

1. Using AI systems for subliminal manipulation of persons
2. Exploiting vulnerabilities of persons by age, disability or social situation
3. Implementing social scoring or social credit systems
4. Using real-time biometrics in public spaces (except legal exceptions)
5. Predicting the probability of criminal offences based solely on profiling
6. Creating facial databases through non-selective scraping
7. Inferring emotions of employees in the workplace (except for medical/safety purposes)
8. Biometric categorisation to deduce origin, sexual orientation, religion, etc.

These uses are prohibited by Article 5 of the EU AI Act.
          `.trim()
          : `
Queda expresamente prohibido:

1. Usar sistemas de IA para manipulación subliminal de personas
2. Explotar vulnerabilidades de personas por edad, discapacidad o situación social
3. Implementar scoring social o sistemas de crédito social
4. Usar biometría en tiempo real en espacios públicos (salvo excepciones legales)
5. Predecir la probabilidad de comisión de delitos basándose solo en perfilado
6. Crear bases de datos faciales mediante scraping no selectivo
7. Inferir emociones de empleados en el lugar de trabajo (salvo fines médicos/seguridad)
8. Categorización biométrica para deducir origen, orientación sexual, religión, etc.

Estos usos están prohibidos por el Artículo 5 del EU AI Act.
          `.trim(),
      },
      {
        id: "5",
        title: locale === "en"
          ? "5. AI Literacy (Art. 4)"
          : "5. Alfabetización en IA (Art. 4)",
        content: locale === "en"
          ? `
${org.name} ensures that all personnel who use or supervise AI systems will receive adequate training that includes:

- Basic understanding of the operation of the AI systems used
- Knowledge of the risks and limitations of each system
- Ability to correctly interpret results
- Knowledge of the rights of affected persons
- Oversight and intervention procedures

**Training plan:**
- Initial training: Mandatory before using any AI system
- Update: Annual or when significant changes are implemented
- Record: A record of all training delivered will be maintained
          `.trim()
          : `
${org.name} garantiza que todo el personal que utilice o supervise sistemas de IA recibirá formación adecuada que incluya:

- Comprensión básica del funcionamiento de los sistemas de IA utilizados
- Conocimiento de los riesgos y limitaciones de cada sistema
- Capacidad para interpretar correctamente los resultados
- Conocimiento de los derechos de las personas afectadas
- Procedimientos de supervisión e intervención

**Plan de formación:**
- Formación inicial: Obligatoria antes de usar cualquier sistema de IA
- Actualización: Anual o cuando se implementen cambios significativos
- Registro: Se mantendrá registro de toda la formación impartida
          `.trim(),
      },
      {
        id: "6",
        title: locale === "en"
          ? "6. Compliance and Sanctions"
          : "6. Cumplimiento y Sanciones",
        content: locale === "en"
          ? `
Non-compliance with this policy may result in disciplinary measures in accordance with the organisation's internal regulations.

**Contact for queries or incidents:**
- AI Responsible: ${complete}
- Email: ${complete}

**Effective date:** ${formatDate(new Date(), locale)}
**Next review:** [6 months later]

Approved by: [Name and position]
Signature: ____________________
          `.trim()
          : `
El incumplimiento de esta política podrá dar lugar a medidas disciplinarias conforme al reglamento interno de la organización.

**Contacto para dudas o incidencias:**
- Responsable de IA: [Completar]
- Email: [Completar]

**Entrada en vigor:** ${formatDate(new Date(), locale)}
**Próxima revisión:** [6 meses después]

Aprobado por: [Nombre y cargo]
Firma: ____________________
          `.trim(),
      },
    ],
  };
}

// ============================================================
// MAIN GENERATOR FUNCTION
// ============================================================

export function generateDocument(
  type: DocumentTemplateType,
  org: Organization,
  system: AiSystem,
  assessment?: RiskAssessment | null,
  allSystems?: AiSystem[],
  locale: Locale = "es"
): GeneratedDocument {
  switch (type) {
    case "impact_assessment":
      return generateImpactAssessment(org, system, assessment, locale);
    case "risk_management":
      return generateRiskManagement(org, system, assessment, locale);
    case "technical_file":
      return generateTechnicalFile(org, system, assessment, locale);
    case "conformity_declaration":
      return generateConformityDeclaration(org, system, assessment, locale);
    case "transparency_notice":
      return generateTransparencyNotice(org, system, assessment, locale);
    case "human_oversight":
      return generateHumanOversight(org, system, assessment, locale);
    case "data_governance":
      return generateDataGovernance(org, system, assessment, locale);
    case "post_market_monitoring":
      return generatePostMarketMonitoring(org, system, assessment, locale);
    case "ai_usage_policy":
      return generateAiUsagePolicy(org, allSystems || [], locale);
    case "ai_inventory":
      return generateAiUsagePolicy(org, allSystems || [], locale); // Reuses policy format
    default:
      throw new Error(
        locale === "en"
          ? `Unsupported document type: ${type}`
          : `Tipo de documento no soportado: ${type}`
      );
  }
}

// ============================================================
// DOCUMENT TO MARKDOWN
// ============================================================

export function documentToMarkdown(doc: GeneratedDocument, locale: Locale = "es"): string {
  const ml = markdownLabels;

  let md = `# ${doc.title}\n\n`;
  md += `**${ml.organization[locale]}:** ${doc.organization.name}\n`;
  if (doc.organization.cif) md += `**${ml.cifNif[locale]}:** ${doc.organization.cif}\n`;
  if (doc.system) {
    md += `**${ml.aiSystem[locale]}:** ${doc.system.name}\n`;
    md += `**${ml.category[locale]}:** ${doc.system.category}\n`;
  }
  if (doc.riskLevel) md += `**${ml.riskLevel[locale]}:** ${doc.riskLevel}\n`;
  md += `**${ml.generatedDate[locale]}:** ${doc.generatedAt}\n`;
  md += `**${ml.version[locale]}:** ${doc.version}\n`;
  md += `**${ml.normativeRef[locale]}:** ${doc.metadata.articleReference}\n\n`;
  md += `---\n\n`;

  for (const section of doc.sections) {
    md += `## ${section.title}\n\n`;
    md += `${section.content}\n\n`;
    if (section.subsections) {
      for (const sub of section.subsections) {
        md += `### ${sub.title}\n\n`;
        md += `${sub.content}\n\n`;
      }
    }
  }

  md += `---\n\n`;
  md += `*${ml.footer[locale]}*\n`;
  md += `*${ml.footerDisclaimer[locale]}*\n`;

  return md;
}
