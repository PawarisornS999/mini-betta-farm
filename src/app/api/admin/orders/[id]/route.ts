import { NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import { getOrder } from "@/lib/orders/data";
import { supabaseRest } from "@/lib/supabase/rest";
import { type OrderAction } from "@/lib/orders/workflow";
import { orderCustomerUrl } from "@/lib/orders/workflow";
import { pushLineMessage } from "@/lib/line/messaging";
import { hasActiveOrderRefund } from "@/lib/refunds/data";

const actions = new Set<OrderAction>([
  "quote_shipping",
  "paid",
  "reject_slip",
  "ready_to_ship",
  "shipped",
  "delivered",
  "tracking",
  "cancel",
]);
const labels: Record<OrderAction, string> = {
  quote_shipping: "อัปเดตค่าส่งแล้ว",
  paid: "ยืนยันการชำระเงินแล้ว",
  reject_slip: "กรุณาส่งสลิปใหม่",
  ready_to_ship: "กำลังเตรียมจัดส่ง",
  shipped: "จัดส่งแล้ว",
  delivered: "ส่งถึงแล้ว",
  tracking: "เพิ่มเลขพัสดุแล้ว",
  cancel: "ยกเลิกแล้ว",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "orders.update"))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = (await request.json()) as {
    action?: OrderAction;
    value?: string;
  };
  if (!body.action || !actions.has(body.action))
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  try {
    const before = await getOrder(id);
    if (!before)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    if (before.status === "cancelled") {
      return NextResponse.json(
        { message: "ออเดอร์ที่ยกเลิกแล้วไม่สามารถดำเนินการต่อ" },
        { status: 409 },
      );
    }
    if (await hasActiveOrderRefund(id)) {
      return NextResponse.json(
        {
          message:
            "ออเดอร์นี้อยู่ระหว่างตรวจสอบคืนเงิน กรุณาจัดการในหน้าคืนเงิน",
        },
        { status: 409 },
      );
    }
    await supabaseRest("rpc/admin_update_order", {
      method: "POST",
      serviceRole: true,
      body: JSON.stringify({
        p_order_id: id,
        p_action: body.action,
        p_value: body.value ?? null,
      }),
    });
    const order = await getOrder(id);
    try {
      await supabaseRest("activity_logs", {
        method: "POST",
        serviceRole: true,
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          admin_name: session.username,
          action: `order.${body.action}`,
          resource_type: "order",
          resource_id: id,
          details: { value: body.value ?? null },
        }),
      });
    } catch (logError) {
      console.error("Order activity log failed", logError);
    }
    if (before.lineUserId && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      try {
        await pushLineMessage(
          before.lineUserId,
          `🐟 ออเดอร์ ${id.slice(0, 8).toUpperCase()}: ${labels[body.action]}${body.action === "tracking" ? ` ${body.value}` : ""}\nดูรายละเอียด: ${orderCustomerUrl(id)}`,
        );
      } catch (error) {
        console.error("Customer LINE update failed", error);
      }
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "อัปเดตออเดอร์ไม่สำเร็จ",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "orders.delete"))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const order = await getOrder(id);
    if (!order)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    const refunds = await supabaseRest<Array<{ id: string }>>(
      `refund_requests?select=id&order_id=eq.${encodeURIComponent(id)}&limit=1`,
      { serviceRole: true, cache: "no-store" },
    );
    if (refunds.length > 0) {
      return NextResponse.json(
        { message: "ออเดอร์นี้มีประวัติคำร้องคืนเงิน จึงไม่สามารถลบได้" },
        { status: 409 },
      );
    }

    await supabaseRest(`orders?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      serviceRole: true,
      headers: { Prefer: "return=minimal" },
    });
    try {
      await supabaseRest("activity_logs", {
        method: "POST",
        serviceRole: true,
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          admin_name: session.username,
          action: "order.delete",
          resource_type: "order",
          resource_id: id,
          details: { customerName: order.customerName },
        }),
      });
    } catch (logError) {
      console.error("Order deletion activity log failed", logError);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "ลบออเดอร์ไม่สำเร็จ",
      },
      { status: 400 },
    );
  }
}
