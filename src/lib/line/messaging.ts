import { createHmac, timingSafeEqual } from "crypto";

const LINE_API = "https://api.line.me/v2/bot/message";

function getToken() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  return token;
}

export function verifyLineSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function parseOrderCommand(message: string) {
  const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
  const match = message.match(new RegExp(`^ORDER\\s+(${uuid})\\s+(${uuid})(?:\\s|$)`, "i"));
  return match ? { id: match[1], token: match[2] } : null;
}

async function send(path: "reply" | "push", body: unknown) {
  const response = await fetch(`${LINE_API}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`LINE ${path} failed: ${await response.text()}`);
}

export function replyLineMessage(replyToken: string, text: string) {
  return send("reply", { replyToken, messages: [{ type: "text", text: text.slice(0, 5000) }] });
}

export function pushLineMessage(to: string, text: string) {
  return send("push", { to, messages: [{ type: "text", text: text.slice(0, 5000) }] });
}

export function pushLineFlex(to: string, message: object) {
  return send("push", { to, messages: [message] });
}

export function orderFlexMessage(order: { id: string; customerName: string; customerPhone: string; customerAddress?: string; shippingFee?: number; totalPrice?: number; items: Array<{ productName?: string; product: { name: string }; quantity: number; price?: number }> }, adminUrl: string) {
  const lines = order.items.map(item => ({
    type: "text", text: `${item.productName || item.product.name} × ${item.quantity}  ฿${(Number(item.price || 0) * item.quantity).toLocaleString("th-TH")}`,
    size: "sm", wrap: true, color: "#555555",
  }));
  return {
    type: "flex", altText: `ออเดอร์ใหม่ ${order.id.slice(0, 8).toUpperCase()} ฿${Number(order.totalPrice || 0).toLocaleString("th-TH")}`,
    contents: { type: "bubble", body: { type: "box", layout: "vertical", spacing: "md", contents: [
      { type: "text", text: "🐟 ออเดอร์ใหม่", weight: "bold", size: "xl" },
      { type: "text", text: `#${order.id.slice(0, 8).toUpperCase()} · ${order.customerName}`, size: "sm", color: "#666666" },
      { type: "text", text: `โทร ${order.customerPhone}`, size: "sm", color: "#666666" },
      ...lines.slice(0, 15),
      { type: "separator" },
      { type: "text", text: `ค่าส่ง ฿${Number(order.shippingFee || 0).toLocaleString("th-TH")}`, size: "sm" },
      { type: "text", text: `ยอดรวม ฿${Number(order.totalPrice || 0).toLocaleString("th-TH")}`, weight: "bold", size: "lg" },
      ...(order.customerAddress ? [{ type: "text", text: `ที่อยู่: ${order.customerAddress}`, size: "sm", wrap: true }] : []),
    ] }, footer: { type: "box", layout: "vertical", contents: [{ type: "button", style: "primary", action: { type: "uri", label: "จัดการออเดอร์", uri: adminUrl } }] } },
  };
}

export function customerOrderFlexMessage(order: { id: string; shippingFee?: number; totalPrice?: number; items: Array<{ productName?: string; product: { name: string }; quantity: number; price?: number }> }, orderUrl: string) {
  const lines = order.items.map(item => ({
    type: "text", text: `${item.productName || item.product.name} × ${item.quantity}  ฿${(Number(item.price || 0) * item.quantity).toLocaleString("th-TH")}`,
    size: "sm", wrap: true, color: "#555555",
  }));
  return {
    type: "flex", altText: `ยืนยันออเดอร์ ${order.id.slice(0, 8).toUpperCase()} ยอด ฿${Number(order.totalPrice || 0).toLocaleString("th-TH")}`,
    contents: { type: "bubble", body: { type: "box", layout: "vertical", spacing: "md", contents: [
      { type: "text", text: "ยืนยันคำสั่งซื้อแล้ว 🐟", weight: "bold", size: "xl" },
      { type: "text", text: `ออเดอร์ #${order.id.slice(0, 8).toUpperCase()}`, size: "sm", color: "#666666" },
      ...lines.slice(0, 15),
      { type: "separator" },
      { type: "text", text: `ค่าส่ง ฿${Number(order.shippingFee || 0).toLocaleString("th-TH")}`, size: "sm" },
      { type: "text", text: `ยอดชำระ ฿${Number(order.totalPrice || 0).toLocaleString("th-TH")}`, weight: "bold", size: "lg" },
      { type: "text", text: "กรุณาชำระเงินและแนบสลิปภายในเวลาที่กำหนด", size: "sm", wrap: true, color: "#666666" },
    ] }, footer: { type: "box", layout: "vertical", contents: [{ type: "button", style: "primary", color: "#06C755", action: { type: "uri", label: "ดูวิธีชำระเงิน", uri: orderUrl } }] } },
  };
}

