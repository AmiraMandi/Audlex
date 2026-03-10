import type { Metadata } from "next";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de la plataforma Audlex. Derechos, obligaciones y condiciones del servicio SaaS.",
  alternates: {
    canonical: "/legal/terminos",
  },
  robots: { index: true, follow: true },
};

export default function TerminosPage() {
  return <TermsContent />;
}
