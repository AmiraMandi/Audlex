import type { Metadata } from "next";
import { CookiesContent } from "./cookies-content";

export const metadata: Metadata = {
  title: "Política de Cookies | Cookie Policy",
  alternates: {
    canonical: "/legal/cookies",
  },
};

export default function CookiesPage() {
  return <CookiesContent />;
}
