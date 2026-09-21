import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { supabaseRest } from "@/lib/supabase/rest";
import { mapCategory, type CategoryRow } from "@/lib/supabase/mappers";

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category"; }

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json() as { name?: string; slug?: string; description?: string; image?: string; sortOrder?: number; isActive?: boolean };
  if (!body.name?.trim()) return NextResponse.json({ success: false, message: "กรุณากรอกชื่อหมวดหมู่" }, { status: 400 });
  try {
    const current = await supabaseRest<Array<{ slug: string }>>(`categories?id=eq.${encodeURIComponent(id)}&select=slug`, { serviceRole: true });
    if (!current[0]) return NextResponse.json({ success: false, message: "ไม่พบหมวดหมู่" }, { status: 404 });
    const nextSlug = slugify(body.slug || body.name);
    const rows = await supabaseRest<CategoryRow[]>(`categories?id=eq.${encodeURIComponent(id)}&select=*`, {
      method: "PATCH", serviceRole: true, headers: { Prefer: "return=representation" },
      body: JSON.stringify({ name: body.name.trim(), slug: nextSlug, description: body.description?.trim() || null, image: body.image?.trim() || null, sort_order: Number(body.sortOrder ?? 0), is_active: body.isActive !== false, updated_at: new Date().toISOString() }),
    });
    if (!rows[0]) return NextResponse.json({ success: false, message: "ไม่พบหมวดหมู่" }, { status: 404 });
    if (current[0].slug !== nextSlug) {
      await supabaseRest(`products?category=eq.${encodeURIComponent(current[0].slug)}`, {
        method: "PATCH", serviceRole: true, headers: { Prefer: "return=minimal" }, body: JSON.stringify({ category: nextSlug }),
      });
    }
    return NextResponse.json({ success: true, data: mapCategory(rows[0]) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error && error.message.includes("categories_slug_key") ? "หมวดหมู่นี้มีอยู่แล้ว" : "บันทึกหมวดหมู่ไม่สำเร็จ" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await supabaseRest(`categories?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", serviceRole: true, headers: { Prefer: "return=minimal" }, body: JSON.stringify({ is_active: false, updated_at: new Date().toISOString() }) });
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "ซ่อนหมวดหมู่ไม่สำเร็จ" }, { status: 400 }); }
}
