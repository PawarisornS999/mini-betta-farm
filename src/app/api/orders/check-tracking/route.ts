import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase/rest";
import { trackThailandPost } from "@/lib/thailand-post";
import { isDeliveredTrackingEvent, latestTrackingEvent } from "@/lib/orders/tracking";
import { pushLineMessage } from "@/lib/line/messaging";
import { orderCustomerUrl } from "@/lib/orders/workflow";

type ShippedOrder = {
  id: string;
  tracking_number: string;
  line_user_id: string | null;
};

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let checked = 0;
  let delivered = 0;
  let failed = 0;
  let cursor = "";
  try {
    while (true) {
      const orders = await supabaseRest<ShippedOrder[]>(
        `orders?select=id,tracking_number,line_user_id&shipping_status=eq.shipped&status=neq.cancelled&tracking_number=not.is.null&id=gt.${encodeURIComponent(cursor || "00000000-0000-0000-0000-000000000000")}&order=id.asc&limit=100`,
        { serviceRole: true, cache: "no-store" },
      );
      if (!orders.length) break;
      for (const order of orders) {
        cursor = order.id;
        try {
          const events = await trackThailandPost(order.tracking_number);
          const latest = latestTrackingEvent(events);
          const isDelivered = isDeliveredTrackingEvent(latest);
          const shouldNotify = await supabaseRest<boolean>("rpc/record_order_tracking", {
            method: "POST",
            serviceRole: true,
            body: JSON.stringify({
              p_order_id: order.id,
              p_tracking_number: order.tracking_number,
              p_status_code: latest?.status || null,
              p_status_description: latest?.statusDescription || null,
              p_delivered: isDelivered,
            }),
          });
          checked += 1;
          if (isDelivered && shouldNotify) {
            delivered += 1;
            if (order.line_user_id && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
              try {
                await pushLineMessage(order.line_user_id, `🐟 ออเดอร์ ${order.id.slice(0, 8).toUpperCase()}: พัสดุส่งถึงแล้ว\nดูรายละเอียด: ${orderCustomerUrl(order.id)}`);
              } catch (error) {
                console.error("Delivery LINE notification failed", order.id, error);
              }
            }
          }
        } catch (error) {
          failed += 1;
          console.error("Tracking check failed", order.id, error);
        }
      }
      if (orders.length < 100) break;
    }
    return NextResponse.json({ success: true, checked, delivered, failed });
  } catch (error) {
    console.error("Tracking batch failed", error);
    return NextResponse.json({ message: "Tracking batch failed", checked, delivered, failed }, { status: 502 });
  }
}
