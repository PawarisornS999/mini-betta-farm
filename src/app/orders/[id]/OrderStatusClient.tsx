/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import type { Order } from "@/types";
import { formatMoney, shortOrderId } from "@/lib/orders/workflow";
import { getLineOrderUrl } from "@/lib/utils/line";
import { RuleWarrantyFish } from "@/components/RuleWarrantyFish";

type OrderDetail = {
  order: Order & { hasSlip: boolean };
  payment: {
    bank: string | null;
    accountName: string | null;
    accountNumber: string | null;
    promptpayNumber: string | null;
  };
};

export default function OrderStatusClient({ id }: { id: string }) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"account" | "link" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [now, setNow] = useState(0);
  const [paymentLink, setPaymentLink] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    const clock = window.setInterval(() => setNow(Date.now()), 60_000);
    const linkTimer = window.setTimeout(
      () => setPaymentLink(window.location.href),
      0,
    );
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(clock);
      window.clearTimeout(linkTimer);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          if (active) setLoginRequired(true);
          return null;
        }
        const result = (await response.json()) as {
          data?: OrderDetail;
          message?: string;
        };
        if (!response.ok || !result.data)
          throw new Error(result.message || "โหลดข้อมูลชำระเงินไม่สำเร็จ");
        return result.data;
      })
      .then((value) => {
        if (active && value) setDetail(value);
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "โหลดข้อมูลชำระเงินไม่สำเร็จ",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function copy(value: string, kind: "account" | "link") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2500);
    } catch {
      setError("คัดลอกไม่สำเร็จ กรุณาคัดลอกด้วยตนเอง");
    }
  }

  async function submitSlip() {
    if (!file || uploading) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch(
        `/api/orders/${encodeURIComponent(id)}/slip`,
        { method: "POST", body: form },
      );
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "ส่งสลิปไม่สำเร็จ");
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ส่งสลิปไม่สำเร็จ");
      setUploading(false);
    }
  }

  const order = detail?.order;
  const payment = detail?.payment;
  const payable = Boolean(
    order &&
    order.status !== "cancelled" &&
    order.paymentStatus !== "paid" &&
    order.paymentStatus !== "slip_submitted" &&
    (!order.reservationExpiresAt ||
      new Date(order.reservationExpiresAt).getTime() > now),
  );
  const lineUrl = getLineOrderUrl(
    order ? `สวัสดีค่ะ/ครับ สอบถามออเดอร์ #${shortOrderId(order.id)}` : "",
  );
  const status = !order
    ? ""
    : order.status === "cancelled"
      ? "ยกเลิกแล้ว"
      : order.status === "completed" || order.shippingStatus === "delivered"
        ? "สำเร็จแล้ว"
        : order.paymentStatus === "paid" && order.shippingStatus === "shipped"
          ? "กำลังจัดส่ง"
          : order.paymentStatus === "paid"
            ? "ชำระเงินแล้ว กำลังเตรียมสินค้า"
            : order.paymentStatus === "slip_submitted"
              ? "ส่งสลิปแล้ว รอตรวจสอบ"
              : order.paymentStatus === "rejected"
                ? "สลิปไม่ผ่าน กรุณาส่งใหม่"
                : "รอชำระเงิน";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-slate-50 px-4 pb-16 pt-28 text-slate-800">
        <div className="mx-auto w-full max-w-[540px] overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-200/70">
          <div
            className={`bg-gradient-to-br px-6 py-9 text-center text-white ${order?.status === "cancelled" ? "from-slate-500 to-slate-700" : "from-emerald-500 to-green-600"}`}
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/25 text-4xl font-bold">
              {order?.status === "cancelled" ? "×" : "✓"}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold">
              {order ? status : "คำสั่งซื้อของฉัน"}
            </h1>
            <p className="mt-1 text-sm text-white/90">
              {order?.status === "cancelled"
                ? "คำสั่งซื้อนี้ถูกยกเลิกแล้ว"
                : "ขอบคุณที่ไว้วางใจร้านเรา มีรับประกันปลาและบริการหลังการขาย"}
            </p>
            <p className="mx-auto mt-4 w-fit rounded-full bg-white/20 px-5 py-1.5 text-sm font-bold">
              #{shortOrderId(id)}
            </p>
          </div>

          {loading ? (
            <div
              className="space-y-5 p-6"
              aria-label="กำลังโหลดข้อมูลคำสั่งซื้อ"
            >
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : loginRequired ? (
            <div className="p-8 text-center">
              <p>กรุณาเข้าสู่ระบบ LINE เพื่อดูคำสั่งซื้อ</p>
              <a
                href={`/api/line/login?returnTo=${encodeURIComponent(`/orders/${id}`)}`}
                className="mt-5 inline-block rounded-xl bg-green-600 px-5 py-3 font-bold text-white"
              >
                เข้าสู่ระบบ LINE
              </a>
            </div>
          ) : !detail ? (
            <p role="alert" className="p-8 text-center text-red-600">
              {error || "ไม่พบคำสั่งซื้อ"}
            </p>
          ) : (
            <div className="space-y-5 p-5 sm:p-6">
              {payable && payment?.promptpayNumber && (
                <section className="rounded-2xl bg-slate-50 p-5 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-sm">
                    <img
                      src={`/api/orders/${encodeURIComponent(id)}/payment-qr`}
                      alt={`QR PromptPay สำหรับชำระเงิน ${formatMoney(Number(order?.totalPrice ?? 0))}`}
                      width={256}
                      height={256}
                      className="h-56 w-56 sm:h-64 sm:w-64"
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    สแกน QR Code ด้วยแอปธนาคารเพื่อชำระเงิน
                  </p>
                </section>
              )}

              <section className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-100 px-5 py-5 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  {payable ? "ยอดที่ต้องชำระ" : "ยอดรวมคำสั่งซื้อ"}
                </p>
                <p className="mt-1 text-4xl font-extrabold text-green-600">
                  {formatMoney(Number(order?.totalPrice ?? 0))}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-100 p-5 text-sm">
                <h2 className="font-bold text-slate-700">
                  รายละเอียดคำสั่งซื้อ
                </h2>
                <div className="mt-3 space-y-2">
                  {order?.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-3">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="shrink-0">
                        {formatMoney((item.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-slate-600">
                  <div className="flex justify-between">
                    <span>ค่าสินค้า</span>
                    <span>{formatMoney(order?.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าจัดส่ง</span>
                    <span>{formatMoney(order?.shippingFee || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>สถานะ</span>
                    <span>{status}</span>
                  </div>
                  {order?.reservationExpiresAt && payable && (
                    <p className="text-xs text-amber-700">
                      กรุณาชำระภายใน{" "}
                      {new Date(order.reservationExpiresAt).toLocaleString(
                        "th-TH",
                      )}
                    </p>
                  )}
                  {order?.trackingNumber && (
                    <p className="rounded-xl bg-sky-50 p-3 font-semibold text-sky-800">
                      เลขพัสดุ: {order.trackingNumber}
                    </p>
                  )}
                </div>
              </section>

              {!payable && (
                <p className="rounded-xl bg-amber-50 p-4 text-center text-sm font-medium text-amber-800">
                  {order?.status === "cancelled"
                    ? "ออเดอร์นี้ถูกยกเลิกแล้ว"
                    : order?.paymentStatus === "paid"
                      ? "ชำระเงินแล้ว"
                      : order?.paymentStatus === "slip_submitted"
                        ? "ส่งสลิปแล้ว กำลังรอตรวจสอบ"
                        : "หมดเวลาชำระเงิน กรุณาติดต่อร้าน"}
                </p>
              )}

              {payable && (
                <section className="rounded-2xl bg-slate-50 p-5 text-sm">
                  <h2 className="font-bold text-slate-500">
                    ข้อมูลบัญชีรับเงิน
                  </h2>
                  {payment?.accountNumber || payment?.promptpayNumber ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">ธนาคาร</span>
                        <strong>{payment.bank || "-"}</strong>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">ชื่อบัญชี</span>
                        <strong>{payment.accountName || "-"}</strong>
                      </div>
                      {payment.promptpayNumber && (
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">PromptPay</span>
                          <strong>{payment.promptpayNumber}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-amber-700">
                      ร้านยังไม่ได้ตั้งค่าบัญชีรับเงิน กรุณาติดต่อร้านก่อนโอน
                    </p>
                  )}
                </section>
              )}

              {payable && payment?.accountNumber && (
                <section>
                  <label
                    htmlFor="account-number"
                    className="text-sm font-bold text-slate-600"
                  >
                    เลขบัญชี
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="account-number"
                      readOnly
                      value={payment.accountNumber}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        void copy(payment.accountNumber!, "account")
                      }
                      className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white"
                    >
                      {copied === "account" ? "คัดลอกแล้ว" : "คัดลอก"}
                    </button>
                  </div>
                </section>
              )}

              <section>
                <label
                  htmlFor="payment-link"
                  className="text-sm font-bold text-slate-600"
                >
                  ลิงก์คำสั่งซื้อ
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="payment-link"
                    readOnly
                    value={paymentLink}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => void copy(paymentLink, "link")}
                    className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white"
                  >
                    {copied === "link" ? "คัดลอกแล้ว" : "คัดลอก"}
                  </button>
                </div>
              </section>

              {payable &&
                (payment?.accountNumber || payment?.promptpayNumber) && (
                  <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                    <h2 className="font-bold">ขั้นตอนการชำระเงิน</h2>
                    <ol className="mt-3 list-inside list-decimal space-y-2 leading-6">
                      <li>สแกน QR หรือโอนเข้าบัญชีตามยอดที่แสดง</li>
                      <li>ตรวจสอบชื่อผู้รับเงินก่อนยืนยันการโอน</li>
                      <li>แนบสลิปด้านล่างเพื่อให้ร้านตรวจสอบ</li>
                    </ol>
                    <p className="mt-3 font-semibold text-red-600">
                      การสร้างออเดอร์ยังไม่ใช่การยืนยันการชำระเงิน
                    </p>
                  </section>
                )}

              {payable &&
                (payment?.accountNumber || payment?.promptpayNumber) && (
                  <section>
                    <label
                      htmlFor="payment-slip"
                      className="block text-sm font-bold text-slate-600"
                    >
                      แนบสลิป (JPG, PNG, WebP ไม่เกิน 5 MB)
                    </label>
                    <input
                      id="payment-slip"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        setFile(event.target.files?.[0] ?? null)
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => void submitSlip()}
                      disabled={!file || uploading}
                      className="mt-3 w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white disabled:opacity-50"
                    >
                      {uploading
                        ? "กำลังส่งสลิป..."
                        : "ส่งสลิปเพื่อแจ้งชำระเงิน"}
                    </button>
                  </section>
                )}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
              <div className="space-y-3 border-t border-slate-100 pt-5">
                {lineUrl && (
                  <a
                    href={lineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl bg-[#06c755] px-5 py-3 text-center font-bold text-white"
                  >
                    ติดต่อร้านผ่าน LINE
                  </a>
                )}
                <Link
                  href="/orders"
                  className="block rounded-xl border border-slate-200 px-5 py-3 text-center font-bold text-slate-600"
                >
                  การซื้อของฉัน
                </Link>
                <Link
                  href="/shop"
                  className="block text-center text-sm font-medium text-slate-500 hover:text-green-600"
                >
                  กลับหน้าร้าน
                </Link>
              </div>
            </div>
          )}
        </div>
        <RuleWarrantyFish />
      </main>
      <Footer />
    </>
  );
}
