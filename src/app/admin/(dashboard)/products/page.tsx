import { redirect } from "next/navigation";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import ProductsAdminClient from "@/components/admin/ProductsAdminClient";
import { getAdminProducts } from "@/lib/admin/products";
import { getCategories } from "@/lib/supabase/queries";

export default async function AdminProductsPage() {
  if (!hasPermission(await getAdminSession(), "products.view")) redirect("/admin/forbidden");
  const [products, categories] = await Promise.all([getAdminProducts(), getCategories(true)]);
  return <ProductsAdminClient initialProducts={products} categories={categories} />;
}
