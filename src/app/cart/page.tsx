"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/Modal";
import { useState } from "react";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).cart;
  const [showClearModal, setShowClearModal] = useState(false);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">{t.title}</h1>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <p className="text-5xl mb-4">🛒</p>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t.empty}
              </h2>
              <p className="text-muted mb-6">{t.emptyDesc}</p>
              <Link
                href="/shop"
                className="inline-block bg-accent text-white px-8 py-3 rounded-2xl font-medium hover:bg-accent-dark transition-colors"
              >
                {t.browseFish}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {items.map((item, idx) => (
                  <div
                    key={item.product.id}
                    className={`flex items-center gap-4 p-5 ${
                      idx < items.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${item.product.id}`}
                        className="font-semibold text-foreground hover:text-accent text-sm"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-muted mt-0.5">
                        {item.product.species} · {item.product.color}
                      </p>
                      <p className="text-accent font-bold mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-accent text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-accent text-sm"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-foreground w-24 text-right">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <FontAwesomeIcon icon={faXmark} className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted">
                    {t.subtotal} ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
                    {t.itemsSuffix})
                  </span>
                  <span className="font-bold text-lg text-foreground">
                    {formatPrice(totalPrice())}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted">{t.shipping}</span>
                  <span className="text-sm text-green-600 font-medium">
                    {t.shippingCalc}
                  </span>
                </div>
                <hr className="mb-4" />
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold text-foreground">
                    {t.total}
                  </span>
                  <span className="text-2xl font-bold text-accent">
                    {formatPrice(totalPrice())}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-muted hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    {t.clearCart}
                  </button>
                  <Link
                    href="/checkout"
                    className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold text-center hover:bg-accent-dark transition-colors"
                  >
                    {t.checkout}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => { clearCart(); setShowClearModal(false); }}
        title={lang === "en" ? "Clear your cart?" : "ต้องการล้างตะกร้าหรือไม่?"}
        description={lang === "en" ? "All items will be removed from your cart." : "สินค้าทั้งหมดจะถูกลบออกจากตะกร้า"}
        variant="warning"
        confirmText={lang === "en" ? "Clear Cart" : "ล้างตะกร้า"}
        cancelText={lang === "en" ? "Cancel" : "ยกเลิก"}
      />
      <Footer />
    </>
  );
}
