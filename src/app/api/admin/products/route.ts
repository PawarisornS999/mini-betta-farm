import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getAdminProducts, logAdminActivity } from "@/lib/admin/products";
import { mapProduct, type ProductRow } from "@/lib/supabase/mappers";
import { supabaseRest } from "@/lib/supabase/rest";

type ProductInput = {
  name?: string;
  sku?: string;
  slug?: string;
  price?: number;
  cost?: number;
  description?: string;
  species?: string;
  color?: string;
  category?: string;
  gender?: string;
  pattern?: string;
  tailType?: string;
  ageMonths?: number;
  sizeCm?: number;
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
  if (body.stockQty == null || !Number.isInteger(body.stockQty) || body.stockQty < 0) return "สต็อกต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป";
  if (!body.species?.trim() || !body.color?.trim()) return "กรุณากรอกสายพันธุ์และสี";
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
    cost: Number(body.cost ?? 0),
    description: body.description?.trim() ?? "",
    species: body.species?.trim(),
    color: body.color?.trim(),
    category: body.category?.trim() || "betta-fish",
    gender: body.gender ?? "unsexed",
    pattern: body.pattern?.trim() || null,
    tail_type: body.tailType?.trim() || body.species?.trim(),
    age_months: body.ageMonths || null,
    size_cm: body.sizeCm || null,
    stock_qty: stockQty,
    reserved_qty: status === "reserved" ? Math.min(1, stockQty) : 0,
    stock_status: stockQty === 0 ? "out_of_stock" : stockQty <= 3 ? "low_stock" : "in_stock",
    admin_status: status,
    published: status === "available" && stockQty > 0,
    feeding_notes: "Feed high-quality betta pellets twice daily.",
    images: body.images?.filter(Boolean) ?? [],
    badge: body.badge?.trim() || null,
    featured: Boolean(body.featured),
  };
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ success: true, data: await getAdminProducts() });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Load failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
