import type { Order } from "@/types";

export const SHIPPING_FEE = 80;
export type OrderAction = "quote_shipping" | "paid" | "reject_slip" | "ready_to_ship" | "shipped" | "delivered" | "tracking" | "cancel";

export function orderTotal(subtotal: number, shippingFee: number, discount = 0) {
  if (![subtotal, shippingFee, discount].every((value) => Number.isFinite(value) && value >= 0)) {
    throw new Error("Invalid order amount");
  }
  return Math.max(0, subtotal + shippingFee - discount);
}

export function canUpdateOrder(order: Pick<Order, "status" | "paymentStatus" | "shippingStatus" | "slipPath">, action: OrderAction) {
  if (action === "cancel") return order.status !== "cancelled" && order.paymentStatus !== "paid" && order.shippingStatus === "pending";
  if (order.status === "cancelled") return false;
  if (action === "paid") return order.paymentStatus === "slip_submitted" && Boolean(order.slipPath);
  if (action === "reject_slip") return order.paymentStatus === "slip_submitted";
  if (action === "quote_shipping") return order.paymentStatus !== "paid";
  if (action === "ready_to_ship") return order.paymentStatus === "paid";
  if (action === "shipped") return order.paymentStatus === "paid" && order.shippingStatus === "ready_to_ship";
  if (action === "delivered") return order.shippingStatus === "shipped";
  if (action === "tracking") return order.paymentStatus === "paid";
  return false;
}

export function shortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function formatMoney(amount: number) {
  return `฿${amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function orderCustomerUrl(id: string, token: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  return `${site}/orders/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`;
}
