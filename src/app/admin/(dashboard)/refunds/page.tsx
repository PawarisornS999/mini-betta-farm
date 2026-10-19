import { redirect } from "next/navigation";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import AdminRefundsClient from "@/components/admin/AdminRefundsClient";

export default async function AdminRefundsPage() {
  if (!hasPermission(await getAdminSession(), "refunds.view")) redirect("/admin/forbidden");
  return <AdminRefundsClient />;
}
