import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { promptPayPayload } from "@/lib/orders/promptpay";
import { getLineSession } from "@/lib/line/login";
import { getOrder } from "@/lib/orders/data";
import { supabaseRest } from "@/lib/supabase/rest";

const privateHeaders = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ message: "LINE login required" }, { status: 401, headers: privateHeaders });

  const { id } = await params;
  const order = await getOrder(id);
  if (!order || order.lineUserId !== session.userId) {
    return NextResponse.json({ message: "Order not found" }, { status: 404, headers: privateHeaders });
  }
  if (order.status === "cancelled" || order.paymentStatus === "paid" || order.paymentStatus === "slip_submitted" || (order.reservationExpiresAt && new Date(order.reservationExpiresAt).getTime() <= Date.now())) {
    return NextResponse.json({ message: "Payment unavailable" }, { status: 409, headers: privateHeaders });
  }

  const settings = await supabaseRest<Array<{ payment_promptpay_number: string | null }>>(
    "store_settings?id=eq.default&select=payment_promptpay_number",
    { serviceRole: true, cache: "no-store" },
  );
  const promptpay = settings[0]?.payment_promptpay_number?.replace(/\D/g, "");
  if (!promptpay || !/^(?:\d{10}|\d{13})$/.test(promptpay)) {
    return NextResponse.json({ message: "PromptPay unavailable" }, { status: 404, headers: privateHeaders });
  }

  const amount = Number(order.totalPrice);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: "Invalid order amount" }, { status: 400, headers: privateHeaders });
  }

  const svg = await QRCode.toString(promptPayPayload(promptpay, amount), {
    type: "svg",
    width: 256,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  return new Response(svg, {
    headers: { ...privateHeaders, "Content-Type": "image/svg+xml; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}
