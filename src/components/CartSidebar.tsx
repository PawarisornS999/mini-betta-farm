"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function CartSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).cartSidebar;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-foreground">
                {t.title} ({totalItems})
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close cart"
              >
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FontAwesomeIcon icon={faCartShopping} className="w-16 h-16 text-muted/30 mb-4" />
                  <p className="text-muted font-medium">{t.empty}</p>
                  <p className="text-sm text-muted/70 mt-1">{t.emptyDesc}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 pb-4 border-b"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-muted mt-0.5">
                          {item.product.species}
                        </p>
                        <p className="text-accent font-semibold text-sm mt-1">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-sm hover:border-accent"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-sm hover:border-accent"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t bg-sky-50/50">
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-foreground">{t.total}</span>
                  <span className="font-bold text-lg text-accent">
                    {formatPrice(totalPrice())}
                  </span>
                </div>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full bg-foreground text-white py-3 rounded-xl font-medium hover:bg-accent transition-colors text-center"
                >
                  {t.viewCart}
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full mt-2 bg-accent text-white py-3 rounded-xl font-medium hover:bg-accent-dark transition-colors text-center"
                >
                  {t.checkout}
                </Link>
                <button
                  onClick={onClose}
                  className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-foreground"
                >
                  {t.continueShopping}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
