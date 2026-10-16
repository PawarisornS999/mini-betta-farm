import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { listAdminRefunds } from "@/lib/refunds/data";
import { supabaseRest } from "@/lib/supabase/rest";
import { pushLineMessage } from "@/lib/line/messaging";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ success: true, data: await listAdminRefunds() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin refunds load failed", error);
    return NextResponse.json({ message: "โหลดคำร้องคืนเงินไม่สำเร็จ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as { orderId?: string };
    if (!body.orderId) return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    const refund = await supabaseRest<{ id: string; line_user_id: string }>("rpc/admin_open_order_refund", {
      method: "POST",
      serviceRole: true,
      body: JSON.stringify({ p_order_id: body.orderId }),
    });
    if (refund.line_user_id && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
        await pushLineMessage(refund.line_user_id, `🐟 ออเดอร์ #${body.orderId.slice(0, 8).toUpperCase()} ไม่สามารถจัดส่งปลาได้ ร้านกำลังประสานงานคืนเงิน\nติดตามสถานะ: ${siteUrl}/refunds`);
      } catch (error) { console.error("Refund notice failed", error); }
    }
    return NextResponse.json({ success: true, data: refund });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "เปิดคำร้องคืนเงินไม่สำเร็จ" }, { status: 409 });
  }
}
