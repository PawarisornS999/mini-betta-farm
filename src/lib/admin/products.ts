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

export async function getAdminRevenue(): Promise<{
  total: number;
  orders: number;
  dailySales: Array<{ key: string; label: string; total: number }>;
  monthlySales: Array<{ key: string; label: string; total: number }>;
}> {
  const rows = await supabaseRest<Array<{
    total_price: number | string;
    paid_at: string | null;
    created_at: string;
  }>>(
    "orders?select=total_price,paid_at,created_at&payment_status=eq.paid&order=paid_at.desc.nullslast",
    { serviceRole: true, cache: "no-store" },
  );

  const bangkokDateKey = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };
  const nowParts = bangkokDateKey(new Date()).split("-").map(Number);
  const today = new Date(Date.UTC(nowParts[0], nowParts[1] - 1, nowParts[2]));
  const dailySales = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - (29 - index));
    const key = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(day.getUTCDate()).padStart(2, "0")}`;
    return { key, label: `${String(day.getUTCDate()).padStart(2, "0")}/${String(day.getUTCMonth() + 1).padStart(2, "0")}`, total: 0 };
  });
  const monthlySales = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(Date.UTC(nowParts[0], nowParts[1] - 1 - (11 - index), 1));
    const key = `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`;
    return { key, label: new Intl.DateTimeFormat("th-TH", { month: "short", timeZone: "UTC" }).format(month), total: 0 };
  });
  const dailyByKey = new Map(dailySales.map((point) => [point.key, point]));
  const monthlyByKey = new Map(monthlySales.map((point) => [point.key, point]));
  for (const order of rows) {
    const amount = Number(order.total_price || 0);
    const paidDate = new Date(order.paid_at || order.created_at);
    const dayKey = bangkokDateKey(paidDate);
    const monthKey = dayKey.slice(0, 7);
    const dailyPoint = dailyByKey.get(dayKey);
    const monthlyPoint = monthlyByKey.get(monthKey);
    if (dailyPoint) dailyPoint.total += amount;
    if (monthlyPoint) monthlyPoint.total += amount;
  }
  return {
    total: rows.reduce((sum, order) => sum + Number(order.total_price || 0), 0),
    orders: rows.length,
    dailySales,
    monthlySales,
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
