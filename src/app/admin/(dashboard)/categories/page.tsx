import { redirect } from "next/navigation";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import CategoriesAdminClient from "@/components/admin/CategoriesAdminClient";
import { getCategories } from "@/lib/supabase/queries";

export default async function AdminCategoriesPage() {
  if (!hasPermission(await getAdminSession(), "categories.view")) redirect("/admin/forbidden");
  return <CategoriesAdminClient initialCategories={await getCategories(true)} />;
}
