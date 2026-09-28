import "server-only";

import type { CustomerProfile, CustomerProfileInput } from "@/types";
import { supabaseRest } from "@/lib/supabase/rest";

type CustomerProfileRow = {
  line_user_id: string;
  line_display_name: string;
  line_picture_url: string | null;
  customer_name: string;
  customer_phone: string;
  address_details: string;
  province: string;
  district: string;
  subdistrict: string;
  postal_code: string;
  updated_at: string;
};

const select = "line_user_id,line_display_name,line_picture_url,customer_name,customer_phone,address_details,province,district,subdistrict,postal_code,updated_at";

function mapProfile(row: CustomerProfileRow): CustomerProfile {
  return {
    displayName: row.line_display_name,
    pictureUrl: row.line_picture_url ?? undefined,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    addressDetails: row.address_details,
    province: row.province,
    district: row.district,
    subdistrict: row.subdistrict,
    postalCode: row.postal_code,
    updatedAt: row.updated_at,
  };
}

export async function getCustomerProfile(lineUserId: string) {
  const rows = await supabaseRest<CustomerProfileRow[]>(
    `customer_profiles?line_user_id=eq.${encodeURIComponent(lineUserId)}&select=${select}`,
    { serviceRole: true, cache: "no-store" },
  );
  return rows[0] ? mapProfile(rows[0]) : null;
}

export async function saveCustomerProfile(
  lineUserId: string,
  displayName: string,
  pictureUrl: string | undefined,
  input: CustomerProfileInput,
) {
  const rows = await supabaseRest<CustomerProfileRow[]>(
    `customer_profiles?on_conflict=line_user_id&select=${select}`,
    {
      method: "POST",
      serviceRole: true,
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        line_user_id: lineUserId,
        line_display_name: displayName,
        line_picture_url: pictureUrl || null,
        customer_name: input.customerName.trim(),
        customer_phone: input.customerPhone.trim(),
        address_details: input.addressDetails.trim(),
        province: input.province.trim(),
        district: input.district.trim(),
        subdistrict: input.subdistrict.trim(),
        postal_code: input.postalCode.trim(),
      }),
    },
  );
  if (!rows[0]) throw new Error("Customer profile was not saved");
  return mapProfile(rows[0]);
}
