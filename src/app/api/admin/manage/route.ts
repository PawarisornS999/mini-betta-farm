import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin/manage";
import { supabaseRest } from "@/lib/supabase/rest";

export async function GET() {
  if (!(await requireOwner())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const [roles, users, permissions] = await Promise.all([
    supabaseRest("admin_roles?select=id,name,permissions,is_system&order=name", { serviceRole: true, cache: "no-store" }),
    supabaseRest("admin_users?select=id,username,role_id,is_owner,is_active,last_login_at,created_at&order=created_at", { serviceRole: true, cache: "no-store" }),
    supabaseRest("admin_permissions?select=id,key,name,description,grants_permission&order=name", { serviceRole: true, cache: "no-store" }),
  ]);
  return NextResponse.json({ roles, users, permissions });
}
