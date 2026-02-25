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
  Menu,
  X,
  Activity,
} from "lucide-react";
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
];

interface MobileSidebarProps {
  userEmail: string;
  daysUntilDeadline: number;
}

export function MobileSidebar({ userEmail, daysUntilDeadline }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();
  const { locale } = useLocale();

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

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger button — visible only below lg */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-tertiary transition"
        aria-label={locale === "en" ? "Open menu" : "Abrir menú"}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-secondary border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center">
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
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-tertiary transition"
            aria-label={locale === "en" ? "Close menu" : "Cerrar menú"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Countdown */}
        <div className="mx-4 mt-4 rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
          <p className="text-xs font-medium text-orange-400">
            {td(locale, "sidebar.deadline")}
          </p>
          <p className="text-2xl font-bold text-orange-400">
            {daysUntilDeadline} {td(locale, "sidebar.days")}
          </p>
          <p className="text-xs text-orange-500/70">{td(locale, "sidebar.deadlineDate")}</p>
        </div>

        {/* User info */}
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-surface-tertiary p-3">
          <div className="h-8 w-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-brand-400">
              {userEmail[0].toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-text-secondary truncate">{userEmail}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-brand-500/10 text-brand-400 font-medium"
                    : "text-text-secondary hover:bg-brand-500/10 hover:text-brand-400"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition ${
                    isActive ? "text-brand-500" : "text-text-muted"
                  }`}
                />
                {td(locale, item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3 space-y-1 bg-surface-secondary">
          <Link
            href="/dashboard/configuracion"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              pathname.startsWith("/dashboard/configuracion")
                ? "bg-brand-500/10 text-brand-400 font-medium"
                : "text-text-secondary hover:bg-surface-tertiary"
            }`}
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
      </div>
    </>
  );
}
