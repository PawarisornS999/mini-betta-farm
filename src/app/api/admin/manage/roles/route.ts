import { NextResponse } from "next/server";
import { logManage, requireOwner, validRole, type RoleRow } from "@/lib/admin/manage";
import { supabaseRest } from "@/lib/supabase/rest";

export async function POST(request: Request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = await request.json();
  if (!(await validRole(body.name, body.permissions)) || body.name.trim().toLowerCase() === "owner") return NextResponse.json({ message: "Role ไม่ถูกต้อง" }, { status: 400 });
  try {
    const [role] = await supabaseRest<RoleRow[]>("admin_roles?select=id,name,permissions,is_system", { method: "POST", serviceRole: true, headers: { Prefer: "return=representation" }, body: JSON.stringify({ name: body.name.trim(), permissions: [...new Set(body.permissions)] }) });
    await logManage(session.username, "role.create", role.id, { name: role.name, permissions: role.permissions });
    return NextResponse.json({ role }, { status: 201 });
  } catch { return NextResponse.json({ message: "ชื่อ Role ซ้ำหรือบันทึกไม่สำเร็จ" }, { status: 400 }); }
}
