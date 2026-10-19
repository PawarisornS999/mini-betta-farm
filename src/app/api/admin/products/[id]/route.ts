import { NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import { logAdminActivity } from "@/lib/admin/products";
import { mapProduct, type ProductRow } from "@/lib/supabase/mappers";
import { supabaseRest } from "@/lib/supabase/rest";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "products.edit")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();
  const salePrice = body.salePrice == null || body.salePrice === "" ? null : Number(body.salePrice);
  const basePrice = Number(body.price);
  const hasSale = salePrice != null || body.saleStartDate || body.saleEndDate;
  if (!Number.isFinite(basePrice) || basePrice < 0) return NextResponse.json({ success: false, message: "ราคาสินค้าไม่ถูกต้อง" }, { status: 400 });
  if (hasSale && (salePrice == null || !body.saleStartDate || !body.saleEndDate || !Number.isFinite(salePrice) || salePrice < 0 || salePrice >= basePrice)) {
    return NextResponse.json({ success: false, message: "กรุณาระบุราคาส่วนลดที่ต่ำกว่าราคาปกติ พร้อมวันเริ่มและวันสิ้นสุด" }, { status: 400 });
  }
  if (hasSale && (!/^\d{4}-\d{2}-\d{2}$/.test(body.saleStartDate) || !/^\d{4}-\d{2}-\d{2}$/.test(body.saleEndDate) || body.saleEndDate < body.saleStartDate)) {
    return NextResponse.json({ success: false, message: "ช่วงวันที่ส่วนลดไม่ถูกต้อง" }, { status: 400 });
  }
  const status = body.adminStatus;
  const row = {
    name: body.name?.trim(), sku: body.sku?.trim().toUpperCase(), slug: body.slug?.trim(),
    price: basePrice, sale_price: salePrice, sale_start_date: body.saleStartDate || null, sale_end_date: body.saleEndDate || null,
    cost: Number(body.cost ?? 0), description: body.description?.trim() ?? "",
    species: body.species?.trim(), color: body.color?.trim(), category: body.category?.trim() || "betta-fish", gender: body.gender ?? "unsexed", difficulty_level: body.difficultyLevel ?? "beginner",
    pattern: body.pattern?.trim() || null, tail_type: body.tailType?.trim() || body.species?.trim(),
    age_months: body.ageMonths ?? null, size_cm: body.sizeInches == null ? body.sizeCm ?? null : Math.round(body.sizeInches * 2.54 * 100) / 100,
    // Keep sold fish published so customers can still see them in Products.
    admin_status: status, published: status !== "hidden" && status !== "draft",
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
  if (!hasPermission(session, "products.delete")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const rows = await supabaseRest<ProductRow[]>(
      `products?id=eq.${encodeURIComponent(id)}&select=id`,
      {
        method: "DELETE",
        serviceRole: true,
        headers: { Prefer: "return=representation" },
      },
    );
    if (!rows[0]) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    await logAdminActivity(session.username, "product.delete", id);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Delete failed" },
      { status: 400 },
    );
  }
}
