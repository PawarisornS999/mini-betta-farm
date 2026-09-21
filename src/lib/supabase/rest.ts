type SupabaseOptions = RequestInit & {
  serviceRole?: boolean;
};

function getConfig(serviceRole = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = serviceRole
    ? process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }

  return { url: url.replace(/\/$/, ""), key };
}

export async function supabaseRest<T>(
  path: string,
  { serviceRole = false, headers, ...init }: SupabaseOptions = {},
): Promise<T> {
  const { url, key } = getConfig(serviceRole);
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Supabase request failed (${response.status})`);
  }

  // PostgREST can return an empty body with other successful status codes too,
  // notably 201 for inserts using `Prefer: return=minimal`.
  const body = await response.text();
  if (!body) return undefined as T;

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`Supabase returned an invalid JSON response (${response.status})`);
  }
}
