"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/types";
import Modal from "@/components/Modal";
import {
  canUpdateOrder,
  formatMoney,
  shortOrderId,
  type OrderAction,
} from "@/lib/orders/workflow";
import { faBasketShopping } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BaseDropdown from "@/components/BaseDropdown";

type OrderStatusFilter =
  | "all"
  | "awaiting_payment"
  | "slip_submitted"
  | "rejected"
  | "preparing"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled";

const actionLabels: Array<[OrderAction, string]> = [
  ["paid", "ยืนยันชำระเงิน"],
  ["reject_slip", "สลิปไม่ผ่าน"],
  ["ready_to_ship", "เตรียมจัดส่ง"],
  ["shipped", "จัดส่งแล้ว"],
  ["delivered", "ส่งถึงแล้ว"],
  ["cancel", "ยกเลิกและคืน stock"],
];

function orderStageLabel(order: Order) {
  if (order.status === "cancelled") return "ยกเลิกแล้ว";
  if (order.shippingStatus === "delivered" || order.status === "completed") return "ส่งสำเร็จ";
  if (order.shippingStatus === "shipped") return "กำลังจัดส่ง";
  if (order.shippingStatus === "ready_to_ship") return "พร้อมจัดส่ง";
  if (order.paymentStatus === "paid") return "กำลังเตรียมสินค้า";
  if (order.paymentStatus === "slip_submitted") return "รอตรวจสลิป";
  if (order.paymentStatus === "rejected") return "สลิปไม่ผ่าน";
  return "รอชำระเงิน";
}

function orderStageKey(order: Order): Exclude<OrderStatusFilter, "all"> {
  if (order.status === "cancelled") return "cancelled";
  if (order.shippingStatus === "delivered" || order.status === "completed") return "delivered";
  if (order.shippingStatus === "shipped") return "shipped";
  if (order.shippingStatus === "ready_to_ship") return "ready_to_ship";
  if (order.paymentStatus === "paid") return "preparing";
  if (order.paymentStatus === "slip_submitted") return "slip_submitted";
  if (order.paymentStatus === "rejected") return "rejected";
  return "awaiting_payment";
}

function stageBadgeClass(order: Order) {
  if (order.status === "cancelled") return "bg-red-50 text-red-700 ring-red-600/15";
  if (order.shippingStatus === "delivered" || order.status === "completed") return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
  if (order.paymentStatus === "slip_submitted") return "bg-blue-50 text-blue-700 ring-blue-600/15";
  if (order.paymentStatus === "rejected") return "bg-red-50 text-red-700 ring-red-600/15";
  return "bg-amber-50 text-amber-700 ring-amber-600/15";
}

