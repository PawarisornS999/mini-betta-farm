import type { RefundRequest } from "@/types";
import { supabaseRest } from "@/lib/supabase/rest";

type RefundRow = {
  id: string;
  line_user_id: string;
  order_id: string | null;
  product_summary: string;
  claimed_amount: number | string;
  payment_reference: string | null;
  customer_note: string | null;
  admin_note: string | null;
  reason: RefundRequest["reason"];
  status: RefundRequest["status"];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

const columns = "id,line_user_id,order_id,product_summary,claimed_amount,payment_reference,customer_note,admin_note,reason,status,created_at,updated_at,resolved_at";

export function mapRefund(row: RefundRow): RefundRequest {
  return {
    id: row.id,
    lineUserId: row.line_user_id,
    orderId: row.order_id || undefined,
    productSummary: row.product_summary,
    claimedAmount: Number(row.claimed_amount),
    paymentReference: row.payment_reference || undefined,
    customerNote: row.customer_note || undefined,
    adminNote: row.admin_note || undefined,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at || undefined,
  };
}

export async function listCustomerRefunds(lineUserId: string) {
  const rows = await supabaseRest<RefundRow[]>(
    `refund_requests?select=${columns}&line_user_id=eq.${encodeURIComponent(lineUserId)}&order=created_at.desc&limit=100`,
    { serviceRole: true, cache: "no-store" },
  );
  return rows.map(mapRefund);
}

export async function listAdminRefunds() {
  const rows = await supabaseRest<RefundRow[]>(
    `refund_requests?select=${columns}&order=created_at.desc&limit=200`,
    { serviceRole: true, cache: "no-store" },
  );
  return rows.map(mapRefund);
}

export async function hasActiveOrderRefund(orderId: string) {
  const rows = await supabaseRest<Array<{ id: string }>>(
    `refund_requests?select=id&order_id=eq.${encodeURIComponent(orderId)}&status=in.(requested,reviewing)&limit=1`,
    { serviceRole: true, cache: "no-store" },
  );
  return rows.length > 0;
}
