"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Info, FileText, ChevronDown } from "lucide-react";
import {
  getClassificationQuestions,
  classifyRisk,
  getVisibleQuestions,
  getProgress,
  canClassify,
  type ClassificationAnswer,
  type ClassificationResult,
  type RiskLevel,
  type Locale,
} from "@/lib/ai-act/classifier";
import { runClassification } from "@/app/actions";
import { toast } from "sonner";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

const riskConfig: Record<RiskLevel, { color: string; bg: string; border: string; icon: typeof Shield }> = {
  unacceptable: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  high: { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: AlertTriangle },
  limited: { color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: Info },
  minimal: { color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2 },
};

export default function ClasificadorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const systemId = searchParams.get("system");
  const [answers, setAnswers] = useState<ClassificationAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);
  const riskLabel = (level: RiskLevel) => i(`cls.risk.${level}`);

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers, locale as Locale), [answers, locale]);
  const progress = useMemo(() => getProgress(answers), [answers]);
  const currentQuestion = visibleQuestions[currentIndex];

  function setAnswer(questionId: string, value: string | boolean | string[]) {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, value };
        return updated;
      }
      return [...prev, { questionId, value }];
    });
  }

  function getAnswer(questionId: string): string | boolean | string[] | undefined {
    return answers.find((a) => a.questionId === questionId)?.value;
  }

  function handleNext() {
    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  function handleClassify() {
    const classification = classifyRisk(answers, locale as Locale);
    setResult(classification);

    // Persist to DB if linked to a system
    if (systemId) {
      setSaving(true);
      runClassification(systemId, answers, locale as Locale)
        .then(() => {
          toast.success(i("cls.saved"));
        })
        .catch((err) => {
          toast.error(i("cls.saveError") + (err.message || i("cls.unknownError")));
        })
        .finally(() => setSaving(false));
    }
  }

  function handleReset() {
    setAnswers([]);
    setCurrentIndex(0);
    setResult(null);
  }

  // --- RESULT VIEW ---
  if (result) {
    const config = riskConfig[result.riskLevel];
    const RiskIcon = config.icon;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Result Header */}
        <div className={`rounded-2xl ${config.bg} ${config.border} border p-8 text-center`}>
          <RiskIcon className={`h-16 w-16 mx-auto mb-4 ${config.color}`} />
          <h1 className={`text-3xl font-bold ${config.color}`}>{riskLabel(result.riskLevel)}</h1>
          <p className={`mt-2 text-lg ${config.color} opacity-80`}>{result.summary}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-text-secondary">{i("cls.riskScore")}</span>
            <span className={`text-2xl font-bold ${config.color}`}>{result.score}/100</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded-xl border border-border bg-surface-secondary p-6">
          <h2 className="font-semibold text-text mb-3">{i("cls.explanation")}</h2>
          <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
            {result.detailedExplanation}
          </p>
        </div>

        {/* Applicable Articles */}
        <div className="rounded-xl border border-border bg-surface-secondary p-6">
          <h2 className="font-semibold text-text mb-3">{i("cls.articles")}</h2>
          <div className="flex flex-wrap gap-2">
            {result.applicableArticles.map((art) => (
              <span
                key={art}
                className="rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700"
              >
                {art}
              </span>
            ))}
          </div>
        </div>

        {/* Obligations */}
        {result.obligations.length > 0 && (
          <div className="rounded-xl border border-border bg-surface-secondary p-6">
            <h2 className="font-semibold text-text mb-4">
              {i("cls.obligations")} ({result.obligations.length})
            </h2>
            <div className="space-y-4">
              {result.obligations.map((obl, idx) => (
                <div key={idx} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-surface-tertiary text-text-secondary px-2 py-0.5 rounded">
                        {obl.article}
                      </span>
                      <h3 className="font-medium text-text text-sm">{obl.title}</h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        obl.priority === "critical"
                          ? "bg-red-100 text-red-700"
                          : obl.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : obl.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-surface-tertiary text-text-secondary"
                      }`}
                    >
                      {i(`cls.priority.${obl.priority}`)}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{obl.description}</p>
                  <p className="text-xs text-text-muted mt-2">{i("cls.deadline")} {obl.deadline}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="rounded-xl border border-border bg-surface-secondary p-6">
          <h2 className="font-semibold text-text mb-3">{i("cls.recommendations")}</h2>
          <div className="space-y-2">
            {result.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-text-secondary">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-text-secondary hover:bg-surface-tertiary transition"
          >
            {i("cls.newClassification")}
          </button>
          <button
            onClick={() => router.push(`/dashboard/documentacion${systemId ? `?system=${systemId}` : ""}`)}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <FileText className="h-4 w-4" />
            {i("cls.generateDocs")}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-text-muted text-center">
          {i("cls.disclaimer")}
        </p>
      </div>
    );
  }

  // --- QUESTIONNAIRE VIEW ---
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{i("cls.title")}</h1>
        <p className="text-text-muted mt-1">
          {i("cls.subtitle")}
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-muted">
            {i("cls.question", { current: currentIndex + 1, total: visibleQuestions.length })}
          </span>
          <span className="text-xs font-medium text-brand-600">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-tertiary overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="rounded-xl border border-border bg-surface-secondary p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text mb-1">
              {currentQuestion.text}
            </h2>
            {currentQuestion.helpText && (
              <p className="text-sm text-text-muted mt-2 bg-surface-tertiary rounded-lg p-3">
                <Info className="inline h-3.5 w-3.5 mr-1 text-text-muted" />
                {currentQuestion.helpText}
              </p>
            )}
            {currentQuestion.articleReference && (
              <span className="inline-block mt-2 text-xs font-mono bg-brand-50 text-brand-600 px-2 py-0.5 rounded">
                {currentQuestion.articleReference}
              </span>
            )}
          </div>

          {/* Boolean question */}
          {currentQuestion.type === "boolean" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: i("cls.boolYes") },
                { value: false, label: i("cls.boolNo") },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  onClick={() => {
                    setAnswer(currentQuestion.id, option.value);
                    // Auto-advance on boolean
                    setTimeout(handleNext, 200);
                  }}
                  className={`rounded-lg border p-4 text-center text-sm font-medium transition ${
                    getAnswer(currentQuestion.id) === option.value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-border hover:bg-surface-tertiary text-text-secondary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Single choice */}
          {currentQuestion.type === "single_choice" && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setAnswer(currentQuestion.id, option.value);
                    setTimeout(handleNext, 200);
                  }}
                  className={`w-full text-left rounded-lg border p-3.5 text-sm transition ${
                    getAnswer(currentQuestion.id) === option.value
                      ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                      : "border-border hover:bg-surface-tertiary text-text-secondary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Multi choice */}
          {currentQuestion.type === "multi_choice" && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option) => {
                const selected = ((getAnswer(currentQuestion.id) as string[]) || []).includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const current = (getAnswer(currentQuestion.id) as string[]) || [];
                      const updated = selected
                        ? current.filter((v) => v !== option.value)
                        : [...current, option.value];
                      setAnswer(currentQuestion.id, updated);
                    }}
                    className={`w-full text-left rounded-lg border p-3.5 text-sm transition flex items-center gap-3 ${
                      selected
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                        : "border-border hover:bg-surface-tertiary text-text-secondary"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        selected ? "bg-brand-500 border-brand-500" : "border-border"
                      }`}
                    >
                      {selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-tertiary disabled:opacity-30 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          {i("cls.prev")}
        </button>

        <div className="flex gap-2">
          {currentIndex < visibleQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition"
            >
              {i("cls.next")}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleClassify}
              disabled={!canClassify(answers)}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition"
            >
              <Shield className="h-4 w-4" />
              {i("cls.classifyRisk")}
            </button>
          )}
        </div>
      </div>

      {/* Quick classify button */}
      {canClassify(answers) && currentIndex < visibleQuestions.length - 1 && (
        <div className="text-center">
          <button
            onClick={handleClassify}
            className="text-xs text-brand-600 hover:text-brand-700 underline"
          >
            {i("cls.quickClassify")}
          </button>
        </div>
      )}
    </div>
  );
}
