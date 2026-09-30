import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders/data";
import { supabaseRest } from "@/lib/supabase/rest";
import { getLineSession } from "@/lib/line/login";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getLineSession();
  if (!session) return NextResponse.json({ message: "LINE login required" }, { status: 401 });
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  if (!order.lineUserId || order.lineUserId !== session.userId) {
    return NextResponse.json({ message: "คุณไม่มีสิทธิ์ดูคำสั่งซื้อนี้" }, { status: 403 });
  }
  const settings = await supabaseRest<Array<{
    payment_bank: string | null; payment_account_name: string | null; payment_account_number: string | null; payment_promptpay_number: string | null;
  }>>("store_settings?id=eq.default&select=payment_bank,payment_account_name,payment_account_number,payment_promptpay_number", { serviceRole: true });
  const { customerToken: _token, lineUserId: _lineUser, slipPath: _slipPath, ...safeOrder } = order;
  void _token; void _lineUser; void _slipPath;
  return NextResponse.json({ success: true, data: {
    order: { ...safeOrder, hasSlip: Boolean(order.slipPath) },
    payment: {
      bank: settings[0]?.payment_bank || null,
      accountName: settings[0]?.payment_account_name || null,
      accountNumber: settings[0]?.payment_account_number || null,
      promptpayNumber: settings[0]?.payment_promptpay_number || null,
    },
  } }, { headers: { "Cache-Control": "no-store" } });
}
