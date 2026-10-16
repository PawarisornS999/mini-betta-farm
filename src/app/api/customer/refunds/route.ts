import { NextResponse } from "next/server";
import { getLineSession } from "@/lib/line/login";
import { getOrder } from "@/lib/orders/data";
import { listCustomerRefunds } from "@/lib/refunds/data";
import { supabaseRest } from "@/lib/supabase/rest";

const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ LINE" }, { status: 401, headers });
  try {
    const refunds = await listCustomerRefunds(session.userId);
    return NextResponse.json({
      success: true,
      data: refunds.map(({ lineUserId, ...refund }) => { void lineUserId; return refund; }),
    }, { headers });
  } catch (error) {
    console.error("Refund list failed", error);
    return NextResponse.json({ message: "โหลดสถานะคืนเงินไม่สำเร็จ" }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ LINE" }, { status: 401, headers });
  try {
    const body = await request.json() as Record<string, unknown>;
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const amountText = String(body.claimedAmount ?? "").trim();
    const amount = Number(amountText);
    const reference = typeof body.paymentReference === "string" ? body.paymentReference.trim() : "";
    const note = typeof body.customerNote === "string" ? body.customerNote.trim() : "";
    if (!/^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/.test(amountText) || !Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
      return NextResponse.json({ message: "กรุณาระบุยอดที่โอนให้ถูกต้อง" }, { status: 400, headers });
    }
    if (reference.length > 100 || note.length > 1000) {
      return NextResponse.json({ message: "รายละเอียดคำร้องยาวเกินกำหนด" }, { status: 400, headers });
    }

    let summary = typeof body.productSummary === "string" ? body.productSummary.trim() : "";
    if (orderId) {
      const order = await getOrder(orderId);
      if (!order || order.lineUserId !== session.userId) {
        return NextResponse.json({ message: "ไม่พบออเดอร์ของคุณ" }, { status: 404, headers });
      }
      if (order.shippingStatus !== "pending" && order.shippingStatus !== undefined) {
        return NextResponse.json({ message: "กรุณาติดต่อร้านสำหรับออเดอร์ที่จัดส่งแล้ว" }, { status: 409, headers });
      }
      summary = order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ");
    }
    if (!summary || summary.length > 500) {
      return NextResponse.json({ message: "กรุณาระบุชื่อปลาหรือรายการสินค้า" }, { status: 400, headers });
    }

    await supabaseRest("refund_requests", {
      method: "POST",
      serviceRole: true,
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        line_user_id: session.userId,
        order_id: orderId || null,
        product_summary: summary,
        claimed_amount: amount,
        payment_reference: reference || null,
        customer_note: note || null,
        reason: orderId ? "order_problem" : "stock_unavailable",
      }),
    });
    return NextResponse.json({ success: true }, { status: 201, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "สร้างคำร้องคืนเงินไม่สำเร็จ";
    return NextResponse.json({ message: message.includes("duplicate key") ? "มีคำร้องคืนเงินที่ยังดำเนินการอยู่แล้ว" : "สร้างคำร้องคืนเงินไม่สำเร็จ" }, { status: 409, headers });
  }
}
