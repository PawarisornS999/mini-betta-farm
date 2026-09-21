import { NextResponse } from "next/server";
import { getProducts } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({
      success: true,
      data: { data: products, total: products.length, page: 1, pageSize: products.length, totalPages: 1 },
    });
  } catch (error) {
    console.error("Failed to load products", error);
    return NextResponse.json(
      { success: false, message: "Unable to load products", code: "PRODUCTS_LOAD_FAILED" },
      { status: 503 },
    );
  }
}

