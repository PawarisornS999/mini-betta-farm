import { NextRequest, NextResponse } from "next/server";
import {
  encryptLineCookie,
  exchangeLineCode,
  lineCookieOptions,
  LINE_AUTH_COOKIE,
  LINE_SESSION_COOKIE,
  LINE_SESSION_MAX_AGE,
  readLineAuthTransaction,
} from "@/lib/line/login";

function checkoutError(request: NextRequest, code: string) {
  const response = NextResponse.redirect(new URL(`/checkout?line=${code}`, request.url));
  response.cookies.delete(LINE_AUTH_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const transaction = readLineAuthTransaction(
    request.cookies.get(LINE_AUTH_COOKIE)?.value,
  );
  if (!code || !state || !transaction || state !== transaction.state) {
    return checkoutError(request, "invalid-state");
  }

  try {
    const { friend, session } = await exchangeLineCode(
      code,
      transaction,
      request.nextUrl.origin,
    );
    if (!friend) return checkoutError(request, "friend-required");

    const redirectUrl = new URL(transaction.returnTo, request.nextUrl.origin);
    redirectUrl.searchParams.set("line", "connected");
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(LINE_AUTH_COOKIE);
    response.cookies.set(
      LINE_SESSION_COOKIE,
      encryptLineCookie(session),
      lineCookieOptions(Math.min(
        LINE_SESSION_MAX_AGE,
        Math.max(1, Math.floor((session.expiresAt - Date.now()) / 1000)),
      )),
    );
    return response;
  } catch (error) {
    console.error("LINE login callback failed", error);
    return checkoutError(request, "login-failed");
  }
}
