import { NextResponse } from "next/server";
import { trackThailandPost } from "@/lib/thailand-post";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { trackingNumber?: string } | null;
  const trackingNumber = body?.trackingNumber?.trim().toUpperCase() || "";

  if (!/^[A-Z0-9]{13}$/.test(trackingNumber)) {
    return NextResponse.json(
      { message: "กรุณากรอกหมายเลขพัสดุไปรษณีย์ไทย 13 หลักให้ถูกต้อง" },
      { status: 400 },
    );
  }

  try {
    const events = await trackThailandPost(trackingNumber);
    return NextResponse.json({ success: true, data: { trackingNumber, events } });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "ติดตามพัสดุไม่สำเร็จ" },
      { status: 502 },
    );
  }
}
