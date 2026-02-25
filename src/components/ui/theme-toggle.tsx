"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg border border-border",
        "bg-surface-tertiary hover:bg-brand-500/10 hover:border-brand-500/30 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        className
      )}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-text-secondary" />
      ) : (
        <Moon className="h-4 w-4 text-text-secondary" />
      )}
    </button>
  );
}
