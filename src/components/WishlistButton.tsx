"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { useLangStore } from "@/store/lang";
import { useWishlistStore } from "@/store/wishlist";
import type { Product } from "@/types";

export default function WishlistButton({ product, className = "" }: { product: Product; className?: string }) {
  const lang = useLangStore((state) => state.lang);
  const products = useWishlistStore((state) => state.products);
  const authenticated = useWishlistStore((state) => state.authenticated);
  const loaded = useWishlistStore((state) => state.loaded);
  const load = useWishlistStore((state) => state.load);
  const add = useWishlistStore((state) => state.add);
  const remove = useWishlistStore((state) => state.remove);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fly, setFly] = useState<{ id: number; from: { left: number; top: number }; to: { left: number; top: number } } | null>(null);
  const [animationId, setAnimationId] = useState(0);
  const saved = products.some((item) => item.id === product.id);

  useEffect(() => { void load(); }, [load]);

  async function toggle() {
    if (pending || !loaded) return;
    const source = !saved ? document.getElementById(`wishlist-button-${product.id}`)?.getBoundingClientRect() : null;
    setPending(true);
    setError("");
    try {
      const response = await fetch(saved
        ? `/api/customer/wishlist/${encodeURIComponent(product.id)}`
        : "/api/customer/wishlist", {
          method: saved ? "DELETE" : "POST",
          ...(saved ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) }),
        });
      if (response.status === 401) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/api/line/login?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      const body = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(body.message || (lang === "th" ? "บันทึกรายการที่ชอบไม่สำเร็จ" : "Unable to update wishlist"));
      if (saved) {
        remove(product.id);
      } else {
        add(product);
        const target = document.getElementById("user-menu-button")?.getBoundingClientRect();
        if (source && target) {
          const id = animationId + 1;
          setAnimationId(id);
          setFly({
            id,
            from: { left: source.left + source.width / 2 - 16, top: source.top + source.height / 2 - 16 },
            to: { left: target.left + target.width / 2 - 16, top: target.top + target.height / 2 - 16 },
          });
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (lang === "th" ? "เกิดข้อผิดพลาด" : "Something went wrong"));
    } finally {
      setPending(false);
    }
  }

  const label = saved
    ? (lang === "th" ? "นำออกจากรายการที่ชอบ" : "Remove from wishlist")
    : (lang === "th" ? "เพิ่มในรายการที่ชอบ" : "Add to wishlist");

  if (!authenticated) return null;

  return (
    <>
    <button
      id={`wishlist-button-${product.id}`}
      type="button"
      onClick={(event) => { event.preventDefault(); event.stopPropagation(); void toggle(); }}
      disabled={!loaded || pending}
      aria-label={label}
      aria-pressed={saved}
      title={error || label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl  text-lg hover:bg-gray-100  transition border border-gray-100 hover:scale-105 hover:text-rose-600 disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      <FontAwesomeIcon icon={faHeart} className={saved ? "text-rose-600" : "text-slate-500"} />
    </button>
    {fly && typeof document !== "undefined" && createPortal(
      <motion.div
        key={fly.id}
        aria-hidden="true"
        initial={{ position: "fixed", left: fly.from.left, top: fly.from.top, width: 32, height: 32, opacity: 1, scale: 1, zIndex: 100, color: "#e11d48" }}
        animate={{ left: fly.to.left, top: fly.to.top, opacity: 0.8, scale: 0.65, rotate: 360 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setFly(null)}
        className="pointer-events-none flex items-center justify-center text-2xl drop-shadow-md"
      >
        <FontAwesomeIcon icon={faHeart} />
      </motion.div>,
      document.body,
    )}
    </>
  );
}
