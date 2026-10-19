import { redirect } from "next/navigation";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import DashboardAdminClient from "@/components/admin/DashboardAdminClient";
import { getAdminProducts, getAdminRevenue } from "@/lib/admin/products";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!hasPermission(await getAdminSession(), "dashboard.view")) redirect("/admin/forbidden");
  const [products, revenue] = await Promise.all([
    getAdminProducts(),
    getAdminRevenue(),
  ]);
  return <DashboardAdminClient products={products} revenue={revenue} />;
}
