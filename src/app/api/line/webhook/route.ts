import { NextResponse } from "next/server";
import { buildAutoReply, parseOrderCommand, replyLineMessage, verifyLineSignature } from "@/lib/line/messaging";
import { getOrder } from "@/lib/orders/data";
import { supabaseRest } from "@/lib/supabase/rest";

type LineEvent = { type?: string; replyToken?: string; source?: { userId?: string }; message?: { type?: string; text?: string } };

async function handleEvent(event: LineEvent) {
  if (!event.replyToken) return;
  if (event.type === "follow") return replyLineMessage(event.replyToken, buildAutoReply("hello"));
  if (event.type !== "message" || event.message?.type !== "text") return;
  const message = event.message.text || "";
  const command = parseOrderCommand(message);
  if (command && event.source?.userId) {
    const order = await getOrder(command.id, command.token);
    if (!order) return replyLineMessage(event.replyToken, "ไม่พบออเดอร์ กรุณาเปิดลิงก์ออเดอร์จากเว็บอีกครั้งค่ะ");
    if (order.lineUserId && order.lineUserId !== event.source.userId) {
      return replyLineMessage(event.replyToken, "ออเดอร์นี้เชื่อมกับ LINE บัญชีอื่นแล้ว กรุณาติดต่อแอดมินค่ะ");
    }
    const linked = await supabaseRest<Array<{ id: string }>>(`orders?id=eq.${encodeURIComponent(order.id)}&customer_token=eq.${encodeURIComponent(command.token)}&or=(line_user_id.is.null,line_user_id.eq.${encodeURIComponent(event.source.userId)})&select=id`, {
      method: "PATCH", serviceRole: true, headers: { Prefer: "return=representation" },
      body: JSON.stringify({ line_user_id: event.source.userId }),
    });
    if (!linked[0]) return replyLineMessage(event.replyToken, "ออเดอร์นี้เชื่อมกับ LINE บัญชีอื่นแล้ว กรุณาติดต่อแอดมินค่ะ");
    return replyLineMessage(event.replyToken, `รับออเดอร์ ${order.id.slice(0, 8).toUpperCase()} แล้วค่ะ 🐟\nยอดรวม ฿${Number(order.totalPrice || 0).toLocaleString("th-TH")} (รวมค่าส่ง)\nกรุณาชำระเงินและอัปโหลดสลิปในหน้าออเดอร์บนเว็บ`);
  }
  return replyLineMessage(event.replyToken, buildAutoReply(message));
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyLineSignature(rawBody, request.headers.get("x-line-signature"))) {
    return NextResponse.json({ message: "Invalid LINE signature" }, { status: 401 });
  }

  let payload: { events?: LineEvent[] };
  try { payload = JSON.parse(rawBody) as { events?: LineEvent[] }; }
  catch { return NextResponse.json({ message: "Invalid payload" }, { status: 400 }); }
  await Promise.all((payload.events ?? []).map(handleEvent));
  return NextResponse.json({ success: true });
}
