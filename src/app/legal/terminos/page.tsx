import type { Metadata } from "next";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Terms and Conditions",
  alternates: {
    canonical: "/legal/terminos",
  },
};

export default function TerminosPage() {
  return <TermsContent />;
}
