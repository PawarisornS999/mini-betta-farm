import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { supabaseRest } from "@/lib/supabase/rest";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { productId?: string; delta?: number; reason?: string };
  if (!body.productId || !Number.isInteger(body.delta) || body.delta === 0) {
    return NextResponse.json({ success: false, message: "ข้อมูลปรับสต็อกไม่ถูกต้อง" }, { status: 400 });
  }
  try {
    const data = await supabaseRest("rpc/admin_adjust_inventory", {
      method: "POST", serviceRole: true,
      body: JSON.stringify({ p_product_id: body.productId, p_delta: body.delta, p_reason: body.reason ?? "admin_adjustment", p_admin_name: session.username }),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "ปรับสต็อกไม่สำเร็จ" }, { status: 400 });
  }
}

