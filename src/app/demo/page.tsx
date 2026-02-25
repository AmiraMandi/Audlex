"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XOctagon,
  Info,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";
import { PublicNav } from "@/components/marketing/public-nav";

// Simplified inline classifier for demo (no DB needed)
type RiskLevel = "unacceptable" | "high" | "limited" | "minimal";

interface DemoQuestion {
  id: string;
  textKey: string;
  options: { value: string; labelKey: string }[];
}

const demoQuestions: DemoQuestion[] = [
  {
    id: "category",
    textKey: "demo.q.category",
    options: [
      { value: "chatbot", labelKey: "demo.o.chatbot" },
      { value: "scoring", labelKey: "demo.o.scoring" },
      { value: "rrhh", labelKey: "demo.o.rrhh" },
      { value: "biometria", labelKey: "demo.o.biometria" },
      { value: "analytics", labelKey: "demo.o.analytics" },
      { value: "other", labelKey: "demo.o.other" },
    ],
  },
  {
    id: "autonomous",
    textKey: "demo.q.autonomous",
    options: [
      { value: "yes", labelKey: "demo.o.autonomous.yes" },
      { value: "partial", labelKey: "demo.o.autonomous.partial" },
      { value: "no", labelKey: "demo.o.autonomous.no" },
    ],
  },
  {
    id: "affected",
    textKey: "demo.q.affected",
    options: [
      { value: "employees", labelKey: "demo.o.employees" },
      { value: "customers", labelKey: "demo.o.customers" },
      { value: "citizens", labelKey: "demo.o.citizens" },
      { value: "vulnerable", labelKey: "demo.o.vulnerable" },
    ],
  },
  {
    id: "domain",
    textKey: "demo.q.domain",
    options: [
      { value: "education", labelKey: "demo.o.education" },
      { value: "employment", labelKey: "demo.o.employment" },
      { value: "financial", labelKey: "demo.o.financial" },
      { value: "health", labelKey: "demo.o.health" },
      { value: "justice", labelKey: "demo.o.justice" },
      { value: "general", labelKey: "demo.o.general" },
    ],
  },
  {
    id: "data",
    textKey: "demo.q.data",
    options: [
      { value: "personal", labelKey: "demo.o.personal" },
      { value: "sensitive", labelKey: "demo.o.sensitive" },
      { value: "biometric", labelKey: "demo.o.biometric" },
      { value: "anonymous", labelKey: "demo.o.anonymous" },
    ],
  },
];

function classifyDemo(answers: Record<string, string>): {
  riskLevel: RiskLevel;
  score: number;
  reasonKeys: string[];
  obligationKeys: string[];
} {
  let score = 0;
  const reasonKeys: string[] = [];
  const obligationKeys: string[] = [];

  // Category-based scoring
  if (answers.category === "biometria") {
    score += 40;
    reasonKeys.push("demo.reason.biometric");
  } else if (answers.category === "scoring") {
    score += 30;
    reasonKeys.push("demo.reason.scoring");
  } else if (answers.category === "rrhh") {
    score += 35;
    reasonKeys.push("demo.reason.rrhh");
  } else if (answers.category === "chatbot") {
    score += 10;
    reasonKeys.push("demo.reason.chatbot");
  } else if (answers.category === "analytics") {
    score += 5;
    reasonKeys.push("demo.reason.analytics");
  }

  // Autonomous decision
  if (answers.autonomous === "yes") {
    score += 25;
    reasonKeys.push("demo.reason.autonomous");
  } else if (answers.autonomous === "partial") {
    score += 10;
  }

  // Affected persons
  if (answers.affected === "vulnerable") {
    score += 20;
    reasonKeys.push("demo.reason.vulnerable");
  } else if (answers.affected === "citizens") {
    score += 15;
    reasonKeys.push("demo.reason.citizens");
  }

  // Domain
  if (answers.domain === "justice") {
    score += 30;
    reasonKeys.push("demo.reason.justice");
  } else if (answers.domain === "employment") {
    score += 25;
    reasonKeys.push("demo.reason.employment");
  } else if (answers.domain === "financial") {
    score += 20;
    reasonKeys.push("demo.reason.financial");
  } else if (answers.domain === "health") {
    score += 20;
    reasonKeys.push("demo.reason.health");
  } else if (answers.domain === "education") {
    score += 15;
    reasonKeys.push("demo.reason.education");
  }

  // Data type
  if (answers.data === "biometric") {
    score += 20;
    reasonKeys.push("demo.reason.biometricData");
  } else if (answers.data === "sensitive") {
    score += 15;
    reasonKeys.push("demo.reason.sensitiveData");
  }

  // Determine risk level
  let riskLevel: RiskLevel;
  if (score >= 80) {
    riskLevel = "unacceptable";
    obligationKeys.push("demo.obl.prohibited");
    obligationKeys.push("demo.obl.consultLegal");
  } else if (score >= 50) {
    riskLevel = "high";
    obligationKeys.push("demo.obl.riskMgmt");
    obligationKeys.push("demo.obl.dataGov");
    obligationKeys.push("demo.obl.techDoc");
    obligationKeys.push("demo.obl.humanOverride");
    obligationKeys.push("demo.obl.transparency");
    obligationKeys.push("demo.obl.euDb");
    obligationKeys.push("demo.obl.conformity");
  } else if (score >= 20) {
    riskLevel = "limited";
    obligationKeys.push("demo.obl.transparencyArt50");
    obligationKeys.push("demo.obl.informUsers");
    obligationKeys.push("demo.obl.labelContent");
  } else {
    riskLevel = "minimal";
    obligationKeys.push("demo.obl.noSpecific");
    obligationKeys.push("demo.obl.voluntaryCodes");
  }

  // Universal obligation
  obligationKeys.push("demo.obl.literacy");

  return { riskLevel, score, reasonKeys, obligationKeys };
}

