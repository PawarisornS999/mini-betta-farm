export type InventoryOperation = "increase" | "decrease";

export function inventoryDelta(
  operation: InventoryOperation | undefined,
  quantity: number | undefined,
  legacyDelta?: number,
) {
  if (!operation) {
    return Number.isInteger(legacyDelta) && legacyDelta !== 0 ? legacyDelta : null;
  }
  if (
    (operation !== "increase" && operation !== "decrease") ||
    !Number.isInteger(quantity) ||
    Number(quantity) <= 0
  ) {
    return null;
  }
  return operation === "decrease" ? -Number(quantity) : Number(quantity);
}

export function maximumStockDecrease(stockQty: number, reservedQty: number) {
  return Math.max(0, stockQty - reservedQty);
}
