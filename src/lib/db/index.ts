import { Pool } from "pg";


const globalForDb = globalThis as typeof globalThis & { __hustlinPool?: Pool };

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!globalForDb.__hustlinPool) {
    globalForDb.__hustlinPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalForDb.__hustlinPool;
}

export function jsonError(error: unknown, fallback = "Something went wrong.") {
  const message = error instanceof Error ? error.message : fallback;
  return Response.json({ error: message }, { status: 400 });
}
