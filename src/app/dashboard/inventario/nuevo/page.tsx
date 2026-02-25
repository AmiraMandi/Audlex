import { NuevoContent } from "./nuevo-content";

export const metadata = { title: "Nuevo Sistema de IA" };

export default async function NuevoSistemaPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; name?: string }>;
}) {
  const params = await searchParams;
  return (
    <NuevoContent
      initialCategory={params.category}
      initialName={params.name ? decodeURIComponent(params.name) : undefined}
    />
  );
}
