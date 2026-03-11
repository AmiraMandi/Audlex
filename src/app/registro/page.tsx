import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const params = await searchParams;
  const qs = params.plan ? `?plan=${params.plan}` : "";
  permanentRedirect(`/auth/registro${qs}`);
}
