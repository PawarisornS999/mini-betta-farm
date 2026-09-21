"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/types";
import { canUpdateOrder, formatMoney, shortOrderId, type OrderAction } from "@/lib/orders/workflow";

const actionLabels: Array<[OrderAction, string]> = [
  ["paid", "ยืนยันชำระเงิน"], ["reject_slip", "สลิปไม่ผ่าน"],
  ["ready_to_ship", "เตรียมจัดส่ง"], ["shipped", "จัดส่งแล้ว"],
  ["delivered", "ส่งถึงแล้ว"], ["cancel", "ยกเลิกและคืน stock"],
];

export default function OrdersAdminClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      if (!response.ok) throw new Error("โหลดออเดอร์ไม่สำเร็จ");
      const result = await response.json() as { data: Order[] };
      setOrders(result.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "โหลดออเดอร์ไม่สำเร็จ"); }
  }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/orders", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("โหลดออเดอร์ไม่สำเร็จ");
        return response.json() as Promise<{ data: Order[] }>;
      })
      .then(result => { if (active) setOrders(result.data); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "โหลดออเดอร์ไม่สำเร็จ"); });
    return () => { active = false; };
  }, []);

  async function act(order: Order, action: OrderAction) {
    if (action === "cancel" && !window.confirm(`ยกเลิกออเดอร์ ${shortOrderId(order.id)} และคืน stock หรือไม่?`)) return;
    setBusy(order.id); setError("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "อัปเดตไม่สำเร็จ");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "อัปเดตไม่สำเร็จ"); }
    finally { setBusy(null); }
  }

  async function addTracking(order: Order) {
    const value = window.prompt("กรอกเลขพัสดุ", order.trackingNumber || "")?.trim();
    if (!value) return;
    setBusy(order.id); setError("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "tracking", value }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "บันทึกเลขพัสดุไม่สำเร็จ");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "บันทึกเลขพัสดุไม่สำเร็จ"); }
    finally { setBusy(null); }
  }

  async function openSlip(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${id}/slip`);
      const result = await response.json() as { url?: string; message?: string };
      if (!response.ok || !result.url) throw new Error(result.message || "เปิดสลิปไม่สำเร็จ");
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "เปิดสลิปไม่สำเร็จ"); }
  }

  const filtered = orders.filter(order => `${order.id} ${order.customerName} ${order.customerPhone}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-3xl font-bold">คำสั่งซื้อ</h2><p className="mt-1 text-sm text-gray-500">ตรวจสลิป ยืนยันเงิน และจัดส่ง</p></div><input aria-label="ค้นหาออเดอร์" placeholder="ค้นหาเลขออเดอร์ ชื่อ หรือเบอร์โทร" value={search} onChange={event => setSearch(event.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm sm:w-80" /></div>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    <div className="mt-6 space-y-4">{filtered.map(order => <article key={order.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">#{shortOrderId(order.id)} · {order.customerName}</h3><p className="text-sm text-gray-500">{order.customerPhone} · {new Date(order.createdAt).toLocaleString("th-TH")}</p></div><div className="text-right"><p className="text-xl font-bold">{formatMoney(order.totalPrice || 0)}</p><p className="text-sm text-gray-500">{order.status} / {order.paymentStatus} / {order.shippingStatus}</p></div></div>
      <div className="mt-4 border-t border-gray-100 pt-4 text-sm">{order.items.map(item => <p key={item.id}>{item.productName} × {item.quantity} — {formatMoney((item.price || 0) * item.quantity)}</p>)}<p className="mt-2">ค่าส่ง {formatMoney(order.shippingFee || 0)}</p><p className="mt-2 text-gray-600">ที่อยู่: {order.customerAddress || "ไม่ระบุ"}</p>{order.notes && <p>หมายเหตุ: {order.notes}</p>}</div>
      {order.trackingNumber && <p className="mt-2 text-sm">เลขพัสดุ: {order.trackingNumber}</p>}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">{order.slipPath && <button type="button" onClick={() => void openSlip(order.id)} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">ดูสลิป</button>}{order.paymentStatus === "paid" && <button type="button" onClick={() => void addTracking(order)} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">เลขพัสดุ</button>}{actionLabels.map(([action, label]) => {
        const disabled = busy === order.id || !canUpdateOrder(order, action);
        return <button key={action} type="button" disabled={disabled} onClick={() => void act(order, action)} className="rounded-lg bg-[#252522] px-3 py-2 text-sm font-semibold text-white disabled:opacity-30">{label}</button>;
      })}</div>
    </article>)}{!filtered.length && <p className="rounded-2xl bg-white p-8 text-center text-gray-500">ไม่มีออเดอร์</p>}</div>
  </div>;
}
