export function formatDateTime(value: string | Date, language: string = "en"): string {
  const date = value instanceof Date ? value : new Date(value);
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(date);
  return language === "th" ? `${formatted} น.` : formatted;
}

export function formatPrice(price: number): string {
  return `฿${price.toLocaleString()}`;
}

export function generateLineMessage(
  items: { name: string; quantity: number; price: number }[],
  total: number,
  customerName: string,
  customerPhone: string,
  customerAddress?: string,
): string {
  const itemLines = items
    .map(
      (item) =>
        `- ${item.name} x${item.quantity} (${formatPrice(item.price * item.quantity)})`,
    )
    .join("\n");

  const addressLine = customerAddress
    ? `\n📍 Address: ${customerAddress}`
    : "";
  return `🐟 Order from Betta World:\n\n${itemLines}\n\n💰 Total: ${formatPrice(total)}\n👤 Name: ${customerName}\n📱 Phone: ${customerPhone}${addressLine}`;
}

export function getLineOrderUrl(message: string): string {
  const lineId = process.env.NEXT_PUBLIC_LINE_OA_ID || "@097zxssv";
  return `https://line.me/R/oaMessage/${encodeURIComponent(lineId)}/?${encodeURIComponent(message)}`;
}

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