export function buildAutoReply(message: string) {
  const value = message.trim().toLowerCase();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (/สินค้า|product|ปลากัด|ปลา/.test(value)) return `🐟 ดูปลากัดที่พร้อมจำหน่ายได้ที่\n${site}/shop\n\nพิมพ์ “สั่งซื้อ” เพื่อดูขั้นตอนการสั่งซื้อ`;
  if (/ราคา|price|เท่าไหร่/.test(value)) return `💰 ราคาและรายละเอียดของปลาแต่ละตัวดูได้ที่\n${site}/shop`;
  if (/สั่งซื้อ|order|ซื้อยังไง/.test(value)) return `🛒 วิธีสั่งซื้อ Mini Betta Farm\n1. เลือกปลาที่ ${site}/shop\n2. เพิ่มสินค้าลงตะกร้า\n3. กรอกข้อมูลจัดส่งและยืนยันคำสั่งซื้อ\n\nหากต้องการคุยกับแอดมิน พิมพ์ “ติดต่อแอดมิน”`;
  if (/จัดส่ง|shipping|ส่งยังไง/.test(value)) return "📦 เราจัดส่งปลาด้วยบรรจุภัณฑ์ที่เหมาะสม โปรดแจ้งจังหวัดและรหัสไปรษณีย์เพื่อให้แอดมินตรวจสอบรอบจัดส่ง";
  if (/ติดต่อ|แอดมิน|admin|เจ้าหน้าที่/.test(value)) return "👩‍💼 รับทราบค่ะ แอดมินจะเข้ามาตอบโดยเร็วที่สุด กรุณาฝากชื่อ เบอร์โทร และรายละเอียดที่ต้องการสอบถามไว้ได้เลย";
  return `สวัสดีค่ะ 🐟 Mini Betta Farm\nเลือกหัวข้อที่ต้องการได้เลย\n• พิมพ์ “สินค้า” ดูปลาที่พร้อมขาย\n• พิมพ์ “ราคา” ดูราคา\n• พิมพ์ “สั่งซื้อ” ดูขั้นตอน\n• พิมพ์ “จัดส่ง” สอบถามการจัดส่ง\n• พิมพ์ “ติดต่อแอดมิน” ติดต่อเจ้าหน้าที่`;
}

export function formatOrderNotification(order: { id: string; customerName: string; customerPhone: string; totalPrice?: number; total?: number; customerAddress?: string; items?: Array<{ productName?: string; product: { name: string }; quantity: number; price?: number }> }) {
  const items = order.items?.map(item => `• ${item.productName || item.product.name} × ${item.quantity} = ฿${(Number(item.price || 0) * item.quantity).toLocaleString("th-TH")}`).join("\n") || "";
  return `🔔 มีคำสั่งซื้อใหม่\nเลขที่: ${order.id.slice(0, 8).toUpperCase()}\nลูกค้า: ${order.customerName}\nโทร: ${order.customerPhone}\n${items}\nที่อยู่: ${order.customerAddress || "ไม่ระบุ"}\nยอดรวม (รวมค่าส่ง): ฿${Number(order.totalPrice ?? order.total ?? 0).toLocaleString("th-TH")}\n\nตรวจสอบรายละเอียดได้ที่หน้า Admin`;
}
