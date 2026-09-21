import type { StockStatus } from "@/types";

/**
 * Determine stock status based on quantity
 */
export function getStockStatus(qty: number): StockStatus {
  if (qty <= 0) return "out_of_stock";
  if (qty <= 3) return "low_stock";
  return "in_stock";
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
  originalPrice: number,
  currentPrice: number,
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}
