"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import type { Order } from "@/types";
import { getLineOrderUrl } from "@/lib/utils/line";
import { formatMoney, shortOrderId } from "@/lib/orders/workflow";

type Detail = {
  order: Order & { hasSlip: boolean };
  payment: { bank: string | null; accountName: string | null; accountNumber: string | null; promptpayNumber: string | null };
};

export default function OrderStatusClient({ id, token }: { id: string; token: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const immediate = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => { window.clearTimeout(immediate); window.clearInterval(timer); };
  }, []);

  async function load() {
    try {
      const response = await fetch(`/api/orders/${id}?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("ไม่พบออเดอร์หรือรหัสไม่ถูกต้อง");
      const result = await response.json() as { data: Detail };
      setDetail(result.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "โหลดออเดอร์ไม่สำเร็จ"); }
  }
  useEffect(() => {
    let active = true;
    fetch(`/api/orders/${id}?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("ไม่พบออเดอร์หรือรหัสไม่ถูกต้อง");
        return response.json() as Promise<{ data: Detail }>;
      })
      .then(result => { if (active) setDetail(result.data); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "โหลดออเดอร์ไม่สำเร็จ"); });
    return () => { active = false; };
  }, [id, token]);

  async function submitSlip() {
    if (!file) return;
    setBusy(true); setError("");
    const form = new FormData(); form.set("token", token); form.set("file", file);
    try {
      const response = await fetch(`/api/orders/${id}/slip`, { method: "POST", body: form });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "ส่งสลิปไม่สำเร็จ");
      setFile(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "ส่งสลิปไม่สำเร็จ"); }
    finally { setBusy(false); }
  }

  const order = detail?.order;
  const expired = Boolean(order?.reservationExpiresAt && new Date(order.reservationExpiresAt).getTime() < now && order.paymentStatus !== "slip_submitted");
  const lineMessage = order ? `ORDER ${order.id} ${token}\nสวัสดีค่ะ/ครับ ขอแจ้งออเดอร์ ${shortOrderId(order.id)} ยอด ${formatMoney(order.totalPrice || 0)}` : "";
  const lineUrl = getLineOrderUrl(lineMessage);
  return <><Header /><main className="mx-auto max-w-3xl px-4 pb-20 pt-28 text-foreground">
    <Link href="/shop" className="text-sm text-accent">← กลับไปเลือกปลา</Link>
    <h1 className="mt-4 text-3xl font-bold">คำสั่งซื้อ {shortOrderId(id)}</h1>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {!detail && !error && <p className="mt-8">กำลังโหลดคำสั่งซื้อ...</p>}
    {order && <div className="mt-6 space-y-5">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-muted">สถานะ: {order.status === "cancelled" ? "ยกเลิก" : order.paymentStatus === "paid" ? "ชำระเงินแล้ว" : order.paymentStatus === "slip_submitted" ? "ส่งสลิปแล้ว รอตรวจสอบ" : expired ? "หมดเวลาชำระเงิน กรุณาติดต่อร้าน" : order.paymentStatus === "rejected" ? "สลิปไม่ผ่าน กรุณาส่งใหม่" : "รอชำระเงิน"}</p>
        {order.reservationExpiresAt && order.paymentStatus !== "paid" && <p className="mt-1 text-xs text-muted">กรุณาชำระภายใน {new Date(order.reservationExpiresAt).toLocaleString("th-TH")}</p>}
        <div className="mt-4 space-y-2">{order.items.map(item => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.productName} × {item.quantity}</span><span>{formatMoney((item.price || 0) * item.quantity)}</span></div>)}</div>
        <hr className="my-4" />
        <div className="flex justify-between text-sm"><span>ค่าสินค้า</span><span>{formatMoney(order.subtotal || 0)}</span></div>
        <div className="mt-2 flex justify-between text-sm"><span>ค่าส่ง</span><span>{formatMoney(order.shippingFee || 0)}</span></div>
        <div className="mt-4 flex justify-between text-xl font-bold"><span>ยอดชำระ</span><span className="text-accent">{formatMoney(order.totalPrice || 0)}</span></div>
        {order.trackingNumber && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm">เลขพัสดุ: <strong>{order.trackingNumber}</strong></p>}
      </section>
      {order.status !== "cancelled" && order.paymentStatus !== "paid" && !expired && <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">โอนเงินและส่งสลิป</h2>
        {detail.payment.accountNumber || detail.payment.promptpayNumber ? <div className="mt-4 space-y-3 rounded-xl bg-emerald-50 p-4 text-sm leading-7"><p>ชื่อผู้รับเงิน: <strong>{detail.payment.accountName}</strong></p>{detail.payment.promptpayNumber && <p>PromptPay: <strong>{detail.payment.promptpayNumber}</strong></p>}{detail.payment.accountNumber && <p>{detail.payment.bank || "ธนาคาร"}: <strong>{detail.payment.accountNumber}</strong></p>}</div> : <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm">ร้านกำลังตั้งค่าบัญชีรับเงิน กรุณาติดต่อผ่าน LINE ก่อนโอนเงิน</p>}
        {(detail.payment.accountNumber || detail.payment.promptpayNumber) && <><label className="mt-5 block text-sm font-medium">แนบรูปสลิป (JPG, PNG, WebP ไม่เกิน 5 MB)</label><input aria-label="แนบสลิป" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setFile(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" /><button type="button" disabled={!file || busy} onClick={() => void submitSlip()} className="mt-4 rounded-xl bg-accent px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? "กำลังส่ง..." : detail.order.hasSlip ? "ส่งสลิปใหม่" : "ส่งสลิป"}</button></>}
      </section>}
      <section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">ติดต่อร้านผ่าน LINE OA</h2><p className="mt-2 text-sm text-muted">กดปุ่มแล้วส่งข้อความที่เตรียมไว้ เพื่อให้ร้านเชื่อม LINE กับออเดอร์นี้และแจ้งสถานะกลับได้</p>{lineUrl ? <a href={lineUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white">เปิดแชต LINE OA</a> : <p className="mt-3 text-sm text-amber-700">ลิงก์ LINE OA ยังไม่พร้อมใช้งาน กรุณาติดต่อร้านตามช่องทางที่แจ้งไว้</p>}</section>
      <p className="text-xs text-muted">เก็บลิงก์หน้านี้ไว้เพื่อตรวจสอบสถานะออเดอร์ อย่าส่งต่อให้บุคคลอื่น</p>
    </div>}
  </main><Footer /></>;
}
