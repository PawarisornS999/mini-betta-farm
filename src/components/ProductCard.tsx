"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice } from "@/lib/utils";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const lang = useLangStore((s) => s.lang);
  const pt = getT(lang).product;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [fly, setFly] = useState<{
    id: number;
    from: { left: number; top: number; size: number };
    to: { left: number; top: number };
  } | null>(null);
  const animationId = useRef(0);
  const alreadyInCart = useCartStore((s) =>
    s.items.some((item) => item.product.id === product.id),
  );

  const isOutOfStock = product.stockStatus === "out_of_stock";

  const handleAddToCart = () => {
    if (isOutOfStock || alreadyInCart) return;
    addItem(product);

    const source = buttonRef.current?.getBoundingClientRect();
    const target = document
      .getElementById("header-cart-button")
      ?.getBoundingClientRect();
    if (!source || !target) return;

    setFly({
      id: ++animationId.current,
      from: {
        left: source.left + source.width / 2 - 28,
        top: source.top + source.height / 2 - 28,
        size: Math.max(source.width, 56),
      },
      to: {
        left: target.left + target.width / 2 - 17,
        top: target.top + target.height / 2 - 17,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group bg-card-bg rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {fly &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            key={fly.id}
            aria-hidden="true"
            initial={{
              position: "fixed",
              left: fly.from.left,
              top: fly.from.top,
              width: fly.from.size,
              height: fly.from.size,
              opacity: 0.95,
              scale: 1,
              borderRadius: 18,
              zIndex: 100,
              overflow: "hidden",
              backgroundColor: "white",
            }}
            animate={{
              left: fly.to.left,
              top: fly.to.top,
              width: 34,
              height: 34,
              opacity: 0.85,
              scale: 0.8,
              borderRadius: 999,
              rotate: 360,
            }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              setFly(null);
              window.dispatchEvent(new CustomEvent("cart-fly-complete"));
            }}
            className="pointer-events-none shadow-xl ring-2 ring-white"
          >
            <Image
              src={product.images[0]}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          </motion.div>,
          document.body,
        )}
      <Link href={`/shop/${product.id}`}>
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 to-cyan-50 aspect-square">
          {product.badge && (
            <span className="absolute top-3 left-3 z-10 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
              {product.badge}
            </span>
          )}
          {product.stockStatus === "low_stock" && !product.badge && (
            <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {pt.lowStock}
            </span>
          )}
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/shop/${product.id}`}>
          <p className="text-xs text-accent font-medium mb-1">
            {product.species}
          </p>
          <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-accent font-bold text-lg">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-muted text-sm line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <motion.button
          ref={buttonRef}
          whileHover={{ scale: isOutOfStock || alreadyInCart ? 1 : 1.03 }}
          whileTap={{ scale: isOutOfStock || alreadyInCart ? 1 : 0.97 }}
          onClick={handleAddToCart}
          disabled={isOutOfStock || alreadyInCart}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
            isOutOfStock || alreadyInCart
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-foreground text-white hover:bg-accent"
          }`}
        >
          {isOutOfStock
            ? pt.outOfStock
            : alreadyInCart
              ? pt.alreadyInCart
              : pt.addToCart}
        </motion.button>
      </div>
    </motion.div>
  );
}
