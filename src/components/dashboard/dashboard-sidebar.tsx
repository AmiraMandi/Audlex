"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  Shield,
  FileText,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Activity,
  HelpCircle,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

const navItems = [
  { href: "/dashboard", labelKey: "sidebar.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/inventario", labelKey: "sidebar.inventory", icon: Cpu },
  { href: "/dashboard/clasificador", labelKey: "sidebar.classifier", icon: Shield },
  { href: "/dashboard/documentacion", labelKey: "sidebar.documentation", icon: FileText },
  { href: "/dashboard/checklist", labelKey: "sidebar.checklist", icon: CheckSquare },
  { href: "/dashboard/informes", labelKey: "sidebar.reports", icon: BarChart3 },
  { href: "/dashboard/audit-log", labelKey: "sidebar.auditLog", icon: Activity },
  { href: "/dashboard/soporte", labelKey: "sidebar.support", icon: HelpCircle },
];

function daysUntil() {
  const deadline = new Date("2026-08-02");
  const now = new Date();
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function DashboardSidebar() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface-secondary">
      {/* Logo */}
      <div className="flex items-center justify-center px-6 py-5 border-b border-border">
        <div className="relative h-9 w-auto">
          <Image
            src={isDark ? "/logo-white.svg" : "/logo.svg"}
            alt="Audlex Logo"
            width={150}
            height={36}
            className="h-9 w-auto object-contain"
          />
        </div>
      </div>

      {/* Countdown */}
      <div className="mx-4 mt-4 rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
        <p className="text-xs font-medium text-orange-400">
          {td(locale, "sidebar.deadline")}
        </p>
        <p className="text-2xl font-bold text-orange-400">
          {daysUntil()} {td(locale, "sidebar.days")}
        </p>
        <p className="text-xs text-orange-500/70">{td(locale, "sidebar.deadlineDate")}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition group ${
                isActive
                  ? "bg-brand-500/10 text-brand-400 font-medium"
                  : "text-text-secondary hover:bg-brand-500/10 hover:text-brand-400"
              }`}
            >
              <item.icon className={`h-5 w-5 transition ${isActive ? "text-brand-500" : "text-text-muted group-hover:text-brand-500"}`} />
              {td(locale, item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-3 space-y-1">
        <Link
          href="/dashboard/configuracion"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-tertiary transition"
        >
          <Settings className="h-5 w-5 text-text-muted" />
          {td(locale, "sidebar.settings")}
        </Link>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut className="h-5 w-5 text-text-muted" />
            {td(locale, "sidebar.signout")}
          </button>
        </form>
      </div>
    </aside>
  );
}

export function DashboardHeader({ userEmail }: { userEmail: string }) {
  const { locale } = useLocale();

  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      <Link href="/dashboard" className="hover:text-text transition">
        {td(locale, "sidebar.dashboard")}
      </Link>
    </div>
  );
}
