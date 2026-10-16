"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RefundRequest, RefundStatus } from "@/types";
import { formatDateTime } from "@/lib/utils";

const labels: Record<RefundStatus, string> = {
  requested: "รอตรวจสอบ",
  reviewing: "กำลังดำเนินการ",
  refunded: "คืนเงินแล้ว",
  rejected: "ไม่อนุมัติ",
};

export default function AdminRefundsClient() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/refunds", { cache: "no-store" });
    const result = await response.json() as { data?: RefundRequest[]; message?: string };
    if (!response.ok) throw new Error(result.message || "โหลดคำร้องคืนเงินไม่สำเร็จ");
    setRefunds(result.data ?? []);
  }

  useEffect(() => {
    void load().catch((cause) => setError(cause instanceof Error ? cause.message : "โหลดคำร้องคืนเงินไม่สำเร็จ"));
  }, []);

  async function update(refund: RefundRequest, status: "reviewing" | "refunded" | "rejected") {
    if (status === "refunded" && !window.confirm("ยืนยันว่าโอนเงินคืนให้ลูกค้าแล้ว?")) return;
    setBusy(refund.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/refunds/${refund.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: notes[refund.id] ?? refund.adminNote ?? "" }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "อัปเดตสถานะไม่สำเร็จ");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setBusy("");
    }
  }

  return <div className="mx-auto max-w-6xl">
    <h2 className="text-3xl font-bold">คำร้องคืนเงิน</h2>
    <p className="mt-2 text-sm text-gray-500">ตรวจหลักฐานการโอนและยืนยันการคืนเงินจริงก่อนเปลี่ยนสถานะ</p>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-6 space-y-4">
      {refunds.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-gray-500">ไม่มีคำร้องคืนเงิน</p>}
      {refunds.map((refund) => <article key={refund.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">#{refund.id.slice(0, 8).toUpperCase()} · {formatDateTime(refund.createdAt, "th")}</p>
            <h3 className="mt-1 font-bold">{refund.productSummary}</h3>
            {refund.orderId && <Link href={`/admin/orders`} className="mt-1 inline-block text-xs text-blue-700">ออเดอร์ #{refund.orderId.slice(0, 8).toUpperCase()}</Link>}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${refund.status === "refunded" ? "bg-green-100 text-green-800" : refund.status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{labels[refund.status]}</span>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p>ยอดที่แจ้ง: <strong>฿{refund.claimedAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</strong></p>
          <p>LINE user: <span className="break-all font-mono text-xs">{refund.lineUserId}</span></p>
          <p>เลขอ้างอิง: {refund.paymentReference || "ไม่ระบุ"}</p>
          <p>หมายเหตุลูกค้า: {refund.customerNote || "ไม่ระบุ"}</p>
        </div>
        <label className="mt-4 block text-sm font-medium">หมายเหตุถึงลูกค้า
          <textarea rows={2} maxLength={1000} value={notes[refund.id] ?? refund.adminNote ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [refund.id]: event.target.value }))} disabled={refund.status === "refunded" || refund.status === "rejected"} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 disabled:bg-gray-50" />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {refund.status === "requested" && <>
            <button disabled={busy === refund.id} onClick={() => void update(refund, "reviewing")} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">เริ่มตรวจสอบ</button>
            <button disabled={busy === refund.id} onClick={() => void update(refund, "rejected")} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">ไม่อนุมัติ</button>
          </>}
          {refund.status === "reviewing" && <button disabled={busy === refund.id} onClick={() => void update(refund, "refunded")} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">ยืนยันคืนเงินแล้ว</button>}
        </div>
      </article>)}
    </div>
  </div>;
}
