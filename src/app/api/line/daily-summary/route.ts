import { NextResponse } from "next/server";
import { pushLineMessage } from "@/lib/line/messaging";
import { supabaseRest } from "@/lib/supabase/rest";

type OrderRow = { total_price: number | string; status: string; payment_status: string };
type ProductRow = { stock_qty: number; admin_status: string };

function bangkokDayRange() {
  const shifted = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const start = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - 7 * 60 * 60 * 1000;
  return { start: new Date(start), end: new Date(start + 24 * 60 * 60 * 1000) };
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const recipient = process.env.LINE_SUMMARY_TO;
  if (!recipient) return NextResponse.json({ message: "LINE_SUMMARY_TO is not configured" }, { status: 503 });

  const { start, end } = bangkokDayRange();
  const [orders, products] = await Promise.all([
    supabaseRest<OrderRow[]>(`orders?select=total_price,status,payment_status&created_at=gte.${encodeURIComponent(start.toISOString())}&created_at=lt.${encodeURIComponent(end.toISOString())}`, { serviceRole: true, cache: "no-store" }),
    supabaseRest<ProductRow[]>("products?select=stock_qty,admin_status", { serviceRole: true, cache: "no-store" }),
  ]);
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const paidOrders = activeOrders.filter((order) => order.payment_status === "paid");
  const sales = paidOrders.reduce((sum, order) => sum + Number(order.total_price), 0);
  const lowStock = products.filter((product) => product.stock_qty > 0 && product.stock_qty <= 3).length;
  const soldOut = products.filter((product) => product.stock_qty === 0 || product.admin_status === "sold").length;
  const date = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", dateStyle: "medium" }).format(new Date());
  const text = `📊 สรุปยอด Mini Betta Farm\n${date}\n━━━━━━━━━━━━\nคำสั่งซื้อวันนี้: ${activeOrders.length} รายการ\nชำระเงินแล้ว: ${paidOrders.length} รายการ\nยอดขายที่ชำระแล้ว: ฿${sales.toLocaleString("th-TH")}\nยกเลิก: ${orders.length - activeOrders.length} รายการ\nสต็อกต่ำ: ${lowStock} รายการ\nสินค้าหมด/ขายแล้ว: ${soldOut} รายการ\n━━━━━━━━━━━━\nดูรายละเอียดเพิ่มเติมได้ที่หน้า Admin`;
  await pushLineMessage(recipient, text);
  return NextResponse.json({ success: true, orders: activeOrders.length, sales, lowStock, soldOut });
}
