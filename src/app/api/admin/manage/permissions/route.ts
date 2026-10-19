import { NextResponse } from "next/server";
import { logManage, requireOwner, validPermissions, type CustomPermissionRow } from "@/lib/admin/manage";
import { supabaseRest } from "@/lib/supabase/rest";

export async function POST(request: Request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = await request.json() as { key?: string; name?: string; description?: string; grantsPermission?: string };
  const key = `custom.${body.key?.trim().toLowerCase() ?? ""}`;
  if (!/^custom\.[a-z0-9_]{3,50}$/.test(key) || !body.name || body.name.trim().length < 2 || body.name.trim().length > 80 || (body.description?.length ?? 0) > 300 || !body.grantsPermission || !validPermissions.has(body.grantsPermission))
    return NextResponse.json({ message: "ข้อมูล Permission ไม่ถูกต้อง" }, { status: 400 });
  try {
    const [permission] = await supabaseRest<CustomPermissionRow[]>("admin_permissions?select=id,key,name,description,grants_permission", { method: "POST", serviceRole: true, headers: { Prefer: "return=representation" }, body: JSON.stringify({ key, name: body.name.trim(), description: body.description?.trim() ?? "", grants_permission: body.grantsPermission }) });
    await logManage(session.username, "permission.create", permission.id, { key, grantsPermission: permission.grants_permission });
    return NextResponse.json({ permission }, { status: 201 });
  } catch { return NextResponse.json({ message: "รหัส Permission ซ้ำหรือบันทึกไม่สำเร็จ" }, { status: 400 }); }
}
