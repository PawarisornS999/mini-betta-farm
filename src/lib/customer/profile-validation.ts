import type { CustomerProfileInput } from "@/types";

export function validateCustomerProfile(input: CustomerProfileInput) {
  if (!input.customerName?.trim()) return "กรุณากรอกชื่อผู้รับ";
  if (!/^[0-9+\-\s]{8,20}$/.test(input.customerPhone?.trim() || "")) {
    return "เบอร์โทรศัพท์ไม่ถูกต้อง";
  }
  if (!input.addressDetails?.trim()) return "กรุณากรอกรายละเอียดที่อยู่";
  if (!input.province?.trim() || !input.district?.trim() || !input.subdistrict?.trim()) {
    return "กรุณากรอกที่อยู่ให้ครบ";
  }
  if (!/^\d{5}$/.test(input.postalCode?.trim() || "")) {
    return "รหัสไปรษณีย์ต้องมี 5 หลัก";
  }
  return null;
}
