/**
 * Tests for the EU AI Act risk classifier.
 * Pure logic — no DB/network dependencies.
 */
import { describe, it, expect } from "vitest";
import {
  classifyRisk,
  getClassificationQuestions,
  getVisibleQuestions,
  getProgress,
  canClassify,
  type ClassificationAnswer,
} from "@/lib/ai-act/classifier";

describe("classifier – getClassificationQuestions", () => {
  it("returns questions array in Spanish", () => {
    const questions = getClassificationQuestions("es");
    expect(questions.length).toBeGreaterThan(5);
    expect(questions[0]).toHaveProperty("text");
    expect(questions[0]).toHaveProperty("type");
    expect(questions[0]).toHaveProperty("weight");
  });

  it("returns questions array in English", () => {
    const questions = getClassificationQuestions("en");
    expect(questions.length).toBeGreaterThan(5);
    // English text should differ from Spanish
    const esQuestions = getClassificationQuestions("es");
    expect(questions[0].text).not.toEqual(esQuestions[0].text);
  });
});

describe("classifier – classifyRisk: prohibited systems", () => {
  it("detects subliminal manipulation as unacceptable", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "autonomous_decision" },
      { questionId: "sector", value: "marketing" },
      { questionId: "subliminal_manipulation", value: true },
    ];

    const result = classifyRisk(answers, "es");
    expect(result.riskLevel).toBe("unacceptable");
    expect(result.isProhibited).toBe(true);
    expect(result.prohibitionReasons.length).toBeGreaterThan(0);
  });

  it("detects social scoring as unacceptable", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "scoring_profiling" },
      { questionId: "sector", value: "public_services" },
      { questionId: "social_scoring", value: true },
    ];

    const result = classifyRisk(answers, "en");
    expect(result.riskLevel).toBe("unacceptable");
    expect(result.isProhibited).toBe(true);
  });

  it("detects real-time biometric in public as unacceptable", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "biometric" },
      { questionId: "sector", value: "law_enforcement" },
      { questionId: "realtime_biometric_public", value: true },
    ];

    const result = classifyRisk(answers, "es");
    expect(result.riskLevel).toBe("unacceptable");
    expect(result.isProhibited).toBe(true);
  });
});

describe("classifier – classifyRisk: high risk", () => {
  it("classifies employment decision system as high risk", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "scoring_profiling" },
      { questionId: "sector", value: "employment_hr" },
      { questionId: "subliminal_manipulation", value: false },
      { questionId: "vulnerability_exploitation", value: false },
      { questionId: "social_scoring", value: false },
      { questionId: "realtime_biometric_public", value: false },
      { questionId: "emotion_recognition_prohibited", value: false },
      { questionId: "facial_scraping", value: false },
      { questionId: "biometric_identification", value: false },
      { questionId: "critical_infrastructure_safety", value: false },
      { questionId: "education_access", value: false },
      { questionId: "employment_decisions", value: true },
    ];

    const result = classifyRisk(answers);
    expect(result.riskLevel).toBe("high");
    expect(result.isProhibited).toBe(false);
    expect(result.obligations.length).toBeGreaterThan(0);
    expect(result.applicableArticles).toContain("Anexo III.4");
  });

  it("classifies biometric identification as high risk", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "biometric" },
      { questionId: "sector", value: "technology" },
      { questionId: "subliminal_manipulation", value: false },
      { questionId: "vulnerability_exploitation", value: false },
      { questionId: "social_scoring", value: false },
      { questionId: "realtime_biometric_public", value: false },
      { questionId: "emotion_recognition_prohibited", value: false },
      { questionId: "facial_scraping", value: false },
      { questionId: "biometric_identification", value: true },
    ];

    const result = classifyRisk(answers, "en");
    expect(result.riskLevel).toBe("high");
    expect(result.applicableArticles).toContain("Anexo III.1");
  });
});

describe("classifier – classifyRisk: minimal risk", () => {
  it("classifies a simple chatbot with no special features as minimal/limited", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "chatbot" },
      { questionId: "sector", value: "customer_service" },
      { questionId: "subliminal_manipulation", value: false },
      { questionId: "vulnerability_exploitation", value: false },
      { questionId: "social_scoring", value: false },
      { questionId: "realtime_biometric_public", value: false },
      { questionId: "emotion_recognition_prohibited", value: false },
      { questionId: "facial_scraping", value: false },
      { questionId: "biometric_identification", value: false },
      { questionId: "critical_infrastructure_safety", value: false },
      { questionId: "education_access", value: false },
      { questionId: "employment_decisions", value: false },
      { questionId: "essential_services_access", value: false },
      { questionId: "law_enforcement_use", value: false },
    ];

    const result = classifyRisk(answers);
    expect(["limited", "minimal"]).toContain(result.riskLevel);
    expect(result.isProhibited).toBe(false);
  });
});

describe("classifier – utility functions", () => {
  it("getProgress returns 0 for no answers", () => {
    expect(getProgress([])).toBe(0);
  });

  it("getProgress returns a number between 0-100 for partial answers", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "chatbot" },
      { questionId: "sector", value: "retail" },
    ];
    const progress = getProgress(answers);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it("canClassify returns false for empty answers", () => {
    expect(canClassify([])).toBe(false);
  });

  it("canClassify returns true when minimum mandatory answers provided", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "chatbot" },
      { questionId: "sector", value: "retail" },
      { questionId: "subliminal_manipulation", value: false },
    ];
    expect(canClassify(answers)).toBe(true);
  });

  it("getVisibleQuestions filters conditionally", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "chatbot" },
    ];
    const visible = getVisibleQuestions(answers, "es");
    expect(visible.length).toBeGreaterThan(0);
  });
});

describe("classifier – result structure", () => {
  it("result has all required fields", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "chatbot" },
      { questionId: "sector", value: "retail" },
      { questionId: "subliminal_manipulation", value: false },
    ];

    const result = classifyRisk(answers, "es");
    expect(result).toHaveProperty("riskLevel");
    expect(result).toHaveProperty("isProhibited");
    expect(result).toHaveProperty("prohibitionReasons");
    expect(result).toHaveProperty("applicableArticles");
    expect(result).toHaveProperty("obligations");
    expect(result).toHaveProperty("recommendations");
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("detailedExplanation");
    expect(typeof result.score).toBe("number");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("provides bilingual results based on locale", () => {
    const answers: ClassificationAnswer[] = [
      { questionId: "system_type", value: "chatbot" },
      { questionId: "sector", value: "retail" },
      { questionId: "subliminal_manipulation", value: false },
    ];

    const es = classifyRisk(answers, "es");
    const en = classifyRisk(answers, "en");

    // The summary/explanation should differ by locale
    expect(es.summary).not.toEqual(en.summary);
  });
});
