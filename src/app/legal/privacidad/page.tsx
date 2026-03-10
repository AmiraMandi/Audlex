import type { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de Audlex. Cómo recopilamos, usamos y protegemos tus datos personales conforme al RGPD.",
  alternates: {
    canonical: "/legal/privacidad",
  },
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return <PrivacyContent />;
}
