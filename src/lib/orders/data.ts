import type { Order } from "@/types";
import { supabaseRest } from "@/lib/supabase/rest";

export type OrderRow = {
  id: string; customer_name: string; customer_phone: string; customer_address: string | null;
  notes: string | null; subtotal: number | string; shipping_fee: number | string;
  discount: number | string; total_price: number | string; status: Order["status"];
  payment_status: Order["paymentStatus"]; shipping_status: Order["shippingStatus"];
  tracking_number: string | null; slip_path: string | null; line_user_id: string | null;
  customer_token?: string; created_at: string; reservation_expires_at: string | null;
  order_items?: Array<{ id: string; product_id: string; product_name: string; price: number | string; quantity: number }>;
};

export function mapOrder(row: OrderRow): Order {
  return {
    id: row.id, customerName: row.customer_name, customerPhone: row.customer_phone,
    customerAddress: row.customer_address || undefined, notes: row.notes || undefined,
    subtotal: Number(row.subtotal), shippingFee: Number(row.shipping_fee),
    totalPrice: Number(row.total_price), status: row.status,
    paymentStatus: row.payment_status, shippingStatus: row.shipping_status,
    trackingNumber: row.tracking_number || undefined, slipPath: row.slip_path || undefined,
    lineUserId: row.line_user_id || undefined, customerToken: row.customer_token,
    reservationExpiresAt: row.reservation_expires_at || undefined,
    createdAt: row.created_at,
    items: (row.order_items || []).map((item) => ({
      id: item.id, productId: item.product_id, productName: item.product_name,
      quantity: item.quantity, price: Number(item.price),
      product: { id: item.product_id, name: item.product_name, price: Number(item.price), images: [] },
    })),
  };
}

const select = "id,customer_name,customer_phone,customer_address,notes,subtotal,shipping_fee,discount,total_price,status,payment_status,shipping_status,tracking_number,slip_path,line_user_id,customer_token,created_at,reservation_expires_at,order_items(id,product_id,product_name,price,quantity)";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrder(id: string, token?: string) {
  if (!UUID_RE.test(id)) return null;
  if (token && !UUID_RE.test(token)) return null;
  const filter = token ? `&customer_token=eq.${encodeURIComponent(token)}` : "";
  const rows = await supabaseRest<OrderRow[]>(`orders?select=${select}&id=eq.${encodeURIComponent(id)}${filter}&limit=1`, { serviceRole: true, cache: "no-store" });
  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function listOrders() {
  const rows = await supabaseRest<OrderRow[]>(`orders?select=${select}&order=created_at.desc&limit=100`, { serviceRole: true, cache: "no-store" });
  return rows.map(mapOrder);
}
