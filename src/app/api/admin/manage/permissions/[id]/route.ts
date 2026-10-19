import { NextResponse } from "next/server";
import { logManage, requireOwner, validPermissions, type CustomPermissionRow, type RoleRow } from "@/lib/admin/manage";
import { supabaseRest } from "@/lib/supabase/rest";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await request.json() as { name?: string; description?: string; grantsPermission?: string };
  if (!body.name || body.name.trim().length < 2 || body.name.trim().length > 80 || (body.description?.length ?? 0) > 300 || !body.grantsPermission || !validPermissions.has(body.grantsPermission))
    return NextResponse.json({ message: "ข้อมูล Permission ไม่ถูกต้อง" }, { status: 400 });
  const [before] = await supabaseRest<CustomPermissionRow[]>(`admin_permissions?select=id,key,name,description,grants_permission&id=eq.${encodeURIComponent(id)}`, { serviceRole: true });
  if (!before) return NextResponse.json({ message: "ไม่พบ Permission" }, { status: 404 });
  const [permission] = await supabaseRest<CustomPermissionRow[]>(`admin_permissions?id=eq.${encodeURIComponent(id)}&select=id,key,name,description,grants_permission`, { method: "PATCH", serviceRole: true, headers: { Prefer: "return=representation" }, body: JSON.stringify({ name: body.name.trim(), description: body.description?.trim() ?? "", grants_permission: body.grantsPermission, updated_at: new Date().toISOString() }) });
  await logManage(session.username, "permission.update", id, { key: before.key, before: before.grants_permission, after: permission.grants_permission });
  return NextResponse.json({ permission });
}
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const [permission] = await supabaseRest<CustomPermissionRow[]>(`admin_permissions?select=id,key,name,description,grants_permission&id=eq.${encodeURIComponent(id)}`, { serviceRole: true });
  if (!permission) return NextResponse.json({ message: "ไม่พบ Permission" }, { status: 404 });
  const roles = await supabaseRest<RoleRow[]>("admin_roles?select=id,name,permissions,is_system", { serviceRole: true });
  if (roles.some(role => role.permissions.includes(permission.key))) return NextResponse.json({ message: "Permission นี้ถูกใช้ใน Role อยู่" }, { status: 409 });
  await supabaseRest(`admin_permissions?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", serviceRole: true });
  await logManage(session.username, "permission.delete", id, { key: permission.key });
  return NextResponse.json({ success: true });
}
