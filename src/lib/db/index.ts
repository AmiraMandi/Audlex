import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Para queries normales — pool de conexiones
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Para migraciones — conexión única
export function getMigrationClient() {
  const migrationClient = postgres(connectionString, { max: 1 });
  return drizzle(migrationClient, { schema });
}
