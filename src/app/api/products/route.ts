import { NextResponse } from "next/server";
import { getProductsPage } from "@/lib/supabase/queries";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("pageSize") || "100", 10) || 100));
    const { products, total } = await getProductsPage(page, pageSize);
    return NextResponse.json({
      success: true,
      data: { data: products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Failed to load products", error);
    return NextResponse.json(
      { success: false, message: "Unable to load products", code: "PRODUCTS_LOAD_FAILED" },
      { status: 503 },
    );
  }
}
