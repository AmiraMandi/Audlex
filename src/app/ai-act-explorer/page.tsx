import type { Metadata } from "next";
import { AIActExplorerContent } from "./explorer-content";

export const metadata: Metadata = {
  title: "EU AI Act Explorer — Navega el Reglamento de IA",
  description:
    "Explora el texto del Reglamento (UE) 2024/1689 de forma intuitiva. Busca artículos, definiciones y requisitos del EU AI Act por capítulo, nivel de riesgo o palabra clave.",
  alternates: {
    canonical: "/ai-act-explorer",
  },
  openGraph: {
    title: "EU AI Act Explorer — Audlex",
    description:
      "Navega el Reglamento Europeo de Inteligencia Artificial: artículos, definiciones, obligaciones y plazos organizados por capítulo.",
    url: "https://www.audlex.com/ai-act-explorer",
  },
};

export default function AIActExplorerPage() {
  return <AIActExplorerContent />;
}
