import { NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders/data";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "orders.view")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  return NextResponse.json({ success: true, data: await listOrders() }, { headers: { "Cache-Control": "no-store" } });
}
