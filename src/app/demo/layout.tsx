import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo gratuita — Clasifica tu sistema de IA en 2 minutos",
  description:
    "Prueba gratis el clasificador de riesgo del EU AI Act. Sin registro. Descubre si tu chatbot, CRM o herramienta de IA es de alto riesgo según el Reglamento (UE) 2024/1689.",
  alternates: {
    canonical: "/demo",
  },
  openGraph: {
    title: "Demo gratuita — Clasificador de riesgo del EU AI Act | Audlex",
    description:
      "Clasifica tu sistema de IA en 2 minutos. Sin registro. Descubre tu nivel de riesgo según el EU AI Act.",
    url: "/demo",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
