import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { logAdminActivity } from "@/lib/admin/products";
import { mapProduct, type ProductRow } from "@/lib/supabase/mappers";
import { supabaseRest } from "@/lib/supabase/rest";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const status = body.adminStatus;
  const row = {
    name: body.name?.trim(), sku: body.sku?.trim().toUpperCase(), slug: body.slug?.trim(),
    price: Number(body.price), cost: Number(body.cost ?? 0), description: body.description?.trim() ?? "",
    species: body.species?.trim(), color: body.color?.trim(), category: body.category?.trim() || "betta-fish", gender: body.gender ?? "unsexed",
    pattern: body.pattern?.trim() || null, tail_type: body.tailType?.trim() || body.species?.trim(),
    age_months: body.ageMonths || null, size_cm: body.sizeCm || null,
    admin_status: status, published: status === "available",
    reserved_qty: status === "reserved" ? 1 : 0,
    images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
    badge: body.badge?.trim() || null, featured: Boolean(body.featured),
  };
  try {
    const rows = await supabaseRest<ProductRow[]>(`products?id=eq.${encodeURIComponent(id)}&select=*`, {
      method: "PATCH", serviceRole: true,
      headers: { Prefer: "return=representation" }, body: JSON.stringify(row),
    });
    if (!rows[0]) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    await logAdminActivity(session.username, "product.update", id, { status });
    return NextResponse.json({ success: true, data: mapProduct(rows[0]) });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("products_sku_unique_idx")
      ? "SKU นี้มีอยู่แล้ว" : error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const rows = await supabaseRest<ProductRow[]>(
      `products?id=eq.${encodeURIComponent(id)}&select=id`,
      {
        method: "PATCH",
        serviceRole: true,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ admin_status: "hidden", published: false }),
      },
    );
    if (!rows[0]) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    await logAdminActivity(session.username, "product.hide", id);
    return NextResponse.json({ success: true, data: { hidden: true } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Hide failed" },
      { status: 400 },
    );
  }
}
