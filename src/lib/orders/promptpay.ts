function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(value: string) {
  let crc = 0xffff;
  for (const character of value) {
    crc ^= character.charCodeAt(0) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Thai PromptPay EMV QR payload with the order's amount embedded. */
export function promptPayPayload(value: string, amount: number) {
  const target = value.replace(/\D/g, "");
  if (!/^(\d{10}|\d{13})$/.test(target) || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid PromptPay payment details");
  }
  const targetField = target.length === 10 ? "01" : "02";
  const formattedTarget = target.length === 10
    ? target.replace(/^0/, "66").padStart(13, "0")
    : target;
  const merchant = field("00", "A000000677010111") + field(targetField, formattedTarget);
  const payload = [
    field("00", "01"),
    field("01", "12"),
    field("29", merchant),
    field("58", "TH"),
    field("53", "764"),
    field("54", amount.toFixed(2)),
  ].join("");
  return `${payload}6304${crc16(`${payload}6304`)}`;
}
