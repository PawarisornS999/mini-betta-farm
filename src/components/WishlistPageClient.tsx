"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlistStore } from "@/store/wishlist";
import { useLangStore } from "@/store/lang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

export default function WishlistPageClient() {
  const products = useWishlistStore((state) => state.products);
  const loading = useWishlistStore((state) => state.loading);
  const loaded = useWishlistStore((state) => state.loaded);
  const error = useWishlistStore((state) => state.error);
  const load = useWishlistStore((state) => state.load);
  const lang = useLangStore((state) => state.lang);
  const text = (th: string, en: string) => lang === "th" ? th : en;

  useEffect(() => { void load(); }, [load]);

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[65vh] max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <FontAwesomeIcon icon={faHeart} className="text-rose-600" />
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{text("รายการที่ชอบ", "Wishlist")}</h1>
        </div>
        {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading || !loaded ? (
          <p className="py-16 text-center text-muted">{text("กำลังโหลดรายการที่ชอบ…", "Loading wishlist…")}</p>
        ) : products.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <FontAwesomeIcon icon={faHeart} className="mb-4 text-4xl text-rose-200" />
            <h2 className="mb-2 text-xl font-bold text-foreground">{text("ยังไม่มีสินค้าในรายการที่ชอบ", "Your wishlist is empty")}</h2>
            <p className="mb-6 text-sm text-muted">{text("กดปุ่มรูปหัวใจบนปลาที่สนใจเพื่อบันทึกไว้", "Tap the heart on a fish to save it here")}</p>
            <Link href="/shop" className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark">{text("เลือกชมปลากัด", "Browse bettas")}</Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
