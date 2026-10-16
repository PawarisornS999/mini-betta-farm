"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { useCartStore } from "@/store/cart";
import { useLangStore } from "@/store/lang";
import { getLineOrderUrl } from "@/lib/utils/line";
import type { RefundRequest } from "@/types";

const statusText: Record<RefundRequest["status"], [string, string]> = {
  requested: ["รับคำร้องแล้ว", "Request received"],
  reviewing: ["กำลังดำเนินการ", "In review"],
  refunded: ["คืนเงินแล้ว", "Refund completed"],
  rejected: ["คำร้องไม่ผ่าน", "Request declined"],
};
const statusDescription: Record<RefundRequest["status"], [string, string]> = {
  requested: ["ร้านได้รับคำร้องแล้ว กรุณาส่งสลิปผ่าน LINE พร้อมเลขคำร้อง", "The shop received your request. Send your slip and request number on LINE."],
  reviewing: ["ร้านกำลังตรวจสอบรายการโอนและดำเนินการคืนเงิน", "The shop is checking the transfer and arranging your refund."],
  refunded: ["ร้านยืนยันว่าโอนเงินคืนแล้ว กรุณาตรวจสอบบัญชีของคุณ", "The shop confirmed the refund transfer. Please check your account."],
  rejected: ["คำร้องไม่ผ่านการตรวจสอบ กรุณาดูหมายเหตุหรือติดต่อร้าน", "The request was declined. Check the note or contact the shop."],
};

export default function RefundsClient({ startNew, orderId }: { startNew: boolean; orderId: string }) {
  const lang = useLangStore((state) => state.lang);
  const text = (th: string, en: string) => lang === "en" ? en : th;
  const cartItems = useCartStore((state) => state.items);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(startNew);
  const [summary, setSummary] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((result) => {
          const order = result?.data?.order;
          if (order) {
            setSummary(order.items.map((item: { productName: string; quantity: number }) => `${item.productName} × ${item.quantity}`).join(", "));
            setAmount(String(order.totalPrice ?? ""));
          }
        })
        .catch(() => {});
    } else if (cartItems.length) {
      setSummary((current) => current || cartItems.map((item) => `${item.product.name} × ${item.quantity}`).join(", "));
    }
  }, [orderId, cartItems]);

  async function loadRefunds() {
    const response = await fetch("/api/customer/refunds", { cache: "no-store" });
    const result = await response.json() as { data?: RefundRequest[]; message?: string };
    if (!response.ok) throw new Error(result.message || "โหลดข้อมูลไม่สำเร็จ");
    setRefunds(result.data ?? []);
  }

  useEffect(() => {
    void loadRefunds().catch((cause) => setError(cause instanceof Error ? cause.message : "โหลดข้อมูลไม่สำเร็จ")).finally(() => setLoading(false));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/customer/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId || undefined, productSummary: summary, claimedAmount: amount, paymentReference: reference, customerNote: note }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "ส่งคำร้องไม่สำเร็จ");
      await loadRefunds();
      setShowForm(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ส่งคำร้องไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <Header />
    <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-10">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{text("สถานะการคืนเงิน", "Refund status")}</h1>
          <p className="mt-2 text-sm text-muted">{text("ติดตามคำร้องและติดต่อร้านผ่าน LINE", "Track requests and contact the shop on LINE")}</p>
        </div>
        <button type="button" onClick={() => setShowForm((current) => !current)} className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-white">
          {text("แจ้งเรื่องขอคืนเงิน", "Request a refund")}
        </button>
      </div>

      {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {showForm && <form onSubmit={(event) => void submit(event)} className="mb-7 space-y-4 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold">{text("แจ้งรายการโอนเงิน", "Tell us about your transfer")}</h2>
        <p className="text-sm text-muted">{text("ส่งคำร้องเมื่อคุณโอนเงินแล้วแต่ไม่ได้รับปลา ร้านจะตรวจสอบยอดจริงก่อนคืนเงิน หลังส่งคำร้องกรุณาส่งสลิปผ่าน LINE พร้อมเลขคำร้อง", "Submit this request if you transferred money but did not get the fish. The shop will verify payment. After submitting, send your slip and request number on LINE.")}</p>
        {orderId && <p className="text-xs text-muted">{text("ออเดอร์", "Order")}: #{orderId.slice(0, 8).toUpperCase()}</p>}
        <label className="block text-sm font-medium">{text("ปลาหรือรายการสินค้า", "Fish or items")}
          <input required maxLength={500} value={summary} onChange={(event) => setSummary(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium">{text("ยอดที่โอน (บาท)", "Amount transferred (THB)")}
          <input required type="number" min="0.01" max="1000000" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium">{text("เลขอ้างอิงการโอน (ถ้ามี)", "Transfer reference (optional)")}
          <input maxLength={100} value={reference} onChange={(event) => setReference(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium">{text("รายละเอียดเพิ่มเติม (ถ้ามี)", "Additional details (optional)")}
          <textarea maxLength={1000} rows={3} value={note} onChange={(event) => setNote(event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-gray-200 px-3 py-2.5" />
        </label>
        <button disabled={busy} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? text("กำลังส่ง...", "Submitting...") : text("ส่งคำร้อง", "Submit request")}</button>
      </form>}

      <div className="space-y-4">
        {loading ? <p className="text-sm text-muted">{text("กำลังโหลด...", "Loading...")}</p> : refunds.length === 0 ?
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-muted">{text("ยังไม่มีคำร้องคืนเงิน", "No refund requests yet")}</p> :
          refunds.map((refund) => <article key={refund.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted">#{refund.id.slice(0, 8).toUpperCase()}{refund.orderId ? ` · ${text("ออเดอร์", "Order")} #${refund.orderId.slice(0, 8).toUpperCase()}` : ""}</p>
                <h2 className="mt-1 font-semibold text-foreground">{refund.productSummary}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${refund.status === "refunded" ? "bg-emerald-100 text-emerald-800" : refund.status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{statusText[refund.status][lang === "en" ? 1 : 0]}</span>
            </div>
            <p className="mt-3 text-sm text-muted">{text("ยอดที่แจ้ง", "Claimed amount")}: ฿{refund.claimedAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</p>
            <p className="mt-1 text-sm text-muted">{statusDescription[refund.status][lang === "en" ? 1 : 0]}</p>
            {refund.adminNote && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">{refund.adminNote}</p>}
            <a href={getLineOrderUrl(text(`สอบถามคำร้องคืนเงิน #${refund.id.slice(0, 8).toUpperCase()}`, `Question about refund request #${refund.id.slice(0, 8).toUpperCase()}`))} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl border border-green-500 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50">{text("ติดต่อแอดมินใน LINE", "Contact the shop on LINE")}</a>
          </article>)}
      </div>
      <Link href="/orders" className="mt-7 inline-block text-sm font-medium text-accent">{text("กลับไปรายการซื้อ", "Back to orders")}</Link>
    </main>
    <Footer />
  </>;
}
