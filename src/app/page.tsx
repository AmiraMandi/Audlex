import type { Metadata } from "next";
import HomePage from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "Audlex — Cumplimiento del EU AI Act para tu empresa",
  description:
    "Clasifica tus sistemas de IA, genera documentación y cumple con el Reglamento Europeo de Inteligencia Artificial antes del 2 de agosto de 2026.",
};

export default function Page() {
  return <HomePage />;
}
