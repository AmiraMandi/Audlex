"use client";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 rounded-lg bg-surface-tertiary p-1", className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition",
              activeTab === tab.id
                ? "bg-surface text-text shadow-sm"
                : "text-text-secondary hover:text-text"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  activeTab === tab.id
                    ? "bg-brand-500/20 text-brand-400"
                    : "bg-surface-tertiary text-text-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
