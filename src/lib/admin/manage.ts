import { supabaseRest } from "@/lib/supabase/rest";
import { PERMISSIONS } from "./permissions";

export type RoleRow = { id: string; name: string; permissions: string[]; is_system: boolean };
export type CustomPermissionRow = { id: string; key: string; name: string; description: string; grants_permission: string };
export type UserRow = { id: string; username: string; role_id: string | null; is_owner: boolean; is_active: boolean; last_login_at: string | null; created_at: string };
export const validPermissions = new Set<string>(PERMISSIONS.filter(p => !["payment.view", "payment.edit", "refunds.manage", "admins.manage", "roles.manage"].includes(p)));
export async function validRole(name: unknown, permissions: unknown) {
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60 || !Array.isArray(permissions) || !permissions.every(p => typeof p === "string")) return false;
  const custom = await supabaseRest<CustomPermissionRow[]>("admin_permissions?select=id,key,name,description,grants_permission", { serviceRole: true });
  const allowed = new Set([...validPermissions, ...custom.map(p => p.key)]);
  return permissions.every(p => allowed.has(p));
}
export function validUsername(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z0-9_.-]{3,40}$/.test(value); }
export function validPassword(value: unknown): value is string { return typeof value === "string" && value.length >= 12 && value.length <= 128; }
export async function requireOwner() {
  const { getAdminSession } = await import("./auth");
  const session = await getAdminSession();
  return session?.isOwner ? session : null;
}
export async function logManage(username: string, action: string, id: string, details: object = {}) {
  await supabaseRest("activity_logs", { method: "POST", serviceRole: true, body: JSON.stringify({ admin_name: username, action, resource_type: "admin_access", resource_id: id, details }) });
}
