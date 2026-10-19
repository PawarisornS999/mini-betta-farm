import { redirect } from "next/navigation";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import OrdersAdminClient from "@/components/admin/OrdersAdminClient";

export default async function AdminOrdersPage() {
  if (!hasPermission(await getAdminSession(), "orders.view")) redirect("/admin/forbidden");
  return <OrdersAdminClient />;
}
