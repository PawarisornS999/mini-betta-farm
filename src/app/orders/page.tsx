"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import type { Order, Product } from "@/types";
import TabsMenu from "@/components/TabsMenu";
import { formatMoney } from "@/lib/orders/workflow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faFish } from "@fortawesome/free-solid-svg-icons";
import { div } from "motion/react-client";

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
  const [productImages, setProductImages] = useState<Record<string, string>>({});

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
        <div className="bg-white rounded-md p-2 mt-4 shadow-lg">
          
          <TabsMenu options={tabOptions} value={tab} onChange={setTab} />
        
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
        </div>
      </main>
      <Footer />
    </>
  );
}
