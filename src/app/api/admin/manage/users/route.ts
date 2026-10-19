import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/admin/auth";
import { logManage, requireOwner, validPassword, validUsername, type UserRow } from "@/lib/admin/manage";
import { supabaseRest } from "@/lib/supabase/rest";

export async function POST(request: Request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = await request.json() as { username?: string; password?: string; isOwner?: boolean; roleId?: string };
  if (!validUsername(body.username) || !validPassword(body.password) || (!body.isOwner && !body.roleId)) return NextResponse.json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (รหัสผ่านอย่างน้อย 12 ตัวอักษร)" }, { status: 400 });
  if (!body.isOwner) {
    const roles = await supabaseRest<Array<{ id: string }>>(`admin_roles?select=id&id=eq.${encodeURIComponent(body.roleId!)}&limit=1`, { serviceRole: true });
    if (!roles.length) return NextResponse.json({ message: "ไม่พบ Role" }, { status: 400 });
  }
  try {
    const [user] = await supabaseRest<UserRow[]>("admin_users?select=id,username,role_id,is_owner,is_active,last_login_at,created_at", { method: "POST", serviceRole: true, headers: { Prefer: "return=representation" }, body: JSON.stringify({ username: body.username, password_hash: await hashPassword(body.password!), is_owner: !!body.isOwner, role_id: body.isOwner ? null : body.roleId }) });
    await logManage(session.username, "admin.create", user.id, { username: user.username, isOwner: user.is_owner, roleId: user.role_id });
    return NextResponse.json({ user }, { status: 201 });
  } catch { return NextResponse.json({ message: "ชื่อผู้ใช้ซ้ำหรือบันทึกไม่สำเร็จ" }, { status: 400 }); }
}
