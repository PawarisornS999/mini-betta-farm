"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import type { Order } from "@/types";
import TabsMenu from "@/components/TabsMenu";

type Tab = "all" | "payment" | "shipping" | "receiving" | "completed";

function tabMatches(order: Order, tab: Tab) {
  if (tab === "all") return true;
  if (tab === "payment")
    return order.paymentStatus !== "paid" && order.status !== "cancelled";
  if (tab === "shipping")
    return (
      order.paymentStatus === "paid" && order.shippingStatus !== "delivered"
    );
  if (tab === "receiving") return order.shippingStatus === "shipped";
  return order.status === "completed" || order.shippingStatus === "delivered";
}

function statusLabel(order: Order) {
  if (order.status === "cancelled") return "ยกเลิกแล้ว";
  if (order.status === "completed" || order.shippingStatus === "delivered")
    return "สำเร็จแล้ว";
  if (order.paymentStatus !== "paid") return "รอชำระเงิน";
  if (order.shippingStatus === "shipped") return "กำลังจัดส่ง";
  return "กำลังเตรียมสินค้า";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    fetch("/api/customer/orders", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          setLoginRequired(true);
          return;
        }
        const body = (await response.json()) as { data?: Order[] };
        if (!response.ok) throw new Error("โหลดรายการซื้อไม่สำเร็จ");
        setOrders(body.data ?? []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleOrders = useMemo(
    () => orders.filter((order) => tabMatches(order, tab)),
    [orders, tab],
  );
  const tabOptions = [
    { value: "all" as const, label: "ทั้งหมด" },
    { value: "payment" as const, label: "ที่ต้องชำระ" },
    { value: "shipping" as const, label: "ที่ต้องจัดส่ง" },
    { value: "receiving" as const, label: "ที่ต้องได้รับ" },
    { value: "completed" as const, label: "สำเร็จแล้ว" },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[70vh] max-w-4xl px-4 pb-20 pt-28 text-foreground">
        <h1 className="text-3xl font-bold">การซื้อของฉัน</h1>
        <p className="mt-2 text-muted">ติดตามสถานะคำสั่งซื้อของคุณ</p>
        <div className="mt-8">
          <TabsMenu options={tabOptions} value={tab} onChange={setTab} />
        </div>
        {loading ? (
          <p className="py-16 text-center text-muted">กำลังโหลดรายการซื้อ...</p>
        ) : loginRequired ? (
          <div className="py-16 text-center">
            <p className="mb-5 text-muted">
              กรุณาเข้าสู่ระบบ LINE เพื่อดูรายการซื้อของคุณ
            </p>
            <button
              onClick={() =>
                window.location.assign("/api/line/login?returnTo=/orders")
              }
              className="rounded-2xl bg-green-600 px-6 py-3 font-bold text-white"
            >
              เข้าสู่ระบบ LINE
            </button>
          </div>
        ) : !visibleOrders.length ? (
          <p className="py-16 text-center text-muted">
            ยังไม่มีรายการในหมวดนี้
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      คำสั่งซื้อ #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 font-semibold">
                      {order.items
                        .map((item) => `${item.productName} × ${item.quantity}`)
                        .join(", ")}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {statusLabel(order)}
                  </span>
                </div>
                <div className="mt-4 flex justify-between border-t border-black/5 pt-4 text-sm">
                  <span className="text-muted">
                    {new Date(order.createdAt).toLocaleDateString("th-TH")}
                  </span>
                  <strong>
                    ฿{Number(order.totalPrice ?? 0).toLocaleString("th-TH")}
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
