import { NextRequest, NextResponse } from "next/server";
import {
  createLineAuthTransaction,
  encryptLineCookie,
  getLineLoginConfig,
  lineCodeChallenge,
  lineCookieOptions,
  LINE_AUTH_COOKIE,
  LINE_AUTH_MAX_AGE,
  safeReturnTo,
} from "@/lib/line/login";

export async function GET(request: NextRequest) {
  try {
    const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
    const transaction = createLineAuthTransaction(returnTo);
    const config = getLineLoginConfig(request.nextUrl.origin);
    const authorizeUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
    authorizeUrl.search = new URLSearchParams({
      response_type: "code",
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state: transaction.state,
      scope: "openid profile",
      nonce: transaction.nonce,
      bot_prompt: "aggressive",
      code_challenge: lineCodeChallenge(transaction.codeVerifier),
      code_challenge_method: "S256",
    }).toString();

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(
      LINE_AUTH_COOKIE,
      encryptLineCookie(transaction),
      lineCookieOptions(LINE_AUTH_MAX_AGE),
    );
    return response;
  } catch (error) {
    console.error("LINE login start failed", error);
    return NextResponse.redirect(new URL("/checkout?line=config-error", request.url));
  }
}
