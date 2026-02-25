"use client";

import { motion } from "framer-motion";

interface PricingToggleProps {
  isAnnual: boolean;
  onChange: (isAnnual: boolean) => void;
  locale: string;
}

export function PricingToggle({ isAnnual, onChange, locale }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <button
        onClick={() => onChange(false)}
        className={`text-sm font-medium transition-colors ${
          !isAnnual ? "text-text" : "text-text-muted hover:text-text-secondary"
        }`}
      >
        {locale === "es" ? "Mensual" : "Monthly"}
      </button>
      
      <button
        onClick={() => onChange(!isAnnual)}
        className="relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        style={{
          backgroundColor: isAnnual ? "rgb(var(--brand-500))" : "rgb(var(--border))",
        }}
      >
        <motion.div
          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
          animate={{
            x: isAnnual ? 28 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
      
      <button
        onClick={() => onChange(true)}
        className={`text-sm font-medium transition-colors ${
          isAnnual ? "text-text" : "text-text-muted hover:text-text-secondary"
        }`}
      >
        {locale === "es" ? "Anual" : "Annual"}
      </button>
      
      {isAnnual && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {locale === "es" ? "Ahorra 20%" : "Save 20%"}
        </motion.span>
      )}
    </div>
  );
}
