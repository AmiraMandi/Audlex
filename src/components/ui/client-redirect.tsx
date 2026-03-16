"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side redirect — avoids React hydration errors
 * that occur with server-side redirect() during streaming.
 */
export function ClientRedirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [to, router]);

  // Show loading skeleton while redirecting
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-surface-tertiary rounded-lg" />
        <div className="h-10 w-32 bg-surface-tertiary rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-surface-tertiary rounded-xl" />
        ))}
      </div>
    </div>
  );
}
