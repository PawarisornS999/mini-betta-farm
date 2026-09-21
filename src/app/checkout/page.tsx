"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLine } from "@fortawesome/free-brands-svg-icons";
import { apiClient } from "@/lib/api-client/browser";
import { orderTotal, SHIPPING_FEE } from "@/lib/orders/workflow";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).checkout;

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiClient.orders.checkout({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      const order = response.data;

      if (!order.customerToken) throw new Error("ไม่พบรหัสออเดอร์ กรุณาติดต่อร้าน");
      clearCart();
      window.location.assign(`/orders/${order.id}?token=${order.customerToken}`);
    } catch (error) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String(error.message)
          : "ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-16 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {lang === "en" ? "No items to checkout" : "ไม่มีสินค้าในตะกร้า"}
          </h1>
          <Link
            href="/shop"
            className="text-accent font-medium hover:text-accent-dark"
          >
            {lang === "en" ? "Browse Fish " : "เลือกดูปลา "}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">{t.title}</h1>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Customer Info */}
            <div className="md:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  {t.customerInfo}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      {t.phone} *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      {t.address}
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your shipping address"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:outline-none text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-5">
                <h3 className="font-bold text-foreground mb-2">
                  🐟 Live Arrival Guarantee
                </h3>
                <p className="text-sm text-muted">
                  All fish are carefully packed with oxygen bags and insulated
                  packaging. We guarantee live arrival or your money back.
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  {t.orderSummary}
                </h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <hr className="my-4" />
                <div className="flex justify-between mb-6">
                  <span className="font-bold text-foreground">{t.total}</span>
                  <span className="text-xl font-bold text-accent">{formatPrice(orderTotal(totalPrice(), SHIPPING_FEE))}</span>
                </div>
                <p className="text-xs text-muted text-right -mt-4 mb-5">รวมค่าส่ง {formatPrice(SHIPPING_FEE)} แล้ว</p>

                <button
                  onClick={handlePlaceOrder}
                  disabled={!name.trim() || !phone.trim() || submitting}
                  className="w-full bg-green-500 text-white py-4 rounded-2xl font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faLine} className="w-5 h-5" />
                  {/*
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  */}
                  {submitting ? "กำลังสร้างคำสั่งซื้อ..." : "ยืนยันออเดอร์และดูวิธีชำระเงิน"}
                </button>
                {submitError && (
                  <p className="text-sm text-red-600 text-center mt-3">
                    {submitError}
                  </p>
                )}
                <p className="text-xs text-muted text-center mt-3">
                  {t.lineNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
