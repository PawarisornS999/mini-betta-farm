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
  return `🐟 Order from Aurora Betta Farm:\n\n${itemLines}\n\n💰 Total: ${formatPrice(total)}\n👤 Name: ${customerName}\n📱 Phone: ${customerPhone}${addressLine}`;
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
