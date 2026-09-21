"use client";

import { useEffect, useState } from "react";

export default function PaymentSettingsClient() {
  const [bank, setBank] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [promptpayNumber, setPromptpayNumber] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { void fetch("/api/admin/payment-settings").then(response => response.json()).then(result => {
    setBank(result.data?.payment_bank || ""); setAccountName(result.data?.payment_account_name || ""); setAccountNumber(result.data?.payment_account_number || ""); setPromptpayNumber(result.data?.payment_promptpay_number || "");
  }).catch(() => setMessage("โหลดข้อมูลไม่สำเร็จ")); }, []);
  async function save() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/payment-settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bank, accountName, accountNumber, promptpayNumber }) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "บันทึกไม่สำเร็จ");
      setMessage("บันทึกข้อมูลรับเงินแล้ว");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "บันทึกไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold">บัญชีรับเงิน</h2><p className="mt-2 text-sm text-gray-500">ข้อมูลนี้จะแสดงให้ลูกค้าบนหน้าออเดอร์ ค่าส่งปัจจุบัน 80 บาท</p>
    <div className="mt-6 space-y-4"><label className="block text-sm">ชื่อผู้รับเงิน<input value={accountName} onChange={event => setAccountName(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm">เลข PromptPay<input value={promptpayNumber} onChange={event => setPromptpayNumber(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm">ธนาคาร<input value={bank} onChange={event => setBank(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm">เลขบัญชีธนาคาร<input value={accountNumber} onChange={event => setAccountNumber(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label></div>
    <button type="button" disabled={busy} onClick={() => void save()} className="mt-6 rounded-xl bg-[#252522] px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? "กำลังบันทึก..." : "บันทึก"}</button>{message && <p role="status" className="mt-4 text-sm">{message}</p>}
  </div>;
}
