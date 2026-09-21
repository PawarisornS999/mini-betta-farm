import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders/data";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ success: true, data: await listOrders() }, { headers: { "Cache-Control": "no-store" } });
}
