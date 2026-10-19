import { redirect } from "next/navigation";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import PaymentSettingsClient from "@/components/admin/PaymentSettingsClient";

export default async function PaymentSettingsPage() {
  if (!hasPermission(await getAdminSession(), "payment.view")) redirect("/admin/forbidden");
  return <PaymentSettingsClient />;
}
