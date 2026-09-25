import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { createHmac } from "node:crypto";

async function loadModule(path) {
  const source = readFileSync(join(process.cwd(), path), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace('from "crypto"', 'from "node:crypto"');
  return import(`data:text/javascript,${encodeURIComponent(compiled)}`);
}

const workflow = await loadModule("src/lib/orders/workflow.ts");
const line = await loadModule("src/lib/utils/line.ts");
const messaging = await loadModule("src/lib/line/messaging.ts");
const inventory = await loadModule("src/lib/inventory.ts");

test("fixed shipping is included exactly once", () => {
  assert.equal(workflow.orderTotal(350, workflow.SHIPPING_FEE), 430);
  assert.equal(workflow.orderTotal(350, workflow.SHIPPING_FEE, 20), 410);
  assert.throws(() => workflow.orderTotal(350, -80));
});

test("paid or shipped orders cannot be cancelled and unpaid orders cannot ship", () => {
  assert.equal(workflow.canUpdateOrder({ status: "pending", paymentStatus: "awaiting_slip", shippingStatus: "pending" }, "cancel"), true);
  assert.equal(workflow.canUpdateOrder({ status: "processing", paymentStatus: "paid", shippingStatus: "pending" }, "cancel"), false);
  assert.equal(workflow.canUpdateOrder({ status: "pending", paymentStatus: "awaiting_slip", shippingStatus: "pending" }, "shipped"), false);
  assert.equal(workflow.canUpdateOrder({ status: "processing", paymentStatus: "paid", shippingStatus: "pending" }, "shipped"), false);
  assert.equal(workflow.canUpdateOrder({ status: "processing", paymentStatus: "paid", shippingStatus: "ready_to_ship" }, "shipped"), true);
  assert.equal(workflow.canUpdateOrder({ status: "pending", paymentStatus: "slip_submitted", shippingStatus: "pending", slipPath: "slip.jpg" }, "paid"), true);
  assert.equal(workflow.canUpdateOrder({ status: "pending", paymentStatus: "slip_submitted", shippingStatus: "pending" }, "paid"), false);
});

test("LINE order link points to configured OA and encodes Thai message", () => {
  process.env.NEXT_PUBLIC_LINE_OA_ID = "@mybettashop";
  const url = line.getLineOrderUrl("ORDER 123\nสวัสดี");
  assert.match(url, /%40mybettashop/);
  assert.match(url, /ORDER%20123/);
  assert.match(url, /%E0%B8%AA/);
  delete process.env.NEXT_PUBLIC_LINE_OA_ID;
  assert.match(line.getLineOrderUrl("ORDER 123"), /%40097zxssv/);
});

test("LINE webhook signature accepts only the correct channel secret", () => {
  process.env.LINE_CHANNEL_SECRET = "test-channel-secret";
  const body = '{"events":[]}';
  const signature = createHmac("sha256", process.env.LINE_CHANNEL_SECRET).update(body).digest("base64");
  assert.equal(messaging.verifyLineSignature(body, signature), true);
  assert.equal(messaging.verifyLineSignature(body + " ", signature), false);
  assert.equal(messaging.verifyLineSignature(body, "invalid"), false);
  delete process.env.LINE_CHANNEL_SECRET;
});

test("order command requires both order ID and private token", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  const token = "22222222-2222-4222-8222-222222222222";
  assert.deepEqual(messaging.parseOrderCommand(`ORDER ${id} ${token}\nสวัสดี`), { id, token });
  assert.equal(messaging.parseOrderCommand(`ORDER ${id}`), null);
});

test("customer LINE order message links to the private payment page", () => {
  const message = messaging.customerOrderFlexMessage({
    id: "11111111-1111-4111-8111-111111111111",
    shippingFee: 80,
    totalPrice: 430,
    items: [{ productName: "Galaxy Betta", product: { name: "Galaxy Betta" }, quantity: 1, price: 350 }],
  }, "https://example.com/orders/111?token=private-token");
  assert.equal(message.type, "flex");
  assert.match(message.altText, /11111111/);
  assert.equal(message.contents.footer.contents[0].action.uri, "https://example.com/orders/111?token=private-token");
});

test("inventory operations produce safe signed deltas", () => {
  assert.equal(inventory.inventoryDelta("increase", 3), 3);
  assert.equal(inventory.inventoryDelta("decrease", 3), -3);
  assert.equal(inventory.inventoryDelta("decrease", 0), null);
  assert.equal(inventory.inventoryDelta("decrease", -2), null);
  assert.equal(inventory.inventoryDelta(undefined, undefined, -1), -1);
  assert.equal(inventory.maximumStockDecrease(5, 2), 3);
  assert.equal(inventory.maximumStockDecrease(1, 1), 0);
});
