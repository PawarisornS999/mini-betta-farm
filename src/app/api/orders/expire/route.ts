import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase/rest";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const orders = await supabaseRest<Array<{ id: string }>>(
    `orders?select=id&status=eq.pending&payment_status=in.(pending,awaiting_slip,rejected)&reservation_expires_at=lt.${encodeURIComponent(new Date().toISOString())}&order=reservation_expires_at.asc&limit=100`,
    { serviceRole: true, cache: "no-store" },
  );
  let expired = 0;
  for (const order of orders) {
    try {
      await supabaseRest("rpc/admin_update_order", { method: "POST", serviceRole: true,
        body: JSON.stringify({ p_order_id: order.id, p_action: "cancel", p_value: "expired" }) });
      expired += 1;
    } catch (error) { console.error("Failed to expire order", order.id, error); }
  }
  return NextResponse.json({ success: true, expired });
}
