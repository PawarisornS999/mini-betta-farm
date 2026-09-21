import { NextResponse } from "next/server";
import { getCategories } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Failed to load categories", error);
    return NextResponse.json({ success: false, message: "Unable to load categories" }, { status: 503 });
  }
}
