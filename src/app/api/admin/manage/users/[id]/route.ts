import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/admin/auth";
import { logManage, requireOwner, validPassword, type UserRow } from "@/lib/admin/manage";
import { supabaseRest } from "@/lib/supabase/rest";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const [before] = await supabaseRest<UserRow[]>(`admin_users?select=id,username,role_id,is_owner,is_active,last_login_at,created_at&id=eq.${encodeURIComponent(id)}`, { serviceRole: true });
  if (!before) return NextResponse.json({ message: "ไม่พบผู้ดูแล" }, { status: 404 });
  const body = await request.json() as { isOwner?: boolean; isActive?: boolean; roleId?: string; password?: string };
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.isOwner === "boolean" || body.roleId !== undefined) {
    const isOwner = body.isOwner ?? before.is_owner;
    if (!isOwner) {
      const roleId = body.roleId ?? before.role_id;
      if (!roleId) return NextResponse.json({ message: "กรุณาเลือก Role" }, { status: 400 });
      const roles = await supabaseRest<Array<{ id: string }>>(`admin_roles?select=id&id=eq.${encodeURIComponent(roleId)}&limit=1`, { serviceRole: true });
      if (!roles.length) return NextResponse.json({ message: "ไม่พบ Role" }, { status: 400 });
      patch.role_id = roleId;
    } else patch.role_id = null;
    patch.is_owner = isOwner;
  }
  if (typeof body.isActive === "boolean") patch.is_active = body.isActive;
  if (body.password !== undefined) {
    if (!validPassword(body.password)) return NextResponse.json({ message: "รหัสผ่านต้องมี 12–128 ตัวอักษร" }, { status: 400 });
    patch.password_hash = await hashPassword(body.password);
  }
  if (id === session.id && (patch.is_active === false || patch.is_owner === false)) return NextResponse.json({ message: "เปลี่ยนสิทธิ์หรือปิดบัญชีตัวเองไม่ได้" }, { status: 400 });
  patch.session_version = (await supabaseRest<Array<{ session_version: number }>>(`admin_users?select=session_version&id=eq.${encodeURIComponent(id)}`, { serviceRole: true }))[0].session_version + 1;
  try {
    const [user] = await supabaseRest<UserRow[]>(`admin_users?id=eq.${encodeURIComponent(id)}&select=id,username,role_id,is_owner,is_active,last_login_at,created_at`, { method: "PATCH", serviceRole: true, headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) });
    await logManage(session.username, "admin.update", id, { before: { isOwner: before.is_owner, roleId: before.role_id, isActive: before.is_active }, after: { isOwner: user.is_owner, roleId: user.role_id, isActive: user.is_active }, passwordChanged: body.password !== undefined });
    return NextResponse.json({ user });
  } catch { return NextResponse.json({ message: "บันทึกไม่สำเร็จ อาจเป็น Owner คนสุดท้าย" }, { status: 400 }); }
}
