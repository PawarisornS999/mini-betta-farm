import type { Product, ProductListItem, StockStatus } from "@/types";

export function effectiveProductPrice(product: Pick<Product | ProductListItem, "price" | "basePrice" | "salePrice" | "saleStartDate" | "saleEndDate">): number {
  const basePrice = product.basePrice ?? product.price;
  if (product.salePrice == null || !product.saleStartDate || !product.saleEndDate) return basePrice;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return today >= product.saleStartDate && today <= product.saleEndDate ? product.salePrice : basePrice;
}

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
