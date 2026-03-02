"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition",
  {
    variants: {
      variant: {
        default: "bg-surface-tertiary text-text-secondary border-border",
        brand: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-400 dark:border-brand-800",
        success: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
        warning: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        danger: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
        orange: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
        info: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export function RiskBadge({ level }: { level: string }) {
  const { locale } = useLocale();
  const config: Record<string, { variant: BadgeProps["variant"] }> = {
    unacceptable: { variant: "danger" },
    high: { variant: "orange" },
    limited: { variant: "warning" },
    minimal: { variant: "success" },
  };
  const c = config[level] || { variant: "default" };
  const label = td(locale, `badge.risk.${level}`);
  return <Badge variant={c.variant}>{label}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const { locale } = useLocale();
  const config: Record<string, { variant: BadgeProps["variant"] }> = {
    active: { variant: "success" },
    planned: { variant: "info" },
    retired: { variant: "default" },
    draft: { variant: "default" },
    review: { variant: "warning" },
    approved: { variant: "success" },
    expired: { variant: "danger" },
    pending: { variant: "warning" },
    in_progress: { variant: "info" },
    completed: { variant: "success" },
    not_applicable: { variant: "default" },
  };
  const c = config[status] || { variant: "default" };
  const label = td(locale, `badge.status.${status}`);
  return <Badge variant={c.variant}>{label}</Badge>;
}
