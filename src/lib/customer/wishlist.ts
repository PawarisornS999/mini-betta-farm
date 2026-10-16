import { mapProduct, type ProductRow } from "@/lib/supabase/mappers";
import { supabaseRest } from "@/lib/supabase/rest";
import type { Product } from "@/types";

type WishlistRow = { product_id: string };

export async function getCustomerWishlist(lineUserId: string): Promise<Product[]> {
  const rows = await supabaseRest<WishlistRow[]>(
    `customer_wishlist?select=product_id&line_user_id=eq.${encodeURIComponent(lineUserId)}&order=created_at.desc`,
    { serviceRole: true, cache: "no-store" },
  );
  const products = await Promise.all(rows.map(async ({ product_id }) => {
    const matches = await supabaseRest<ProductRow[]>(
      `products?select=*&id=eq.${encodeURIComponent(product_id)}&admin_status=in.(available,reserved,sold)&limit=1`,
      { serviceRole: true, cache: "no-store" },
    );
    return matches[0] ? mapProduct(matches[0]) : null;
  }));
  return products.filter((product): product is Product => product !== null);
}

export async function addCustomerWishlistItem(lineUserId: string, productId: string) {
  const matches = await supabaseRest<Array<{ id: string }>>(
    `products?select=id&id=eq.${encodeURIComponent(productId)}&admin_status=in.(available,reserved,sold)&limit=1`,
    { serviceRole: true, cache: "no-store" },
  );
  if (!matches[0]) return false;
  await supabaseRest("customer_wishlist?on_conflict=line_user_id,product_id", {
    method: "POST",
    serviceRole: true,
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ line_user_id: lineUserId, product_id: productId }),
  });
  return true;
}

export async function removeCustomerWishlistItem(lineUserId: string, productId: string) {
  await supabaseRest(
    `customer_wishlist?line_user_id=eq.${encodeURIComponent(lineUserId)}&product_id=eq.${encodeURIComponent(productId)}`,
    { method: "DELETE", serviceRole: true },
  );
}
