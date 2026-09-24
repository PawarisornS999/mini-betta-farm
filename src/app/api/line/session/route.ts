import { NextResponse } from "next/server";
import { getLineSession } from "@/lib/line/login";

export async function GET() {
  try {
    const session = await getLineSession();
    return NextResponse.json({
      success: true,
      data: session
        ? { authenticated: true, displayName: session.displayName }
        : { authenticated: false },
    });
  } catch (error) {
    console.error("LINE session check failed", error);
    return NextResponse.json({
      success: true,
      data: { authenticated: false },
    });
  }
}
