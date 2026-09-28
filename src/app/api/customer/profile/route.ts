import { NextResponse } from "next/server";
import type { CustomerProfileInput } from "@/types";
import { getLineSession } from "@/lib/line/login";
import { getCustomerProfile, saveCustomerProfile } from "@/lib/customer/profile";
import { validateCustomerProfile } from "@/lib/customer/profile-validation";

const privateResponse = { headers: { "Cache-Control": "private, no-store" } };

export async function GET() {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ success: false, message: "LINE login required", code: "LINE_LOGIN_REQUIRED" }, { status: 401 });
  try {
    const profile = await getCustomerProfile(session.userId);
    return NextResponse.json({
      success: true,
      data: profile ?? {
        displayName: session.displayName,
        pictureUrl: session.pictureUrl,
        customerName: "",
        customerPhone: "",
        addressDetails: "",
        province: "",
        district: "",
        subdistrict: "",
        postalCode: "",
      },
    }, privateResponse);
  } catch (error) {
    console.error("Customer profile load failed", error);
    return NextResponse.json({ success: false, message: "โหลดโปรไฟล์ไม่สำเร็จ" }, { status: 500, ...privateResponse });
  }
}

export async function PATCH(request: Request) {
  const session = await getLineSession();
  if (!session) return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ LINE", code: "LINE_LOGIN_REQUIRED" }, { status: 401 });
  const input = await request.json() as CustomerProfileInput;
  const validationError = validateCustomerProfile(input);
  if (validationError) return NextResponse.json({ success: false, message: validationError }, { status: 400 });
  try {
    const profile = await saveCustomerProfile(session.userId, session.displayName, session.pictureUrl, input);
    return NextResponse.json({ success: true, data: profile }, privateResponse);
  } catch (error) {
    console.error("Customer profile save failed", error);
    return NextResponse.json({ success: false, message: "บันทึกโปรไฟล์ไม่สำเร็จ" }, { status: 500, ...privateResponse });
  }
}
