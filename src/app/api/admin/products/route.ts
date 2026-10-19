import { NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import { getAdminProducts, logAdminActivity } from "@/lib/admin/products";
import { mapProduct, type ProductRow } from "@/lib/supabase/mappers";
import { supabaseRest } from "@/lib/supabase/rest";

type ProductInput = {
  name?: string;
  sku?: string;
  slug?: string;
  price?: number;
  salePrice?: number | null;
  saleStartDate?: string | null;
  saleEndDate?: string | null;
  cost?: number;
  description?: string;
  species?: string;
  color?: string;
  category?: string;
  gender?: string;
  pattern?: string;
  tailType?: string;
  difficultyLevel?: "beginner" | "medium" | "advanced";
  ageMonths?: number;
  sizeCm?: number;
  sizeInches?: number;
  stockQty?: number;
  adminStatus?: string;
  images?: string[];
  badge?: string;
  featured?: boolean;
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function validate(body: ProductInput) {
  if (!body.name?.trim()) return "กรุณากรอกชื่อสินค้า";
  if (!body.sku?.trim()) return "กรุณากรอก SKU";
  if (body.price == null || body.price < 0) return "ราคาสินค้าไม่ถูกต้อง";
  const hasSale = body.salePrice != null || body.saleStartDate || body.saleEndDate;
  if (hasSale && (body.salePrice == null || !body.saleStartDate || !body.saleEndDate)) return "กรุณากรอกราคาส่วนลดและวันเริ่ม–สิ้นสุดให้ครบ";
  if (hasSale && (!Number.isFinite(body.salePrice) || body.salePrice! < 0 || body.salePrice! >= body.price)) return "ราคาส่วนลดต้องต่ำกว่าราคาปกติ";
  if (hasSale && (!/^\d{4}-\d{2}-\d{2}$/.test(body.saleStartDate!) || !/^\d{4}-\d{2}-\d{2}$/.test(body.saleEndDate!) || body.saleEndDate! < body.saleStartDate!)) return "ช่วงวันที่ส่วนลดไม่ถูกต้อง";
  if (body.stockQty == null || !Number.isInteger(body.stockQty) || body.stockQty < 0) return "สต็อกต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป";
  return null;
}

function toRow(body: ProductInput) {
  const status = body.adminStatus ?? "available";
  const stockQty = body.stockQty ?? 0;
  return {
    name: body.name?.trim(),
    sku: body.sku?.trim().toUpperCase(),
    slug: slugify(body.slug || body.name || body.sku || "product"),
    price: Number(body.price),
    sale_price: body.salePrice ?? null,
    sale_start_date: body.saleStartDate || null,
    sale_end_date: body.saleEndDate || null,
    cost: Number(body.cost ?? 0),
    description: body.description?.trim() ?? "",
    // These fields are optional in the form; keep empty strings because the
    // current database columns are NOT NULL.
    species: body.species?.trim() ?? "",
    color: body.color?.trim() ?? "",
    category: body.category?.trim() || "betta-fish",
    gender: body.gender ?? "unsexed",
    pattern: body.pattern?.trim() || null,
    tail_type: body.tailType?.trim() || body.species?.trim(),
    difficulty_level: body.difficultyLevel ?? "beginner",
    age_months: body.ageMonths || null,
    size_cm: body.sizeInches == null ? body.sizeCm ?? null : Math.round(body.sizeInches * 2.54 * 100) / 100,
    stock_qty: stockQty,
    reserved_qty: status === "reserved" ? Math.min(1, stockQty) : 0,
    stock_status: stockQty === 0 ? "out_of_stock" : stockQty <= 3 ? "low_stock" : "in_stock",
    admin_status: status,
    // Sold fish remain visible in the storefront as a catalogue record.
    published: status !== "hidden" && status !== "draft",
    feeding_notes: "Feed high-quality betta pellets twice daily.",
    images: body.images?.filter(Boolean) ?? [],
    badge: body.badge?.trim() || null,
    featured: Boolean(body.featured),
  };
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "products.view")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json({ success: true, data: await getAdminProducts() });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Load failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "products.create")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = (await request.json()) as ProductInput;
  const error = validate(body);
  if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });
  try {
    const id = `${slugify(body.sku || body.name || "fish")}-${crypto.randomUUID().slice(0, 8)}`;
    const rows = await supabaseRest<ProductRow[]>("products?select=*", {
      method: "POST",
      serviceRole: true,
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ id, ...toRow(body) }),
    });
    await logAdminActivity(session.username, "product.create", id, { sku: body.sku });
    return NextResponse.json({ success: true, data: mapProduct(rows[0]) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("products_sku_unique_idx")
      ? "SKU นี้มีอยู่แล้ว"
      : error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
