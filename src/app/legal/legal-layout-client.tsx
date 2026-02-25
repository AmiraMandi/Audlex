"use client";

import { Footer } from "@/components/marketing/footer";
import { PublicNav } from "@/components/marketing/public-nav";

export function LegalLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <PublicNav variant="back" maxWidth="max-w-4xl" />

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {children}
        </div>
      </main>

      <Footer maxWidth="max-w-4xl" />
    </div>
  );
}
