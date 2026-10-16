import { NextResponse } from "next/server";
import { getLineSession } from "@/lib/line/login";
import { addCustomerWishlistItem, getCustomerWishlist } from "@/lib/customer/wishlist";

const privateHeaders = { "Cache-Control": "private, no-store" };

export async function GET() {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ LINE", code: "LINE_LOGIN_REQUIRED" }, { status: 401, headers: privateHeaders });
  try {
    const products = await getCustomerWishlist(session.userId);
    return NextResponse.json({ success: true, data: products }, { headers: privateHeaders });
  } catch (error) {
    console.error("Customer wishlist load failed", error);
    return NextResponse.json({ success: false, message: "โหลดรายการที่ชอบไม่สำเร็จ" }, { status: 500, headers: privateHeaders });
  }
}

export async function POST(request: Request) {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ LINE", code: "LINE_LOGIN_REQUIRED" }, { status: 401, headers: privateHeaders });
  try {
    const body = await request.json() as { productId?: unknown };
    if (typeof body.productId !== "string" || !body.productId.trim()) {
      return NextResponse.json({ success: false, message: "ไม่พบสินค้า" }, { status: 400, headers: privateHeaders });
    }
    const added = await addCustomerWishlistItem(session.userId, body.productId.trim());
    if (!added) return NextResponse.json({ success: false, message: "ไม่พบสินค้าที่เลือก" }, { status: 404, headers: privateHeaders });
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch (error) {
    console.error("Customer wishlist update failed", error);
    return NextResponse.json({ success: false, message: "บันทึกรายการที่ชอบไม่สำเร็จ" }, { status: 500, headers: privateHeaders });
  }
}
