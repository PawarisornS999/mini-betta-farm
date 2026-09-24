import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase/rest";
import type { CheckoutPayload, Order } from "@/types";
import { customerOrderFlexMessage, formatOrderNotification, orderFlexMessage, pushLineFlex, pushLineMessage } from "@/lib/line/messaging";
import { getLineFriendship, getLineSession, LINE_SESSION_COOKIE } from "@/lib/line/login";
import { orderCustomerUrl } from "@/lib/orders/workflow";

export async function POST(request: Request) {
  try {
    const lineSession = await getLineSession();
    if (!lineSession) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบด้วย LINE ก่อนยืนยันออเดอร์", code: "LINE_LOGIN_REQUIRED" },
        { status: 401 },
      );
    }
    if (!(await getLineFriendship(lineSession.accessToken))) {
      const response = NextResponse.json(
        { success: false, message: "กรุณาเพิ่ม LINE Official Account เป็นเพื่อนก่อนยืนยันออเดอร์", code: "LINE_FRIEND_REQUIRED" },
        { status: 403 },
      );
      response.cookies.delete(LINE_SESSION_COOKIE);
      return response;
    }

    const body = (await request.json()) as CheckoutPayload;
    if (!body.customerName?.trim() || !body.customerPhone?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name and phone are required", code: "INVALID_CUSTOMER" },
        { status: 400 },
      );
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty", code: "EMPTY_CART" },
        { status: 400 },
      );
    }
    if (body.items.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      return NextResponse.json(
        { success: false, message: "Invalid order items", code: "INVALID_ITEMS" },
        { status: 400 },
      );
    }

    const order = await supabaseRest<Order>("rpc/place_order", {
      method: "POST",
      body: JSON.stringify({
        p_customer_name: body.customerName,
        p_customer_phone: body.customerPhone,
        p_customer_address: body.customerAddress ?? "",
        p_notes: body.notes ?? "",
        p_items: body.items,
        p_line_user_id: lineSession.userId,
      }),
      serviceRole: true,
    });

    if (process.env.LINE_CHANNEL_ACCESS_TOKEN && order.customerToken) {
      try {
        await pushLineFlex(
          lineSession.userId,
          customerOrderFlexMessage(
            order,
            orderCustomerUrl(order.id, order.customerToken),
          ),
        );
      } catch (lineError) {
        console.error("LINE customer order notification failed", lineError);
      }
    }

    const lineRecipient = process.env.LINE_SUMMARY_TO;
    if (lineRecipient && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      try {
        const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"}/admin/orders`;
        await pushLineFlex(lineRecipient, orderFlexMessage(order, adminUrl));
      } catch (lineError) {
        console.error("LINE order notification failed", lineError);
        try { await pushLineMessage(lineRecipient, formatOrderNotification(order)); } catch (fallbackError) { console.error("LINE fallback failed", fallbackError); }
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Checkout failed", error);
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json(
      { success: false, message, code: "CHECKOUT_FAILED" },
      { status: 400 },
    );
  }
}
