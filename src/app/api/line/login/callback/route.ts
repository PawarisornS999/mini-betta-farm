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

function loginError(request: NextRequest, code: string, returnTo = "/checkout") {
  const redirectUrl = new URL(returnTo, request.url);
  redirectUrl.searchParams.set("line", code);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete(LINE_AUTH_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");
  const transaction = readLineAuthTransaction(
    request.cookies.get(LINE_AUTH_COOKIE)?.value,
  );
  if (!state || !transaction || state !== transaction.state) {
    return loginError(request, "invalid-state");
  }
  if (oauthError) return loginError(request, "access-denied", transaction.returnTo);
  if (!code) return loginError(request, "login-failed", transaction.returnTo);

  try {
    const { friend, session } = await exchangeLineCode(
      code,
      transaction,
      request.nextUrl.origin,
    );
    if (!friend) return loginError(request, "friend-required", transaction.returnTo);

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
    return loginError(request, "login-failed", transaction.returnTo);
  }
}
