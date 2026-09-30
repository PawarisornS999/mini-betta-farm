import { NextResponse } from "next/server";
import { getLineSession } from "@/lib/line/login";
import { listCustomerOrders } from "@/lib/orders/data";

export async function GET() {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ message: "LINE login required" }, { status: 401 });
  try {
    const orders = await listCustomerOrders(session.userId);
    return NextResponse.json({ success: true, data: orders }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Customer orders load failed", error);
    return NextResponse.json({ message: "โหลดรายการซื้อไม่สำเร็จ" }, { status: 500 });
  }
}
