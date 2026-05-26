import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

function getUrl() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;
  if (!url) {
    throw new Error(
      "Database not configured. Set DATABASE_URL (or POSTGRES_URL) in your environment."
    );
  }
  return url;
}

// `prepare: false` keeps us compatible with PgBouncer / Neon's pooler.
const client = postgres(getUrl(), { prepare: false });

export const db = drizzle(client, { schema });
export * from "./schema";
