import type { CustomerProfileInput } from "@/types";

export function customerProfileFieldErrors(input: CustomerProfileInput) {
  return {
    customerName: !input.customerName?.trim(),
    customerPhone: !/^[0-9+\-\s]{8,20}$/.test(input.customerPhone?.trim() || ""),
    addressDetails: !input.addressDetails?.trim(),
    province: !input.province?.trim(),
    district: !input.district?.trim(),
    subdistrict: !input.subdistrict?.trim(),
    postalCode: !/^\d{5}$/.test(input.postalCode?.trim() || ""),
  };
}

export function validateCustomerProfile(input: CustomerProfileInput) {
  const invalid = customerProfileFieldErrors(input);
  if (invalid.customerName) return "กรุณากรอกชื่อผู้รับ";
  if (invalid.customerPhone) {
    return "เบอร์โทรศัพท์ไม่ถูกต้อง";
  }
  if (invalid.addressDetails) return "กรุณากรอกรายละเอียดที่อยู่";
  if (invalid.province || invalid.district || invalid.subdistrict) {
    return "กรุณากรอกที่อยู่ให้ครบ";
  }
  if (invalid.postalCode) {
    return "รหัสไปรษณีย์ต้องมี 5 หลัก";
  }
  return null;
}
