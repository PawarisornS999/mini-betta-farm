import { NextResponse } from "next/server";
import { authenticateAdmin, createAdminSession } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  if (!body.username || !body.password) return NextResponse.json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  const user = await authenticateAdmin(body.username, body.password);
  if (!user) return NextResponse.json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  await createAdminSession(user);
  return NextResponse.json({ success: true });
}
