import type { Product } from "@/types";
import { mapProduct, type ProductRow } from "@/lib/supabase/mappers";
import { supabaseRest } from "@/lib/supabase/rest";

export async function getAdminProducts(): Promise<Product[]> {
  const rows = await supabaseRest<ProductRow[]>("products?select=*&order=updated_at.desc", {
    serviceRole: true,
    cache: "no-store",
  });
  return rows.map(mapProduct);
}

export async function getAdminRevenue(): Promise<{ total: number; orders: number }> {
  const rows = await supabaseRest<Array<{ total_price: number | string }>>(
    "orders?select=total_price&payment_status=eq.paid",
    { serviceRole: true, cache: "no-store" },
  );
  return {
    total: rows.reduce((sum, order) => sum + Number(order.total_price), 0),
    orders: rows.length,
  };
}

export async function logAdminActivity(
  adminName: string,
  action: string,
  resourceId: string,
  details: Record<string, unknown> = {},
) {
  await supabaseRest("activity_logs", {
    method: "POST",
    serviceRole: true,
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      admin_name: adminName,
      action,
      resource_type: "product",
      resource_id: resourceId,
      details,
    }),
  });
}
