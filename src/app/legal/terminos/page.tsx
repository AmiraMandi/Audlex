import type { Metadata } from "next";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Terms and Conditions",
};

export default function TerminosPage() {
  return <TermsContent />;
}
