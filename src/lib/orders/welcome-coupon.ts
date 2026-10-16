export const WELCOME_COUPON_PERCENT = 50;
export const WELCOME_COUPON_MAX_DISCOUNT = 200;

export function welcomeCouponDiscount(subtotal: number, available: boolean) {
  if (!available || !Number.isFinite(subtotal) || subtotal <= 0) return 0;
  return Math.min(
    Math.round(subtotal * WELCOME_COUPON_PERCENT) / 100,
    WELCOME_COUPON_MAX_DISCOUNT,
  );
}
