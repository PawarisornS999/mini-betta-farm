import { NextResponse } from "next/server";
import { getLineSession } from "@/lib/line/login";
import { removeCustomerWishlistItem } from "@/lib/customer/wishlist";

export async function DELETE(_request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ LINE", code: "LINE_LOGIN_REQUIRED" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  try {
    const { productId } = await params;
    await removeCustomerWishlistItem(session.userId, productId);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Customer wishlist removal failed", error);
    return NextResponse.json({ success: false, message: "นำสินค้าออกจากรายการที่ชอบไม่สำเร็จ" }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}
