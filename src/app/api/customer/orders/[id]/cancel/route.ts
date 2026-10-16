import { NextResponse } from "next/server";
import { getLineSession } from "@/lib/line/login";
import { getOrder } from "@/lib/orders/data";
import { supabaseRest } from "@/lib/supabase/rest";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ LINE" }, { status: 401 });

  const { id } = await params;
  try {
    const order = await getOrder(id);
    if (!order) return NextResponse.json({ message: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    if (order.lineUserId !== session.userId) {
      return NextResponse.json({ message: "คุณไม่มีสิทธิ์ยกเลิกคำสั่งซื้อนี้" }, { status: 403 });
    }
    if (order.status === "cancelled" || order.paymentStatus === "paid") {
      return NextResponse.json({ message: "ยกเลิกได้เฉพาะคำสั่งซื้อที่ยังไม่ชำระเงิน" }, { status: 409 });
    }

    await supabaseRest("rpc/admin_update_order", {
      method: "POST",
      serviceRole: true,
      body: JSON.stringify({ p_order_id: id, p_action: "cancel", p_value: null }),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "ยกเลิกคำสั่งซื้อไม่สำเร็จ" },
      { status: 409 },
    );
  }
}
