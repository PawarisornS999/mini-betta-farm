import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { inventoryDelta, type InventoryOperation } from "@/lib/inventory";
import { supabaseRest } from "@/lib/supabase/rest";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as {
    productId?: string;
    operation?: InventoryOperation;
    quantity?: number;
    delta?: number;
    reason?: string;
    language?: "th" | "en";
  };
  const message = (th: string, en: string) => body.language === "en" ? en : th;
  const delta = inventoryDelta(body.operation, body.quantity, body.delta);
  if (!body.productId || delta === null) {
    return NextResponse.json(
      { success: false, message: message("กรุณาระบุจำนวนเป็นเลขจำนวนเต็มที่มากกว่า 0", "Quantity must be a whole number greater than zero") },
      { status: 400 },
    );
  }
  try {
    const data = await supabaseRest("rpc/admin_adjust_inventory", {
      method: "POST", serviceRole: true,
      body: JSON.stringify({ p_product_id: body.productId, p_delta: delta, p_reason: body.reason ?? "admin_adjustment", p_admin_name: session.username }),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    const errorMessage = detail.includes("Stock cannot be negative")
      ? message("จำนวนที่ลดมากกว่าสต็อกคงเหลือ", "The reduction is greater than the current stock")
      : detail.includes("Stock cannot be below reserved quantity")
        ? message("ลดไม่ได้ เนื่องจากมีสินค้าที่ถูกจองอยู่ กรุณายกเลิกออเดอร์หรือคืนการจองก่อน", "Stock cannot be reduced below the reserved quantity. Cancel or release the reservation first")
        : detail.includes("Product not found")
          ? message("ไม่พบสินค้านี้", "Product not found")
          : detail || message("ปรับสต็อกไม่สำเร็จ", "Unable to adjust stock");
    return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
  }
}
