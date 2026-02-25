import type { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "Política de Privacidad | Privacy Policy",
};

export default function PrivacidadPage() {
  return <PrivacyContent />;
}
