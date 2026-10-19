import { redirect } from "next/navigation";
import { supabaseRest } from "@/lib/supabase/rest";
import SetupOwnerForm from "@/components/admin/SetupOwnerForm";

export const dynamic = "force-dynamic";
export default async function AdminSetupPage() {
  let users: Array<{ id: string; is_owner: boolean; is_active: boolean; setup_completed: boolean }>;
  try {
    users = await supabaseRest<Array<{ id: string; is_owner: boolean; is_active: boolean; setup_completed: boolean }>>("admin_users?select=id,is_owner,is_active,setup_completed&limit=2", { serviceRole: true, cache: "no-store" });
  } catch {
    return <main className="mx-auto max-w-xl p-8"><h1 className="text-xl font-bold">ยังเปิดหน้าตั้งค่าไม่ได้</h1><p className="mt-3">กรุณารัน migration 202610200003_admin_setup_existing_owner.sql ใน Supabase ก่อน แล้วโหลดหน้านี้อีกครั้ง</p></main>;
  }
  const legacyOwner = users.length === 1 && users[0].is_owner && users[0].is_active && !users[0].setup_completed;
  if (users.length && !legacyOwner) redirect("/admin/login");
  return <SetupOwnerForm />;
}
