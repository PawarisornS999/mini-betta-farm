import { NextResponse } from "next/server";
import { createAdminSession, validateAdminCredentials } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  if (!body.username || !body.password || !validateAdminCredentials(body.username, body.password)) {
    return NextResponse.json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }
  await createAdminSession(body.username);
  return NextResponse.json({ success: true });
}

