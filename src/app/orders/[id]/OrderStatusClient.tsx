/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCloudArrowUp, faCreditCard, faFileImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import type { Order } from "@/types";
import { formatMoney, shortOrderId } from "@/lib/orders/workflow";
import { getLineOrderUrl } from "@/lib/utils/line";
import { RuleWarrantyFish } from "@/components/RuleWarrantyFish";
import { useLangStore } from "@/store/lang";

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
  const lang = useLangStore((state) => state.lang);
  const isEnglish = lang === "en";
  const text = (th: string, en: string) => isEnglish ? en : th;
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"account" | "link" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [now, setNow] = useState(0);
  const [paymentLink, setPaymentLink] = useState("");

  function selectSlip(candidate: File | undefined) {
    if (!candidate) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(candidate.type)) {
      setError(text("กรุณาเลือกไฟล์ JPG, PNG หรือ WebP เท่านั้น", "Please choose a JPG, PNG, or WebP image."));
      return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      setError(text("ขนาดไฟล์ต้องไม่เกิน 5 MB", "File size must be 5 MB or less."));
      return;
    }
    setError("");
    setFile(candidate);
  }

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
          throw new Error(result.message || text("โหลดข้อมูลชำระเงินไม่สำเร็จ", "Unable to load payment details."));
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
              : text("โหลดข้อมูลชำระเงินไม่สำเร็จ", "Unable to load payment details."),
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
      setError(text("คัดลอกไม่สำเร็จ กรุณาคัดลอกด้วยตนเอง", "Could not copy. Please copy it manually."));
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
      if (!response.ok) throw new Error(result.message || text("ส่งสลิปไม่สำเร็จ", "Unable to submit payment slip."));
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text("ส่งสลิปไม่สำเร็จ", "Unable to submit payment slip."));
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
    order
      ? text(`สวัสดีค่ะ/ครับ สอบถามออเดอร์ #${shortOrderId(order.id)}`, `Hello, I have a question about order #${shortOrderId(order.id)}.`)
      : "",
  );
  const status = !order
    ? ""
    : order.status === "cancelled"
      ? text("ยกเลิกแล้ว", "Cancelled")
      : order.status === "completed" || order.shippingStatus === "delivered"
        ? text("สำเร็จแล้ว", "Completed")
        : order.paymentStatus === "paid" && order.shippingStatus === "shipped"
          ? text("กำลังจัดส่ง", "Shipped")
          : order.paymentStatus === "paid"
            ? text("ชำระเงินแล้ว กำลังเตรียมสินค้า", "Payment confirmed · Preparing your order")
            : order.paymentStatus === "slip_submitted"
              ? text("ส่งสลิปแล้ว รอตรวจสอบ", "Slip submitted · Awaiting review")
              : order.paymentStatus === "rejected"
                ? text("สลิปไม่ผ่าน กรุณาส่งใหม่", "Slip rejected · Please submit another")
                : text("รอชำระเงิน", "Awaiting payment");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-slate-50 px-4 pb-10 pt-6 text-slate-800">
        <div className="mx-auto w-full max-w-[540px] overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-200/70">
          <div
            className={`bg-gradient-to-br px-6 py-9 text-center text-white ${order?.status === "cancelled" ? "from-slate-500 to-slate-700" : "from-emerald-500 to-green-600"}`}
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/25 text-4xl font-bold">
              <FontAwesomeIcon icon={order?.status === "cancelled" ? faXmark : faCheck} className="h-8 w-8" />
            </div>
            <h1 className="mt-3 text-2xl font-extrabold">
              {order ? status : text("คำสั่งซื้อของฉัน", "My order")}
            </h1>
            <p className="mt-1 text-sm text-white/90">
              {order?.status === "cancelled"
                ? text("คำสั่งซื้อนี้ถูกยกเลิกแล้ว", "This order has been cancelled.")
                : text("ขอบคุณที่ไว้วางใจร้านเรา มีรับประกันปลาและบริการหลังการขาย", "Thank you for choosing us. Your fish is covered by our live-arrival guarantee and after-sales support.")}
            </p>
            <p className="mx-auto mt-4 w-fit rounded-full bg-white/20 px-5 py-1.5 text-sm font-bold">
              #{shortOrderId(id)}
            </p>
          </div>

          {loading ? (
            <div
              className="space-y-5 p-6"
              aria-label={text("กำลังโหลดข้อมูลคำสั่งซื้อ", "Loading order details")}
            >
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : loginRequired ? (
            <div className="p-8 text-center">
              <p>{text("กรุณาเข้าสู่ระบบ LINE เพื่อดูคำสั่งซื้อ", "Please log in with LINE to view this order.")}</p>
              <a
                href={`/api/line/login?returnTo=${encodeURIComponent(`/orders/${id}`)}`}
                className="mt-5 inline-block rounded-xl bg-green-600 px-5 py-3 font-bold text-white"
              >
                {text("เข้าสู่ระบบ LINE", "Log in with LINE")}
              </a>
            </div>
          ) : !detail ? (
            <p role="alert" className="p-8 text-center text-red-600">
              {error || text("ไม่พบคำสั่งซื้อ", "Order not found")}
            </p>
          ) : (
            <div className="space-y-5 p-5 sm:p-6">
              {payable && payment?.promptpayNumber && (
                <section className="rounded-2xl bg-slate-50 p-5 text-center">
                  <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-sm">
                    <img
                      src={`/api/orders/${encodeURIComponent(id)}/payment-qr`}
                      alt={text(`QR PromptPay สำหรับชำระเงิน ${formatMoney(Number(order?.totalPrice ?? 0))}`, `PromptPay QR for ${formatMoney(Number(order?.totalPrice ?? 0))}`)}
                      width={256}
                      height={256}
                      className="h-56 w-56 sm:h-64 sm:w-64"
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {text("สแกน QR Code ด้วยแอปธนาคารเพื่อชำระเงิน", "Scan this QR code with your mobile banking app to pay.")}
                  </p>
                </section>
              )}

              <section className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-100 px-5 py-5 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                  <FontAwesomeIcon icon={faCreditCard} aria-hidden="true" />
                  {payable ? text("ยอดที่ต้องชำระ", "Amount due") : text("ยอดรวมคำสั่งซื้อ", "Order total")}
                </p>
                <p className="mt-1 text-4xl font-extrabold text-green-600">
                  {formatMoney(Number(order?.totalPrice ?? 0))}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-100 p-5 text-sm">
                <h2 className="font-bold text-slate-700">
                  {text("รายละเอียดคำสั่งซื้อ", "Order details")}
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
                    <span>{text("ค่าสินค้า", "Subtotal")}</span>
                    <span>{formatMoney(order?.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{text("ค่าจัดส่ง", "Shipping")}</span>
                    <span>{formatMoney(order?.shippingFee || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{text("สถานะ", "Status")}</span>
                    <span>{status}</span>
                  </div>
                  {order?.reservationExpiresAt && payable && (
                    <p className="text-xs text-amber-700">
                      {text("กรุณาชำระภายใน", "Please pay by")} {new Date(order.reservationExpiresAt).toLocaleString(isEnglish ? "en-GB" : "th-TH", { timeZone: "Asia/Bangkok", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
                      {lang === "th" ? " น." : ""}
                    </p>
                  )}
                  {order?.trackingNumber && (
                    <div className="rounded-xl bg-sky-50 p-3 font-semibold text-sky-800">
                      <p>{text("เลขพัสดุ", "Tracking number")}: {order.trackingNumber}</p>
                      <Link
                        href={`/tracking?number=${encodeURIComponent(order.trackingNumber)}`}
                        className="mt-3 block rounded-lg bg-red-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-red-700"
                      >
                        {text("ติดตามพัสดุกับไปรษณีย์ไทย", "Track with Thailand Post")}
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              {!payable && (
                <p className="rounded-xl bg-amber-50 p-4 text-center text-sm font-medium text-amber-800">
                  {order?.status === "cancelled"
                    ? text("ออเดอร์นี้ถูกยกเลิกแล้ว", "This order has been cancelled.")
                    : order?.paymentStatus === "paid"
                      ? text("ชำระเงินแล้ว", "Payment confirmed")
                      : order?.paymentStatus === "slip_submitted"
                        ? text("ส่งสลิปแล้ว กำลังรอตรวจสอบ", "Slip submitted. Awaiting admin review.")
                        : text("หมดเวลาชำระเงิน กรุณาติดต่อร้าน", "Payment time expired. Please contact the shop.")}
                </p>
              )}

              {payable && (
                <section className="rounded-2xl bg-slate-50 p-5 text-sm">
                  <h2 className="font-bold text-slate-500">
                    {text("ข้อมูลบัญชีรับเงิน", "Payment account details")}
                  </h2>
                  {payment?.accountNumber || payment?.promptpayNumber ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">{text("ธนาคาร", "Bank")}</span>
                        <strong>{payment.bank || "-"}</strong>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">{text("ชื่อบัญชี", "Account name")}</span>
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
                      {text("ร้านยังไม่ได้ตั้งค่าบัญชีรับเงิน กรุณาติดต่อร้านก่อนโอน", "Payment details are not available yet. Please contact the shop before transferring.")}
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
                    {text("เลขบัญชี", "Account number")}
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
                      {copied === "account" ? text("คัดลอกแล้ว", "Copied") : text("คัดลอก", "Copy")}
                    </button>
                  </div>
                </section>
              )}

              <section>
                <label
                  htmlFor="payment-link"
                  className="text-sm font-bold text-slate-600"
                >
                  {text("ลิงก์คำสั่งซื้อ", "Order link")}
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
                    {copied === "link" ? text("คัดลอกแล้ว", "Copied") : text("คัดลอก", "Copy")}
                  </button>
                </div>
              </section>

              {payable &&
                (payment?.accountNumber || payment?.promptpayNumber) && (
                  <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                    <h2 className="font-bold">{text("ขั้นตอนการชำระเงิน", "Payment steps")}</h2>
                    <ol className="mt-3 list-inside list-decimal space-y-2 leading-6">
                      <li>{text("สแกน QR หรือโอนเข้าบัญชีตามยอดที่แสดง", "Scan the QR code or transfer the amount shown.")}</li>
                      <li>{text("ตรวจสอบชื่อผู้รับเงินก่อนยืนยันการโอน", "Check the recipient name before confirming the transfer.")}</li>
                      <li>{text("แนบสลิปด้านล่างเพื่อให้ร้านตรวจสอบ", "Upload your slip below for review.")}</li>
                    </ol>
                    <p className="mt-3 font-semibold text-red-600">
                      {text("การสร้างออเดอร์ยังไม่ใช่การยืนยันการชำระเงิน", "Creating an order does not confirm payment.")}
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
                      {text("แนบสลิป (JPG, PNG, WebP ไม่เกิน 5 MB)", "Upload payment slip (JPG, PNG, WebP, up to 5 MB)")}
                    </label>
                    <label
                      htmlFor="payment-slip"
                      className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-8 text-center transition hover:border-green-500 hover:bg-green-50/50"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        selectSlip(event.dataTransfer.files?.[0]);
                      }}
                    >
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-600">
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-2xl" />
                      </span>
                      <span className="mt-3 font-bold text-slate-700">
                        {text("คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่", "Choose a file or drag it here")}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        {text("JPG, PNG หรือ WebP · ขนาดไม่เกิน 5 MB", "JPG, PNG, or WebP · up to 5 MB")}
                      </span>
                      <input
                        id="payment-slip"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => selectSlip(event.target.files?.[0])}
                        className="sr-only"
                      />
                    </label>
                    {file && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        <FontAwesomeIcon icon={faFileImage} className="text-lg" />
                        <span className="min-w-0 flex-1 truncate font-semibold">{file.name}</span>
                        <span className="shrink-0 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button
                          type="button"
                          aria-label={text("ลบไฟล์ที่เลือก", "Remove selected file")}
                          onClick={() => setFile(null)}
                          className="rounded-lg p-1.5 hover:bg-green-200"
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => void submitSlip()}
                      disabled={!file || uploading}
                      className="mt-3 w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white disabled:opacity-50"
                    >
                      {uploading
                        ? text("กำลังส่งสลิป...", "Submitting slip…")
                        : text("ส่งสลิปเพื่อแจ้งชำระเงิน", "Submit payment slip")}
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
                    {text("ติดต่อร้านผ่าน LINE", "Contact us on LINE")}
                  </a>
                )}
                <Link
                  href="/orders"
                  className="block rounded-xl border border-slate-200 px-5 py-3 text-center font-bold text-slate-600"
                >
                  {text("การซื้อของฉัน", "My orders")}
                </Link>
                <Link
                  href="/shop"
                  className="block text-center text-sm font-medium text-slate-500 hover:text-green-600"
                >
                  {text("กลับหน้าร้าน", "Back to shop")}
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
