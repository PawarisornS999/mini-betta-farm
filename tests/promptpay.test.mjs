import assert from "node:assert/strict";
import test from "node:test";
import { promptPayPayload } from "../src/lib/orders/promptpay.ts";

test("PromptPay QR encodes the recipient and exact amount with a valid checksum", () => {
  assert.equal(
    promptPayPayload("0812345678", 180),
    "00020101021229370016A000000677010111011300668123456785802TH53037645406180.0063049275",
  );
});

test("invalid recipient and amount cannot produce a payment QR", () => {
  assert.throws(() => promptPayPayload("123", 180));
  assert.throws(() => promptPayPayload("0812345678", 0));
});
