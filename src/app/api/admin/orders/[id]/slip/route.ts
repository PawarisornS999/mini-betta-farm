import { NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import { getOrder } from "@/lib/orders/data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "orders.view")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const order = await getOrder(id);
  if (!order?.slipPath) return NextResponse.json({ message: "ไม่พบสลิป" }, { status: 404 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ message: "Storage unavailable" }, { status: 503 });
  const response = await fetch(`${url}/storage/v1/object/sign/payment-slips/${order.slipPath}`, {
    method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 60 }),
  });
  if (!response.ok) return NextResponse.json({ message: "เปิดสลิปไม่สำเร็จ" }, { status: 502 });
  const data = await response.json() as { signedURL: string };
  return NextResponse.json({ url: `${url}/storage/v1${data.signedURL}` }, { headers: { "Cache-Control": "no-store" } });
}
