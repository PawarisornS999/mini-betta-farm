import ProductsAdminClient from "@/components/admin/ProductsAdminClient";
import { getAdminProducts } from "@/lib/admin/products";
import { getCategories } from "@/lib/supabase/queries";

export default async function AdminInventoryPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getCategories(true)]);
  return <ProductsAdminClient initialProducts={products} categories={categories} />;
}
