import { notFound, redirect } from "next/navigation";
import { getAiSystem } from "@/app/actions";
import { EditSystemContent } from "./edit-content";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let system;
  try {
    system = await getAiSystem(id);
  } catch {
    return { title: "Edit System" };
  }
  return { title: system ? `Edit ${system.name}` : "Edit System" };
}

export default async function EditSystemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let system;
  try {
    system = await getAiSystem(id);
  } catch {
    redirect("/login");
  }

  if (!system) notFound();

  return <EditSystemContent system={system} />;
}
