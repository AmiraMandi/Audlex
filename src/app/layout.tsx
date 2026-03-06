import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { LocaleProvider } from "@/hooks/use-locale";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.audlex.com"),

  title: {
    default: "Audlex — Cumplimiento del EU AI Act para tu empresa",
    template: "%s | Audlex",
  },
  description:
    "Clasifica tus sistemas de IA, genera documentación y cumple con el Reglamento Europeo de Inteligencia Artificial antes del 2 de agosto de 2026.",
  keywords: [
    "EU AI Act",
    "Ley IA Europa",
    "cumplimiento IA",
    "compliance IA",
    "AI Act España",
    "PYME IA",
    "regulación inteligencia artificial",
    "AESIA",
    "audlex",
  ],
  authors: [{ name: "Audlex" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://www.audlex.com",
    siteName: "Audlex",
    title: "Audlex — Cumplimiento del EU AI Act",
    description:
      "Tu empresa usa IA. La UE lo regula. Clasifica, documenta y cumple antes de agosto de 2026.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Audlex — Cumplimiento del EU AI Act",
    description: "Clasifica tus sistemas de IA y cumple con la normativa europea.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Prevent flash: apply saved theme + locale ASAP */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');var l=localStorage.getItem('locale');if(l)document.documentElement.lang=l}catch(e){}})()`,
          }}
        />        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Audlex",
            "url": "https://www.audlex.com",
            "logo": "https://www.audlex.com/logo.svg",
            "description": "Plataforma de compliance con el EU AI Act para empresas. Clasifica tus sistemas de IA, genera documentación y cumple con la normativa europea.",
            "foundingDate": "2025",
            "sameAs": []
          }) }}
        />
        {/* JSON-LD: SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Audlex",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Plataforma SaaS para el cumplimiento del EU AI Act. Clasifica sistemas de IA, genera documentación técnica y gestiona compliance.",
            "url": "https://www.audlex.com",
            "offers": [
              { "@type": "Offer", "price": "0", "priceCurrency": "EUR", "name": "Gratis" },
              { "@type": "Offer", "price": "69", "priceCurrency": "EUR", "name": "Starter", "billingIncrement": "P1M" },
              { "@type": "Offer", "price": "199", "priceCurrency": "EUR", "name": "Business", "billingIncrement": "P1M" },
              { "@type": "Offer", "price": "499", "priceCurrency": "EUR", "name": "Enterprise", "billingIncrement": "P1M" }
            ]
          }) }}
        />      </head>
      <body className="min-h-screen font-sans">
        <LocaleProvider>
          {children}
          <CookieBanner />
        </LocaleProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="light"
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
