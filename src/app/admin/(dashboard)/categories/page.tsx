import CategoriesAdminClient from "@/components/admin/CategoriesAdminClient";
import { getCategories } from "@/lib/supabase/queries";

export default async function AdminCategoriesPage() {
  return <CategoriesAdminClient initialCategories={await getCategories(true)} />;
}
