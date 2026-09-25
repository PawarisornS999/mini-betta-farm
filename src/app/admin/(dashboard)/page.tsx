import DashboardAdminClient from "@/components/admin/DashboardAdminClient";
import { getAdminProducts, getAdminRevenue } from "@/lib/admin/products";

export default async function AdminDashboardPage() {
  const [products, revenue] = await Promise.all([
    getAdminProducts(),
    getAdminRevenue(),
  ]);
  return <DashboardAdminClient products={products} revenue={revenue} />;
}
