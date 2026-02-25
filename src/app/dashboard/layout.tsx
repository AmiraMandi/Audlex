import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Shield } from "lucide-react";
import { AlertsDropdown } from "@/components/dashboard/alerts-dropdown";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SearchModal } from "@/components/dashboard/search-modal";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PendingPlanHandler } from "@/components/dashboard/pending-plan-handler";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  function daysUntil() {
    const deadline = new Date("2026-08-02");
    const now = new Date();
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
      <div className="flex h-screen bg-surface">
        {/* Process pending plan after login */}
        <PendingPlanHandler />
        
        {/* Sidebar — client component with i18n */}
        <DashboardSidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-border bg-surface-secondary px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MobileSidebar userEmail={user.email ?? ""} daysUntilDeadline={daysUntil()} />
              <Link href="/dashboard" className="hover:text-text transition hidden sm:block">Dashboard</Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <SearchModal />
              <LanguageSwitcher />
              <ThemeToggle />
              <AlertsDropdown />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-brand-400">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm text-text-secondary truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>

        {/* AI Assistant */}
        <AiAssistant />
      </div>
  );
}
