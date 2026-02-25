import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {Icon && (
        <div className="rounded-2xl bg-surface-tertiary p-4 mb-4">
          <Icon className="h-8 w-8 text-text-muted" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>}
      {children}
    </div>
  );
}

interface AlertProps {
  variant?: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertConfig = {
  info: {
    icon: Info,
    classes: "bg-blue-50 border-blue-200 text-blue-800",
    iconClass: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    classes: "bg-amber-50 border-amber-200 text-amber-800",
    iconClass: "text-amber-600",
  },
  success: {
    icon: CheckCircle2,
    classes: "bg-green-50 border-green-200 text-green-800",
    iconClass: "text-green-600",
  },
  error: {
    icon: XCircle,
    classes: "bg-red-50 border-red-200 text-red-800",
    iconClass: "text-red-600",
  },
};

export function Alert({ variant = "info", title, children, className }: AlertProps) {
  const config = alertConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-xl border p-4 flex items-start gap-3", config.classes, className)}>
      <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconClass)} />
      <div>
        {title && <p className="text-sm font-semibold mb-0.5">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}
