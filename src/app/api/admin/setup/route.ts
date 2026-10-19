import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminSession, hashPassword, type AdminRow } from "@/lib/admin/auth";
import { validPassword, validUsername } from "@/lib/admin/manage";
import { supabaseRest } from "@/lib/supabase/rest";

function equal(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function POST(request: Request) {
  const body = await request.json() as { setupToken?: string; username?: string; password?: string };
  const configuredToken = process.env.ADMIN_SETUP_TOKEN;
  if (!configuredToken || configuredToken.length < 32 || !body.setupToken || !equal(body.setupToken, configuredToken))
    return NextResponse.json({ message: "รหัสตั้งค่าไม่ถูกต้อง" }, { status: 403 });
  if (!validUsername(body.username) || !validPassword(body.password))
    return NextResponse.json({ message: "ชื่อผู้ใช้ต้องมี 3–40 ตัวอักษร และรหัสผ่าน 12–128 ตัวอักษร" }, { status: 400 });
  try {
    const user = await supabaseRest<AdminRow>("rpc/complete_admin_setup", {
      method: "POST", serviceRole: true,
      body: JSON.stringify({ p_username: body.username, p_password_hash: await hashPassword(body.password) }),
    });
    await createAdminSession(user);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "ตั้งค่า Owner ไม่สำเร็จ ตรวจสอบ migration หรืออาจมีผู้ดูแลในระบบแล้ว" }, { status: 409 });
  }
}
