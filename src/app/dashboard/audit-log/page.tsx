import { getAuditLog } from "@/app/actions";
import { AuditLogContent } from "./audit-log-content";
import type { AuditLogRow } from "@/types";

export const metadata = { title: "Registro de Auditoría | Audlex" };

export default async function AuditLogPage() {
  let logs: AuditLogRow[] = [];
  try {
    logs = await getAuditLog();
  } catch {
    logs = [];
  }

  return <AuditLogContent logs={logs} />;
}