export default function OrdersAdminClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [confirmTarget, setConfirmTarget] = useState<{ order: Order; action: "cancel" | "delete" } | null>(null);
  const [trackingTarget, setTrackingTarget] = useState<Order | null>(null);
  const [trackingValue, setTrackingValue] = useState("");
  const [trackingError, setTrackingError] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      if (!response.ok) throw new Error("โหลดออเดอร์ไม่สำเร็จ");
      const result = (await response.json()) as { data: Order[] };
      setOrders(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "โหลดออเดอร์ไม่สำเร็จ");
    }
  }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/orders", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("โหลดออเดอร์ไม่สำเร็จ");
        return response.json() as Promise<{ data: Order[] }>;
      })
      .then((result) => {
        if (active) setOrders(result.data);
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "โหลดออเดอร์ไม่สำเร็จ",
          );
      });
    return () => {
      active = false;
    };
  }, []);

  async function act(order: Order, action: OrderAction) {
    setBusy(order.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "อัปเดตไม่สำเร็จ");
      await load();
      if (action === "cancel") setConfirmTarget(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "อัปเดตไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  }

  function openTrackingModal(order: Order) {
    setTrackingTarget(order);
    setTrackingValue(order.trackingNumber || "");
    setTrackingError("");
  }

  async function addTracking() {
    if (!trackingTarget) return;
    const value = trackingValue.trim().toUpperCase();
    if (!/^[A-Z0-9]{13}$/.test(value)) {
      setTrackingError("กรุณากรอกเลขพัสดุไปรษณีย์ไทย 13 หลัก");
      return;
    }
    setBusy(trackingTarget.id);
    setError("");
    setTrackingError("");
    try {
      const response = await fetch(`/api/admin/orders/${trackingTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "tracking", value }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message || "บันทึกเลขพัสดุไม่สำเร็จ");
      await load();
      setTrackingTarget(null);
      setTrackingValue("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "บันทึกเลขพัสดุไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }

  async function deleteOrder(order: Order) {
    setBusy(order.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "ลบออเดอร์ไม่สำเร็จ");
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setConfirmTarget(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ลบออเดอร์ไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  }

  async function openSlip(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${id}/slip`);
      const result = (await response.json()) as {
        url?: string;
        message?: string;
      };
      if (!response.ok || !result.url)
        throw new Error(result.message || "เปิดสลิปไม่สำเร็จ");
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "เปิดสลิปไม่สำเร็จ");
    }
  }

  const filtered = orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customerName} ${order.customerPhone} ${order.trackingNumber ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || orderStageKey(order) === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const statusOptions: Array<{ value: OrderStatusFilter; label: string }> = [
    { value: "all", label: "ทุกสถานะ" },
    { value: "awaiting_payment", label: "รอชำระเงิน" },
    { value: "slip_submitted", label: "รอตรวจสลิป" },
    { value: "rejected", label: "สลิปไม่ผ่าน" },
    { value: "preparing", label: "กำลังเตรียมสินค้า" },
    { value: "ready_to_ship", label: "พร้อมจัดส่ง" },
    { value: "shipped", label: "กำลังจัดส่ง" },
    { value: "delivered", label: "ส่งสำเร็จ" },
    { value: "cancelled", label: "ยกเลิกแล้ว" },
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">คำสั่งซื้อ</h2>
          <p className="mt-1 text-sm text-gray-500">
            ตรวจสลิป ยืนยันเงิน และจัดส่ง
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <BaseDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            ariaLabel="กรองตามสถานะสินค้า"
            className="w-full sm:w-52"
          />
          <input
            aria-label="ค้นหาออเดอร์"
            placeholder="ค้นหาเลขออเดอร์ ชื่อ เบอร์โทร หรือเลขพัสดุ"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-gray-200 p-3 text-sm sm:w-80"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}
      <div className="mt-6 space-y-4">
        {filtered.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h3 className="font-bold">
                  #{shortOrderId(order.id)} · {order.customerName}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.customerPhone} ·{" "}
                  {new Date(order.createdAt).toLocaleString("th-TH")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  {formatMoney(order.totalPrice || 0)}
                </p>
                <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${stageBadgeClass(order)}`}>
                  {orderStageLabel(order)}
                </span>
              </div>
            </div>
            <div className="mt-5 grid gap-6 border-t border-gray-100 pt-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                  <p className="font-medium">
                    {item.productName} × {item.quantity}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${stageBadgeClass(order)}`}>
                      {orderStageLabel(order)}
                    </span>
                    <strong>{formatMoney((item.price || 0) * item.quantity)}</strong>
                  </div>
                </div>
              ))}
              <p className="mt-2">
                ค่าส่ง {formatMoney(order.shippingFee || 0)}
              </p>
              <p className="mt-2 text-gray-600">
                ที่อยู่: {order.customerAddress || "ไม่ระบุ"}
              </p>
              {order.notes && <p>หมายเหตุ: {order.notes}</p>}
              {order.trackingNumber && (
                <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 font-mono text-sm font-semibold text-blue-800">
                  เลขพัสดุ: {order.trackingNumber}
                </p>
              )}
              </div>
              <OrderStepper order={order} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {order.slipPath && (
                <button
                  type="button"
                  onClick={() => void openSlip(order.id)}
                  className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                >
                  ดูสลิป
                </button>
              )}
              {order.paymentStatus === "paid" && (
                <button
                  type="button"
                  onClick={() => openTrackingModal(order)}
                  className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                >
                  เลขพัสดุ
                </button>
              )}
              {actionLabels.filter(([action]) => canUpdateOrder(order, action)).map(([action, label]) => {
                const disabled = busy === order.id;
                return (
                  <button
                    key={action}
                    type="button"
                    disabled={disabled}
                    onClick={() => action === "cancel" ? setConfirmTarget({ order, action }) : void act(order, action)}
                    className="rounded-lg bg-[#252522] px-3 py-2 text-sm font-semibold text-white disabled:opacity-30"
                  >
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={busy === order.id}
                onClick={() => setConfirmTarget({ order, action: "delete" })}
                className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-30"
              >
                ลบออเดอร์
              </button>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-[50vh] text-gray-200">
            <div className="flex flex-col items-center gap-2">
              <FontAwesomeIcon icon={faBasketShopping} className="text-[22px]" />
              <p className="text-center text-muted">
                ไม่พบออเดอร์ที่ค้นหา
              </p>
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={Boolean(trackingTarget)}
        onClose={() => {
          if (!busy) {
            setTrackingTarget(null);
            setTrackingError("");
          }
        }}
        onConfirm={() => void addTracking()}
        title="กรอกเลขพัสดุ"
        description={trackingTarget ? `ออเดอร์ #${shortOrderId(trackingTarget.id)}` : undefined}
        variant="warning"
        confirmText={busy ? "กำลังบันทึก..." : "บันทึกเลขพัสดุ"}
        cancelText="ยกเลิก"
        confirmDisabled={Boolean(busy) || !trackingValue.trim()}
      >
        <label htmlFor="tracking-number" className="mb-2 block text-sm font-semibold text-gray-700">
          เลขพัสดุไปรษณีย์ไทย 13 หลัก
        </label>
        <input
          id="tracking-number"
          autoFocus
          value={trackingValue}
          maxLength={13}
          onChange={(event) => {
            setTrackingValue(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
            setTrackingError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") void addTracking();
          }}
          placeholder="เช่น EF582568151TH"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm uppercase outline-none focus:border-amber-500"
        />
        {trackingError && <p className="mt-2 text-xs text-red-600">{trackingError}</p>}
      </Modal>
      <Modal
        isOpen={Boolean(confirmTarget)}
        onClose={() => { if (!busy) setConfirmTarget(null); }}
        onConfirm={() => {
          if (!confirmTarget) return;
          if (confirmTarget.action === "delete") void deleteOrder(confirmTarget.order);
          else void act(confirmTarget.order, "cancel");
        }}
        title={confirmTarget?.action === "delete" ? "ลบออเดอร์ถาวรหรือไม่?" : "ยกเลิกออเดอร์หรือไม่?"}
        description={confirmTarget ? confirmTarget.action === "delete" ? `ออเดอร์ ${shortOrderId(confirmTarget.order.id)} จะถูกลบพร้อมรายการสินค้า การดำเนินการนี้ไม่สามารถย้อนกลับได้` : `ยกเลิกออเดอร์ ${shortOrderId(confirmTarget.order.id)} และคืน stock หรือไม่?` : undefined}
        variant="error"
        confirmText={confirmTarget?.action === "delete" ? "ลบออเดอร์" : "ยืนยันยกเลิก"}
        cancelText="ยกเลิก"
      />
    </div>
  );
}

function OrderStepper({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <aside className="rounded-2xl border border-red-100 bg-red-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-red-500">สถานะออเดอร์</p>
        <p className="mt-2 font-bold text-red-700">ยกเลิกแล้ว</p>
        <p className="mt-1 text-xs leading-5 text-red-600">คืนจำนวนสินค้าเข้าสต็อกเรียบร้อยแล้ว</p>
      </aside>
    );
  }

  const completedSteps = order.shippingStatus === "delivered" || order.status === "completed"
    ? 4
    : order.shippingStatus === "shipped"
      ? 3
      : order.shippingStatus === "ready_to_ship"
        ? 2
        : order.paymentStatus === "paid"
          ? 1
          : 0;
  const steps = [
    {
      title: "ชำระเงิน",
      description: order.paymentStatus === "slip_submitted" ? "ลูกค้าส่งสลิปแล้ว รอตรวจสอบ" : order.paymentStatus === "rejected" ? "สลิปไม่ผ่าน รอลูกค้าส่งใหม่" : order.paymentStatus === "paid" ? "ยืนยันการชำระเงินแล้ว" : "รอลูกค้าชำระเงิน",
    },
    { title: "เตรียมสินค้า", description: "ตรวจสินค้าและเตรียมบรรจุ" },
    { title: "จัดส่ง", description: order.trackingNumber ? `เลขพัสดุ ${order.trackingNumber}` : "ต้องเพิ่มเลขพัสดุก่อนจัดส่ง" },
    { title: "ส่งถึงลูกค้า", description: "ปิดออเดอร์เมื่อจัดส่งสำเร็จ" },
  ];

  return (
    <aside className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">ขั้นตอนดำเนินการ</p>
      <ol>
        {steps.map((step, index) => {
          const complete = index < completedSteps;
          const current = index === completedSteps;
          return (
            <li key={step.title} className="relative flex gap-3 pb-6 last:pb-0">
              {index < steps.length - 1 && (
                <span className={`absolute left-[13px] top-7 h-[calc(100%-0.25rem)] w-0.5 ${complete ? "bg-emerald-400" : "bg-gray-200"}`} />
              )}
              <span className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${complete ? "bg-emerald-500 text-white" : current ? "bg-amber-500 text-white ring-4 ring-amber-100" : "bg-gray-200 text-gray-500"}`}>
                {complete ? "✓" : index + 1}
              </span>
              <div>
                <p className={`text-sm font-bold ${complete ? "text-emerald-700" : current ? "text-amber-700" : "text-gray-500"}`}>{step.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-gray-500">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
