const API_BASE = "https://trackapi.thailandpost.co.th/post/api/v1";

export type ThailandPostEvent = {
  barcode: string;
  status: string;
  statusDescription: string;
  statusDate: string;
  location: string;
  postcode: string;
  deliveryDescription: string;
  receiverName: string;
};

type RawEvent = {
  barcode?: string;
  status?: string;
  status_description?: string;
  status_date?: string;
  location?: string;
  postcode?: string;
  delivery_description?: string | null;
  receiver_name?: string | null;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken() {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const appToken = process.env.THAILAND_POST_API_TOKEN;
  if (!appToken) throw new Error("ยังไม่ได้ตั้งค่า THAILAND_POST_API_TOKEN");

  const response = await fetch(`${API_BASE}/authenticate/token`, {
    method: "POST",
    headers: {
      Authorization: `Token ${appToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as
    | { token?: string; expire?: string; message?: string }
    | null;
  if (!response.ok || !body?.token) {
    throw new Error(body?.message || "ไม่สามารถยืนยันตัวตนกับไปรษณีย์ไทยได้");
  }

  const parsedExpiry = body.expire ? Date.parse(body.expire) : Number.NaN;
  cachedAccessToken = {
    token: body.token,
    expiresAt: Number.isFinite(parsedExpiry) ? parsedExpiry : Date.now() + 23 * 60 * 60 * 1000,
  };
  return body.token;
}

export async function trackThailandPost(barcode: string) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_BASE}/track`, {
    method: "POST",
    headers: {
      Authorization: `Token ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "all", language: "TH", barcode: [barcode] }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as
    | {
        status?: boolean;
        message?: string;
        response?: { items?: Record<string, RawEvent[]> };
      }
    | null;
  if (!response.ok || body?.status === false) {
    throw new Error(body?.message || "ไม่สามารถตรวจสอบสถานะพัสดุได้");
  }

  const rawEvents = body?.response?.items?.[barcode] ?? [];
  return rawEvents.map((event): ThailandPostEvent => ({
    barcode: event.barcode || barcode,
    status: event.status || "",
    statusDescription: event.status_description || "ไม่ระบุสถานะ",
    statusDate: event.status_date || "",
    location: event.location || "",
    postcode: event.postcode || "",
    deliveryDescription: event.delivery_description || "",
    receiverName: event.receiver_name || "",
  }));
}
