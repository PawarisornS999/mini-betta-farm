import type { Order } from "@/types";
import { supabaseRest } from "@/lib/supabase/rest";

export type OrderRow = {
  id: string; customer_name: string; customer_phone: string; customer_address: string | null;
  notes: string | null; subtotal: number | string; discount: number | string;
  shipping_fee: number | string; total_price: number | string; status: Order["status"];
  payment_status: Order["paymentStatus"]; shipping_status: Order["shippingStatus"];
  tracking_number: string | null; slip_path: string | null; line_user_id: string | null;
  tracking_status_code: string | null; tracking_status_description: string | null;
  tracking_checked_at: string | null;
  customer_token?: string; created_at: string; reservation_expires_at: string | null;
  order_items?: Array<{ id: string; product_id: string | null; product_name: string; price: number | string; quantity: number }>;
};

type ProductDetails = { id: string; sku: string | null; gender: "male" | "female" | "unsexed" | null };

export function mapOrder(row: OrderRow, products: Map<string, ProductDetails> = new Map()): Order {
  return {
    id: row.id, customerName: row.customer_name, customerPhone: row.customer_phone,
    customerAddress: row.customer_address || undefined, notes: row.notes || undefined,
    subtotal: Number(row.subtotal), discount: Number(row.discount), shippingFee: Number(row.shipping_fee),
    totalPrice: Number(row.total_price), status: row.status,
    paymentStatus: row.payment_status, shippingStatus: row.shipping_status,
    trackingNumber: row.tracking_number || undefined, slipPath: row.slip_path || undefined,
    trackingStatusCode: row.tracking_status_code || undefined,
    trackingStatusDescription: row.tracking_status_description || undefined,
    trackingCheckedAt: row.tracking_checked_at || undefined,
    lineUserId: row.line_user_id || undefined, customerToken: row.customer_token,
    reservationExpiresAt: row.reservation_expires_at || undefined,
    createdAt: row.created_at,
    items: (row.order_items || []).map((item) => {
      const product = item.product_id ? products.get(item.product_id) : undefined;
      return {
        id: item.id, productId: item.product_id || undefined, productName: item.product_name,
        quantity: item.quantity, price: Number(item.price),
        product: { id: item.product_id || "", name: item.product_name, price: Number(item.price), images: [], sku: product?.sku || undefined, gender: product?.gender || undefined },
        sku: product?.sku || undefined,
        gender: product?.gender || undefined,
      };
    }),
  };
}

const select = "id,customer_name,customer_phone,customer_address,notes,subtotal,discount,shipping_fee,total_price,status,payment_status,shipping_status,tracking_number,tracking_status_code,tracking_status_description,tracking_checked_at,slip_path,line_user_id,customer_token,created_at,reservation_expires_at,order_items(id,product_id,product_name,price,quantity)";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function mapOrdersWithProducts(rows: OrderRow[]): Promise<Order[]> {
  const productIds = [...new Set(rows.flatMap((row) => (row.order_items || []).flatMap((item) => item.product_id ? [item.product_id] : [])))];
  const products = productIds.length
    ? await supabaseRest<ProductDetails[]>(`products?select=id,sku,gender&id=in.(${productIds.map(encodeURIComponent).join(",")})`, { serviceRole: true, cache: "no-store" })
    : [];
  const productMap = new Map(products.map((product) => [product.id, product]));
  return rows.map((row) => mapOrder(row, productMap));
}

export async function getOrder(id: string, token?: string) {
  if (!UUID_RE.test(id)) return null;
  if (token && !UUID_RE.test(token)) return null;
  const filter = token ? `&customer_token=eq.${encodeURIComponent(token)}` : "";
  const rows = await supabaseRest<OrderRow[]>(`orders?select=${select}&id=eq.${encodeURIComponent(id)}${filter}&limit=1`, { serviceRole: true, cache: "no-store" });
  return rows[0] ? (await mapOrdersWithProducts(rows))[0] : null;
}

export async function listOrders() {
  const rows = await supabaseRest<OrderRow[]>(`orders?select=${select}&order=created_at.desc&limit=100`, { serviceRole: true, cache: "no-store" });
  return mapOrdersWithProducts(rows);
}

export async function listCustomerOrders(lineUserId: string) {
  const rows = await supabaseRest<OrderRow[]>(
    `orders?select=${select}&line_user_id=eq.${encodeURIComponent(lineUserId)}&order=created_at.desc&limit=100`,
    { serviceRole: true, cache: "no-store" },
  );
  return mapOrdersWithProducts(rows);
}