const riskConfig: Record<
  RiskLevel,
  { labelKey: string; color: string; bgColor: string; icon: typeof Shield; descKey: string }
> = {
  unacceptable: {
    labelKey: "demo.risk.unacceptable",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    icon: XOctagon,
    descKey: "demo.risk.unacceptable.desc",
  },
  high: {
    labelKey: "demo.risk.high",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    icon: AlertTriangle,
    descKey: "demo.risk.high.desc",
  },
  limited: {
    labelKey: "demo.risk.limited",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    icon: Info,
    descKey: "demo.risk.limited.desc",
  },
  minimal: {
    labelKey: "demo.risk.minimal",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
    icon: CheckCircle2,
    descKey: "demo.risk.minimal.desc",
  },
};

export default function DemoPage() {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => tp(locale, key, r);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReturnType<typeof classifyDemo> | null>(null);

  function handleAnswer(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < demoQuestions.length - 1) {
      setStep(step + 1);
    } else {
      // All questions answered -> classify
      setResult(classifyDemo(newAnswers));
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  const currentQuestion = demoQuestions[step];
  const config = result ? riskConfig[result.riskLevel] : null;
  const ConfigIcon = config?.icon ?? Shield;

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <PublicNav variant="back" maxWidth="max-w-4xl" />

      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {i("demo.badge")}
          </div>
          <h1 className="text-3xl font-bold text-text">
            {i("demo.title")}
          </h1>
          <p className="mt-2 text-text-secondary">
            {i("demo.subtitle")}
          </p>
        </div>

        {!result ? (
          <>
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {demoQuestions.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    idx < step
                      ? "bg-brand-500"
                      : idx === step
                      ? "bg-brand-500/50"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Question */}
            <div className="rounded-2xl border border-border bg-surface-secondary p-8">
              <p className="text-xs text-text-muted mb-2">
                {i("demo.questionOf", { current: step + 1, total: demoQuestions.length })}
              </p>
              <h2 className="text-xl font-semibold text-text mb-6">
                {i(currentQuestion.textKey)}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 text-left text-sm text-text hover:border-brand-500/30 hover:bg-brand-500/5 transition-all duration-200 group"
                  >
                    <span>{i(option.labelKey)}</span>
                    <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-brand-500 transition" />
                  </button>
                ))}
              </div>

              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="mt-4 flex items-center gap-1 text-sm text-text-muted hover:text-text transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {i("demo.previous")}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* Risk level card */}
            <div className={`rounded-2xl border ${config?.bgColor} p-8 text-center`}>
              <ConfigIcon className={`h-12 w-12 mx-auto mb-4 ${config?.color}`} />
              <h2 className={`text-2xl font-bold ${config?.color} mb-2`}>
                {config ? i(config.labelKey) : ""}
              </h2>
              <p className="text-text-secondary max-w-md mx-auto">
                {config ? i(config.descKey) : ""}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium text-text border border-border">
                Score: {result.score}/100
              </div>
            </div>

            {/* Reasons */}
            <div className="rounded-2xl border border-border bg-surface-secondary p-6">
              <h3 className="font-semibold text-text mb-4">{i("demo.result.why")}</h3>
              <ul className="space-y-2">
                {result.reasonKeys.map((key, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Info className="h-4 w-4 mt-0.5 text-brand-500 flex-shrink-0" />
                    {i(key)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Obligations */}
            <div className="rounded-2xl border border-border bg-surface-secondary p-6">
              <h3 className="font-semibold text-text mb-4">{i("demo.result.obligations")}</h3>
              <ul className="space-y-2">
                {result.obligationKeys.map((key, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    {i(key)}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-6 text-center">
              <h3 className="font-semibold text-text mb-2">
                {i("demo.result.fullReport")}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {i("demo.result.fullReportDesc")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/registro"
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition shadow-lg shadow-brand-500/20"
                >
                  {i("public.register")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-text-secondary hover:text-text transition"
                >
                  {i("demo.result.classifyAnother")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
