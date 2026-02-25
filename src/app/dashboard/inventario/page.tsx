import { getAiSystemsWithRisk } from "@/app/actions";
import { InventoryContent } from "./inventory-content";
import type { AiSystemWithRisk } from "@/types";

export const metadata = { title: "Inventario de Sistemas de IA" };

export default async function InventarioPage() {
  let systems: AiSystemWithRisk[] = [];
  try {
    systems = await getAiSystemsWithRisk();
  } catch {
    systems = [];
  }
  return <InventoryContent systems={systems} />;
}
