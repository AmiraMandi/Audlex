import type { Metadata } from "next";
import HomePage from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "Audlex — Cumplimiento del EU AI Act para tu empresa",
  description:
    "Clasifica tus sistemas de IA, genera documentación y cumple con el Reglamento Europeo de Inteligencia Artificial antes del 2 de agosto de 2026.",
  alternates: {
    canonical: "/",
  },
};

// FAQ structured data for Google rich snippets
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es el EU AI Act (Reglamento Europeo de Inteligencia Artificial)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Es el Reglamento (UE) 2024/1689 del Parlamento Europeo, la primera ley integral del mundo que regula la inteligencia artificial. Clasifica los sistemas de IA en 4 niveles de riesgo (inaceptable, alto, limitado, mínimo) e impone obligaciones de transparencia, documentación y supervisión humana a proveedores y deployers en la UE."
      }
    },
    {
      "@type": "Question",
      "name": "¿A quién le aplica el EU AI Act?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A cualquier organización que desarrolle, despliegue o utilice sistemas de IA en el mercado europeo — independientemente de dónde esté la sede. Si tu empresa usa un chatbot, CRM con scoring, IA en RRHH, herramientas de generación de contenido o analítica predictiva, te aplica."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuáles son las multas por incumplimiento del EU AI Act?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Las sanciones son significativas: hasta 35 millones de euros o el 7% de la facturación global anual (la mayor de las dos) por prácticas prohibidas, 15M€ o 3% por incumplimiento de alto riesgo, y 7.5M€ o 1.5% por proporcionar información incorrecta."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo me ayuda Audlex a cumplir con el EU AI Act?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Audlex automatiza el proceso completo: 1) Inventariamos tus sistemas de IA, 2) Clasificamos su nivel de riesgo según el reglamento, 3) Generamos toda la documentación obligatoria (hasta 13 documentos), 4) Te guiamos con un checklist interactivo y dashboard de compliance. Todo en una tarde."
      }
    },
    {
      "@type": "Question",
      "name": "¿Es el EU AI Act diferente del ISO 42001?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí. ISO 42001 es un estándar voluntario de gestión de IA. El EU AI Act es una ley vinculante con sanciones. Son complementarios: ISO 42001 te ayuda a tener un sistema de gestión, pero el AI Act tiene requisitos específicos de clasificación, documentación técnica y registro obligatorio que ISO no cubre. Audlex se centra en los requisitos legales del AI Act."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tiempo tengo para cumplir con el EU AI Act?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Las obligaciones para sistemas de alto riesgo entran en vigor el 2 de agosto de 2026. Sin embargo, las prácticas prohibidas ya están en vigor desde febrero de 2025, y los requisitos de transparencia para IA de propósito general desde agosto de 2025. Cuanto antes empieces, mejor."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePage />
    </>
  );
}
