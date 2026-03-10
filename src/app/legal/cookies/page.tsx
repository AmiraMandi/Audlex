import type { Metadata } from "next";
import { CookiesContent } from "./cookies-content";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Política de cookies de Audlex. Tipos de cookies utilizadas, finalidad y cómo gestionarlas.",
  alternates: {
    canonical: "/legal/cookies",
  },
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return <CookiesContent />;
}
