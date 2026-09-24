import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

export const LINE_AUTH_COOKIE = "mini_betta_line_auth";
export const LINE_SESSION_COOKIE = "mini_betta_line_session";
export const LINE_AUTH_MAX_AGE = 10 * 60;
export const LINE_SESSION_MAX_AGE = 30 * 24 * 60 * 60;

type LineAuthTransaction = {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnTo: string;
  expiresAt: number;
};

export type LineSession = {
  userId: string;
  displayName: string;
  accessToken: string;
  expiresAt: number;
};

type LineTokenResponse = {
  access_token: string;
  expires_in: number;
  id_token: string;
};

type LineProfile = {
  userId: string;
  displayName: string;
};

function getEncryptionKey() {
  const secret = process.env.LINE_LOGIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("LINE_LOGIN_SESSION_SECRET must contain at least 32 characters");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptLineCookie(value: object) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function decryptLineCookie<T>(token: string | undefined): T | null {
  if (!token) return null;
  try {
    const [ivValue, tagValue, encryptedValue] = token.split(".");
    if (!ivValue || !tagValue || !encryptedValue) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
}

export function safeReturnTo(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/checkout";
}

export function lineCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function getLineLoginConfig(origin?: string) {
  const clientId = process.env.LINE_LOGIN_CHANNEL_ID;
  const clientSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("LINE Login channel is not configured");
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || origin;
  if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL is not configured");
  return {
    clientId,
    clientSecret,
    redirectUri:
      process.env.LINE_LOGIN_CALLBACK_URL || `${siteUrl}/api/line/login/callback`,
  };
}

export function createLineAuthTransaction(returnTo: string): LineAuthTransaction {
  return {
    state: randomBytes(24).toString("base64url"),
    nonce: randomBytes(24).toString("base64url"),
    codeVerifier: randomBytes(48).toString("base64url"),
    returnTo,
    expiresAt: Date.now() + LINE_AUTH_MAX_AGE * 1000,
  };
}

export function lineCodeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function readLineAuthTransaction(token: string | undefined) {
  const transaction = decryptLineCookie<LineAuthTransaction>(token);
  return transaction && transaction.expiresAt > Date.now() ? transaction : null;
}

export async function getLineSession() {
  const token = (await cookies()).get(LINE_SESSION_COOKIE)?.value;
  const session = decryptLineCookie<LineSession>(token);
  return session && session.expiresAt > Date.now() ? session : null;
}

async function readLineResponse<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${label} failed (${response.status}): ${detail}`);
  }
  return response.json() as Promise<T>;
}

export async function exchangeLineCode(
  code: string,
  transaction: LineAuthTransaction,
  origin?: string,
) {
  const config = getLineLoginConfig(origin);
  const token = await readLineResponse<LineTokenResponse>(
    await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code_verifier: transaction.codeVerifier,
      }),
      cache: "no-store",
    }),
    "LINE token exchange",
  );

  const verified = await readLineResponse<{ sub: string }>(
    await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        id_token: token.id_token,
        client_id: config.clientId,
        nonce: transaction.nonce,
      }),
      cache: "no-store",
    }),
    "LINE ID token verification",
  );

  const profile = await readLineResponse<LineProfile>(
    await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    }),
    "LINE profile",
  );
  if (!profile.userId || profile.userId !== verified.sub) {
    throw new Error("LINE profile does not match the verified user");
  }

  const friend = await getLineFriendship(token.access_token);
  return {
    friend,
    session: {
      userId: profile.userId,
      displayName: profile.displayName,
      accessToken: token.access_token,
      expiresAt: Date.now() + Math.min(token.expires_in, LINE_SESSION_MAX_AGE) * 1000,
    } satisfies LineSession,
  };
}

export async function getLineFriendship(accessToken: string) {
  const result = await readLineResponse<{ friendFlag: boolean }>(
    await fetch("https://api.line.me/friendship/v1/status", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }),
    "LINE friendship check",
  );
  return result.friendFlag === true;
}
