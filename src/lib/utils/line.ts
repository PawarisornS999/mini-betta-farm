interface LineOrderItem {
  name: string;
  quantity: number;
  price: number;
}

/**
 * Generate formatted LINE message for an order
 */
export function generateLineMessage(
  items: LineOrderItem[],
  total: number,
  customerName: string,
  customerPhone: string,
  address?: string,
): string {
  const itemLines = items
    .map(
      (item, i) =>
        `${i + 1}. ${item.name} x${item.quantity} = ฿${(item.price * item.quantity).toLocaleString()}`,
    )
    .join("\n");

  let msg = `🐟 คำสั่งซื้อจาก Aurora Betta Farm\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 ชื่อ: ${customerName}\n`;
  msg += `📱 เบอร์: ${customerPhone}\n`;
  if (address) {
    msg += `📍 ที่อยู่: ${address}\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📦 รายการสินค้า:\n${itemLines}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 รวมทั้งสิ้น: ฿${total.toLocaleString()}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🙏 ขอบคุณที่สั่งซื้อครับ/ค่ะ`;

  return msg;
}

/**
 * Generate LINE OA deep link URL with order message
 */
export function getLineOrderUrl(message: string): string {
  const id = process.env.NEXT_PUBLIC_LINE_OA_ID || "@097zxssv";
  return `https://line.me/R/oaMessage/${encodeURIComponent(id)}/?${encodeURIComponent(message)}`;
}
