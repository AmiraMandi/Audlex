import { TrustPageContent } from "./trust-content";

export const metadata = {
  title: "Trust Center",
  description: "Centro de confianza de Audlex. Transparencia sobre seguridad, compliance y protección de datos.",
  alternates: {
    canonical: "/trust",
  },
  openGraph: {
    title: "Trust Center — Audlex",
    description: "Centro de confianza de Audlex. Transparencia sobre seguridad, compliance y protección de datos.",
    url: "https://www.audlex.com/trust",
  },
};

export default function TrustCenterPage() {
  return <TrustPageContent />;
}
