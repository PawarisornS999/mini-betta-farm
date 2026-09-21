import { NextResponse } from "next/server";
import { getProduct } from "@/lib/supabase/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Failed to load product", error);
    return NextResponse.json(
      { success: false, message: "Unable to load product", code: "PRODUCT_LOAD_FAILED" },
      { status: 503 },
    );
  }
}

