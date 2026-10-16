"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import type { Order, Product } from "@/types";
import TabsMenu from "@/components/TabsMenu";
import Modal from "@/components/Modal";
import { formatMoney } from "@/lib/orders/workflow";
import { formatDateTime } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faFish, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { useLangStore } from "@/store/lang";

type Tab = "payment" | "shipping" | "receiving" | "completed" | "cancelled";

function tabMatches(order: Order, tab: Tab) {
  if (tab === "cancelled") return order.status === "cancelled";
  if (order.status === "cancelled") return false;
  if (tab === "payment")
    return order.paymentStatus !== "paid";
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
  const lang = useLangStore((state) => state.lang);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<Tab>("payment");
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  async function cancelOrder(order: Order) {
    setCancellingId(order.id);
    setCancelError("");
    try {
      const response = await fetch(`/api/customer/orders/${encodeURIComponent(order.id)}/cancel`, { method: "POST" });
      const body = await response.json() as { message?: string };
      if (!response.ok) throw new Error(body.message || "ยกเลิกคำสั่งซื้อไม่สำเร็จ");
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: "cancelled" } : item));
      setCancelTarget(null);
    } catch (cause) {
      setCancelError(cause instanceof Error ? cause.message : "ยกเลิกคำสั่งซื้อไม่สำเร็จ");
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/customer/orders", { cache: "no-store" }),
      fetch("/api/products", { cache: "no-store" }),
    ])
      .then(async ([ordersResponse, productsResponse]) => {
        if (ordersResponse.status === 401) {
          setLoginRequired(true);
          return;
        }
        const body = (await ordersResponse.json()) as { data?: Order[] };
        if (!ordersResponse.ok) throw new Error("โหลดรายการซื้อไม่สำเร็จ");
        const productBody = (await productsResponse.json()) as { data?: { data?: Product[] } };
        const images = Object.fromEntries(
          (productBody.data?.data ?? [])
            .filter((product) => product.images[0])
            .map((product) => [product.id, product.images[0]]),
        );
        setProductImages(images);
        setOrders(body.data ?? []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleOrders = useMemo(
    () => orders.filter((order) => tabMatches(order, tab)),
    [orders, tab],
  );
  const tabCounts = useMemo(
    () => ({
      payment: orders.filter((order) => tabMatches(order, "payment")).length,
      shipping: orders.filter((order) => tabMatches(order, "shipping")).length,
      receiving: orders.filter((order) => tabMatches(order, "receiving")).length,
      completed: orders.filter((order) => tabMatches(order, "completed")).length,
      cancelled: orders.filter((order) => tabMatches(order, "cancelled")).length,
    }),
    [orders],
  );
  const tabOptions = [
    { value: "payment" as const, label: "ที่ต้องชำระ", count: tabCounts.payment },
    { value: "shipping" as const, label: "ที่ต้องจัดส่ง", count: tabCounts.shipping },
    { value: "receiving" as const, label: "ที่ต้องได้รับ", count: tabCounts.receiving },
    { value: "completed" as const, label: "สำเร็จแล้ว", count: tabCounts.completed },
    { value: "cancelled" as const, label: "ยกเลิกแล้ว", count: tabCounts.cancelled },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[70vh] max-w-4xl px-4 pb-20 pt-10 text-foreground">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">การซื้อของฉัน</h1>
            <p className="mt-2 text-muted">ติดตามสถานะคำสั่งซื้อของคุณ</p>
          </div>
          <Link href="/tracking" className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
            ติดตามพัสดุ
          </Link>
        </div>
        <div className="bg-white rounded-md p-2 mt-4 shadow-lg">
          {cancelError && <p role="alert" className="mx-2 mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{cancelError}</p>}
          
          <TabsMenu options={tabOptions} value={tab} onChange={setTab} showCount={true} />
        
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
         <div className="flex items-center justify-center h-[50vh] opacity-80 text-gray-200">
          <div className="flex flex-col items-center gap-2">
            <FontAwesomeIcon icon={faBasketShopping} className="text-[22px]" />
           <p className="text-center text-muted">
            ยังไม่มีรายการในหมวดนี้
          </p>
          </div>
         </div>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleOrders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
                <Link href={`/orders/${order.id}`} className="block p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      คำสั่งซื้อ #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {statusLabel(order)}
                  </span>
                </div>
                <div id="order-items" className="mt-4 flex flex-col gap-3">
                  {order.items.map((item) => {
                    const image = item.productId ? productImages[item.productId] : undefined;
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-slate-50 p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {image ? (
                          <img src={image} alt={item.productName} className="h-20 w-20 shrink-0 rounded-xl bg-sky-50 object-cover" />
                        ) : (
                          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-sky-50 text-3xl">
                            <FontAwesomeIcon icon={faFish} className="h-8 w-8 text-sky-400" />
                          </div>
                        )}
                          <div className="flex flex-col gap-2">
                            <p className="truncate font-semibold">{item.productName}</p>
                            <p className="mt-1 text-sm text-muted">จำนวน {item.quantity} ตัว</p>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="mt-1 text-sm font-semibold text-accent">{formatMoney((item.price || 0) * item.quantity)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex justify-between  pt-4 text-sm">
                  <span className="text-muted">
                    <span className="mr-1">วันที่สั่งซื้อ:</span>
                    {formatDateTime(order.createdAt, lang)}
                  </span>
                  <strong>
                    ฿{Number(order.totalPrice ?? 0).toLocaleString("th-TH")}
                  </strong>
                </div>
                </Link>
                <div className="flex flex-row justify-end gap-2 mb-4 px-4">
                  {order.status !== "cancelled" && order.paymentStatus !== "paid" && (
                  <div >
                    <button
                      type="button"
                      onClick={() => setCancelTarget(order)}
                      disabled={cancellingId === order.id}
                      className="w-full rounded-md border border-red-200 p-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancellingId === order.id ? "กำลังยกเลิก..." : "ยกเลิกคำสั่งซื้อ"}
                    </button>
                  </div>
                )}
                  {order.status !== "cancelled" && order.paymentStatus !== "paid" && order.paymentStatus !== "slip_submitted" && (
                  <div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-accent-dark"
                    >
                      <FontAwesomeIcon icon={faCreditCard} />
                      ชำระเงิน
                    </Link>
                  </div>
                )}
    
                {order.trackingNumber &&
                  order.status !== "completed" &&
                  order.shippingStatus !== "delivered" && (
                  <div >
                    <Link
                      href={`/tracking?number=${encodeURIComponent(order.trackingNumber)}`}
                      className="block rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-bold text-red-700 hover:bg-red-100"
                    >
                      ติดตามพัสดุ {order.trackingNumber}
                    </Link>
                  </div>
                )}
                </div>
                
              </article>
            ))}
          </div>
        )}
        </div>
      </main>
      <Footer />
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => cancellingId === null && setCancelTarget(null)}
        onConfirm={() => cancelTarget && void cancelOrder(cancelTarget)}
        title={cancelTarget
          ? `${lang === "th" ? "ยืนยันยกเลิกคำสั่งซื้อ\n" : "Confirm cancellation"} "${cancelTarget.items.map((item) => item.productName).join(", ")}" ${lang === "th" ? "ใช่หรือไม่?" : "?"}`
          : lang === "th" ? "ยืนยันยกเลิกคำสั่งซื้อ" : "Confirm cancellation"}
        variant="warning"
        confirmText={cancellingId ? (lang === "th" ? "กำลังยกเลิก..." : "Cancelling…") : (lang === "th" ? "ยืนยันยกเลิก" : "Cancel order")}
        cancelText={lang === "th" ? "กลับ" : "Go back"}
        confirmDisabled={cancellingId !== null}
      />
    </>
  );
}
