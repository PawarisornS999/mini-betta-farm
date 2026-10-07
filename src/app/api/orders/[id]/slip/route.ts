import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders/data";
import { supabaseRest } from "@/lib/supabase/rest";
import { pushLineMessage } from "@/lib/line/messaging";
import { getLineSession } from "@/lib/line/login";

const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !types[file.type] || file.size < 1 || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ message: "กรุณาเลือกรูปสลิป JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB" }, { status: 400 });
  }
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ message: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
  const session = await getLineSession();
  if (!session) return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ LINE" }, { status: 401 });
  if (!order.lineUserId || order.lineUserId !== session.userId) {
    return NextResponse.json({ message: "คุณไม่มีสิทธิ์ดำเนินการกับคำสั่งซื้อนี้" }, { status: 403 });
  }
  if (order.status === "cancelled" || order.paymentStatus === "paid") {
    return NextResponse.json({ message: "ออเดอร์นี้ไม่สามารถส่งสลิปได้" }, { status: 409 });
  }
  if (order.reservationExpiresAt && new Date(order.reservationExpiresAt).getTime() < Date.now() && order.paymentStatus !== "slip_submitted") {
    return NextResponse.json({ message: "หมดเวลาชำระเงินแล้ว กรุณาติดต่อร้าน" }, { status: 409 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ message: "ระบบจัดเก็บไฟล์ยังไม่พร้อม" }, { status: 503 });
  const path = `${order.id}/${crypto.randomUUID()}.${types[file.type]}`;
  const upload = await fetch(`${url}/storage/v1/object/payment-slips/${path}`, {
    method: "POST", headers: { apikey: key, "Content-Type": file.type, "x-upsert": "false" },
    body: await file.arrayBuffer(),
  });
  if (!upload.ok) return NextResponse.json({ message: "อัปโหลดสลิปไม่สำเร็จ" }, { status: 502 });
  try {
    const rows = await supabaseRest<Array<{ id: string }>>(`orders?id=eq.${encodeURIComponent(id)}&status=neq.cancelled&payment_status=neq.paid&select=id`, {
      serviceRole: true, method: "PATCH", headers: { Prefer: "return=representation" },
      body: JSON.stringify({ slip_path: path, slip_submitted_at: new Date().toISOString(), payment_status: "slip_submitted" }),
    });
    if (!rows[0]) return NextResponse.json({ message: "ออเดอร์นี้ไม่สามารถส่งสลิปได้" }, { status: 409 });
  } catch (error) {
    console.error("Slip record failed", error);
    return NextResponse.json({ message: "บันทึกสลิปไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
  if (process.env.LINE_SUMMARY_TO && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    try { await pushLineMessage(process.env.LINE_SUMMARY_TO, `🧾 ลูกค้าส่งสลิปแล้ว\nออเดอร์ ${order.id.slice(0, 8).toUpperCase()}\nยอด ฿${Number(order.totalPrice).toLocaleString("th-TH")}\nกรุณาตรวจสอบในหน้าแอดมิน`); }
    catch (error) { console.error("Slip LINE notification failed", error); }
  }
  if (order.lineUserId && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    try {
      const itemLines = order.items
        .map((item) => `• ${item.productName} × ${item.quantity} — ฿${(Number(item.price || 0) * item.quantity).toLocaleString("th-TH")}`)
        .join("\n");
      const summary = [
        `🧾 ได้รับสลิปการชำระเงินแล้วครับ`,
        `ออเดอร์ #${order.id.slice(0, 8).toUpperCase()}`,
        "รายการที่สั่ง:",
        itemLines,
        `ค่าส่ง: ฿${Number(order.shippingFee).toLocaleString("th-TH")}`,
        `ยอดรวม: ฿${Number(order.totalPrice).toLocaleString("th-TH")}`,
        "\nขณะนี้กำลังรอแอดมินตรวจสอบสลิป เมื่อยืนยันแล้วจะแจ้งให้ทราบอีกครั้งครับ",
      ].join("\n");
      await pushLineMessage(order.lineUserId, summary);
    }
    catch (error) { console.error("Customer slip confirmation failed", error); }
  }
  return NextResponse.json({ success: true });
}
