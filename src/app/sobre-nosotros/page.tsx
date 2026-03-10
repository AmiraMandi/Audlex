import type { Metadata } from "next";
import { AboutPageContent } from "./about-content";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description: "Conoce al equipo detrás de Audlex y nuestra misión de democratizar el cumplimiento del EU AI Act.",
  alternates: {
    canonical: "/sobre-nosotros",
  },
  openGraph: {
    title: "Sobre nosotros — Audlex",
    description: "Conoce al equipo detrás de Audlex y nuestra misión de democratizar el cumplimiento del EU AI Act.",
    url: "https://www.audlex.com/sobre-nosotros",
  },
};

export default function SobreNosotrosPage() {
  return <AboutPageContent />;
}
