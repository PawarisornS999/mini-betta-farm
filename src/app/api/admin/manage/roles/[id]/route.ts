import { NextResponse } from "next/server";
import { logManage, requireOwner, validRole, type RoleRow } from "@/lib/admin/manage";
import { supabaseRest } from "@/lib/supabase/rest";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();
  if (!(await validRole(body.name, body.permissions)) || body.name.trim().toLowerCase() === "owner") return NextResponse.json({ message: "Role ไม่ถูกต้อง" }, { status: 400 });
  try {
    const [role] = await supabaseRest<RoleRow[]>(`admin_roles?id=eq.${encodeURIComponent(id)}&select=id,name,permissions,is_system`, { method: "PATCH", serviceRole: true, headers: { Prefer: "return=representation" }, body: JSON.stringify({ name: body.name.trim(), permissions: [...new Set(body.permissions)], updated_at: new Date().toISOString() }) });
    if (!role) return NextResponse.json({ message: "ไม่พบ Role" }, { status: 404 });
    await logManage(session.username, "role.update", id, { name: role.name, permissions: role.permissions });
    return NextResponse.json({ role });
  } catch { return NextResponse.json({ message: "บันทึก Role ไม่สำเร็จ" }, { status: 400 }); }
}
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const users = await supabaseRest<Array<{ id: string }>>(`admin_users?select=id&role_id=eq.${encodeURIComponent(id)}&limit=1`, { serviceRole: true });
  if (users.length) return NextResponse.json({ message: "Role นี้มีผู้ใช้งานอยู่" }, { status: 409 });
  const roles = await supabaseRest<RoleRow[]>(`admin_roles?select=id,is_system&id=eq.${encodeURIComponent(id)}`, { serviceRole: true });
  if (!roles[0] || roles[0].is_system) return NextResponse.json({ message: "ลบ Role นี้ไม่ได้" }, { status: 400 });
  await supabaseRest(`admin_roles?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", serviceRole: true });
  await logManage(session.username, "role.delete", id);
  return NextResponse.json({ success: true });
}
