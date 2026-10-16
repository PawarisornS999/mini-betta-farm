import { NextResponse } from "next/server";
import { getLineSession } from "@/lib/line/login";
import { supabaseRest } from "@/lib/supabase/rest";

type WelcomeCoupon = {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  available: boolean;
  usedAt: string | null;
};

export async function GET() {
  const session = await getLineSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "LINE login required" },
      { status: 401 },
    );
  }

  // This also repairs a missed grant if the LINE callback could not reach Supabase.
  const coupon = await supabaseRest<WelcomeCoupon | null>(
    "rpc/grant_welcome_coupon",
    {
      method: "POST",
      body: JSON.stringify({ p_line_user_id: session.userId }),
      serviceRole: true,
      cache: "no-store",
    },
  );
  return NextResponse.json({ success: true, data: coupon });
}
