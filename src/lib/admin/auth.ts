import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { supabaseRest } from "@/lib/supabase/rest";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "mini_betta_admin";
const SESSION_SECONDS = 60 * 60 * 8;

import { PERMISSIONS, type Permission } from "./permissions";
export { PERMISSIONS };
export type { Permission };

type AdminRow = {
  id: string; username: string; password_hash: string; role_id: string | null;
  is_owner: boolean; is_active: boolean; session_version: number;
  admin_roles?: { name: string; permissions: string[] } | null;
};
export type AdminSession = {
  id: string; username: string; isOwner: boolean; roleName: string;
  permissions: string[];
};

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  return value;
}
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
function safeEqual(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${hash.toString("hex")}`;
}
async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expected] = encoded.split(":");
  if (algorithm !== "scrypt" || !salt || !expected) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  return safeEqual(actual.toString("hex"), expected);
}
async function userByName(username: string) {
  const rows = await supabaseRest<AdminRow[]>(`admin_users?select=id,username,password_hash,role_id,is_owner,is_active,session_version,admin_roles(name,permissions)&username=eq.${encodeURIComponent(username)}&limit=1`, { serviceRole: true, cache: "no-store" });
  return rows[0] ?? null;
}
export async function authenticateAdmin(username: string, password: string) {
  if (!/^[A-Za-z0-9_.-]{3,40}$/.test(username)) return null;
  let user = await userByName(username);
  // The existing environment account becomes the first Owner after migration.
  if (!user && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD &&
    safeEqual(username, process.env.ADMIN_USERNAME) && safeEqual(password, process.env.ADMIN_PASSWORD)) {
    const rows = await supabaseRest<AdminRow[]>("admin_users?select=id,username,password_hash,role_id,is_owner,is_active,session_version,admin_roles(name,permissions)", {
      method: "POST", serviceRole: true, headers: { Prefer: "return=representation" },
      body: JSON.stringify({ username, password_hash: await hashPassword(password), is_owner: true }),
    });
    user = rows[0];
  }
  if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash))) return null;
  await supabaseRest(`admin_users?id=eq.${user.id}`, { method: "PATCH", serviceRole: true, body: JSON.stringify({ last_login_at: new Date().toISOString() }) });
  return user;
}
export async function createAdminSession(user: AdminRow) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = Buffer.from(JSON.stringify({ id: user.id, version: user.session_version, expiresAt })).toString("base64url");
  (await cookies()).set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: SESSION_SECONDS, path: "/",
  });
}
export async function destroyAdminSession() { (await cookies()).delete(COOKIE_NAME); }
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as { id: string; version: number; expiresAt: number };
    if (parsed.expiresAt < Math.floor(Date.now() / 1000) || !/^[a-f0-9-]{36}$/.test(parsed.id)) return null;
    const rows = await supabaseRest<AdminRow[]>(`admin_users?select=id,username,password_hash,role_id,is_owner,is_active,session_version,admin_roles(name,permissions)&id=eq.${parsed.id}&limit=1`, { serviceRole: true, cache: "no-store" });
    const user = rows[0];
    if (!user?.is_active || user.session_version !== parsed.version) return null;
    return { id: user.id, username: user.username, isOwner: user.is_owner,
      roleName: user.is_owner ? "Owner" : user.admin_roles?.name ?? "Admin",
      permissions: user.is_owner ? [...PERMISSIONS] : user.admin_roles?.permissions ?? [] };
  } catch { return null; }
}
export function hasPermission(session: AdminSession | null, permission: Permission) {
  return !!session && (session.isOwner || session.permissions.includes(permission));
}
