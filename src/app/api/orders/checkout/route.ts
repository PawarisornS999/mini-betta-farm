import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase/rest";
import type { CheckoutPayload, Order } from "@/types";
import { formatOrderNotification, orderFlexMessage, pushLineFlex, pushLineMessage } from "@/lib/line/messaging";

export async function POST(request: Request) {
  try {
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
      }),
    });

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
