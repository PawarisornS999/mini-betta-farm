import { NextResponse } from "next/server";
import { LINE_SESSION_COOKIE, LINE_AUTH_COOKIE } from "@/lib/line/login";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(LINE_SESSION_COOKIE);
  response.cookies.delete(LINE_AUTH_COOKIE);
  return response;
}
