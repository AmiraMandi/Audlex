import { BlogPageContent } from "./blog-content";

export const metadata = {
  title: "Blog — EU AI Act Compliance",
  description: "Guías prácticas, análisis y novedades sobre el EU AI Act y compliance de inteligencia artificial en Europa.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog — EU AI Act Compliance | Audlex",
    description: "Guías prácticas, análisis y novedades sobre el EU AI Act y compliance de inteligencia artificial en Europa.",
    url: "https://www.audlex.com/blog",
  },
};

export default function BlogPage() {
  return <BlogPageContent />;
}
