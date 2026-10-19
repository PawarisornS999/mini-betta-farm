import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import ManageAdminClient from "@/components/admin/ManageAdminClient";

export default async function ManagePage() {
  const session = await getAdminSession();
  if (!session?.isOwner) redirect("/admin");
  return <ManageAdminClient currentId={session.id} />;
}
