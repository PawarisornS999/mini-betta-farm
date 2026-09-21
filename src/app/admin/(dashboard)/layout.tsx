import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import AdminShell from "@/components/admin/AdminShell";
import { LanguageProvider } from "@/components/admin/LanguageProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <LanguageProvider><AdminShell username={session.username}>{children}</AdminShell></LanguageProvider>;
}
