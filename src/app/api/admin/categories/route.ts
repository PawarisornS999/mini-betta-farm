import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getCategories } from "@/lib/supabase/queries";
import { supabaseRest } from "@/lib/supabase/rest";
import { mapCategory, type CategoryRow } from "@/lib/supabase/mappers";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category";
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Category request failed";
  return message.includes("categories_slug_key") ? "หมวดหมู่นี้มีอยู่แล้ว" : message;
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ success: true, data: await getCategories(true) });
  } catch (error) {
    return NextResponse.json({ success: false, message: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { name?: string; slug?: string; description?: string; image?: string; sortOrder?: number; isActive?: boolean };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ success: false, message: "กรุณากรอกชื่อหมวดหมู่" }, { status: 400 });
  try {
    const rows = await supabaseRest<CategoryRow[]>("categories?select=*", {
      method: "POST", serviceRole: true, headers: { Prefer: "return=representation" },
      body: JSON.stringify({ name, slug: slugify(body.slug || name), description: body.description?.trim() || null, image: body.image?.trim() || null, sort_order: Number(body.sortOrder ?? 0), is_active: body.isActive !== false }),
    });
    return NextResponse.json({ success: true, data: mapCategory(rows[0]) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: errorMessage(error) }, { status: 400 });
  }
}
