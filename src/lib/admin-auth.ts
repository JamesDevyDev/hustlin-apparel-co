import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getPool } from "@/lib/db";

const scrypt = promisify(scryptCallback);
const COOKIE = "admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, digest] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !digest || !/^[a-f0-9]{128}$/i.test(digest)) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(digest, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function initializeAdminPassword() {
  const initial = process.env.ADMIN_INITIAL_PASSWORD;
  if (!initial) return;
  const db = getPool();
  const existing = await db.query("SELECT 1 FROM store_settings WHERE key='admin_password'");
  if (!existing.rowCount) {
    const hashed = await hashPassword(initial);
    await db.query("INSERT INTO store_settings(key,value) VALUES('admin_password',$1) ON CONFLICT(key) DO NOTHING", [JSON.stringify(hashed)]);
  }
}

export async function createAdminSession() {
  const token = randomBytes(32).toString("base64url");
  const key = `admin_session:${createHash("sha256").update(token).digest("hex")}`;
  const expires = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await getPool().query("INSERT INTO store_settings(key,value) VALUES($1,$2)", [key, JSON.stringify(expires)]);
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_TTL_MS / 1000 });
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  const key = `admin_session:${createHash("sha256").update(token).digest("hex")}`;
  const result = await getPool().query("SELECT value FROM store_settings WHERE key=$1", [key]);
  if (!result.rowCount) return false;
  const expires = new Date(result.rows[0].value).getTime();
  if (!Number.isFinite(expires) || expires <= Date.now()) {
    await getPool().query("DELETE FROM store_settings WHERE key=$1", [key]);
    return false;
  }
  return true;
}

export async function requireAdmin() {
  try {
    await (await import("@/lib/db/queries")).ensureSchema();
    if (await isAdminAuthenticated()) return null;
  } catch {
    return Response.json({ error: "Authentication service unavailable." }, { status: 503 });
  }
  return Response.json({ error: "Authentication required." }, { status: 401 });
}

export async function clearCurrentAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const key = `admin_session:${createHash("sha256").update(token).digest("hex")}`;
    await getPool().query("DELETE FROM store_settings WHERE key=$1", [key]);
  }
  jar.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}

export async function clearAdminSessions() {
  await getPool().query("DELETE FROM store_settings WHERE key LIKE 'admin_session:%'");
  await clearCurrentAdminSession();
}
