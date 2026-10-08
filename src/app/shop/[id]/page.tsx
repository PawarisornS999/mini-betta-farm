"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import ProductCard from "@/components/ProductCard";
import { useProduct, useProducts } from "@/lib/hooks/useCatalog";
import { useCartStore } from "@/store/cart";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { StockStatus } from "@/types";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { product, loading } = useProduct(id);
  const { products } = useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const alreadyInCart = useCartStore((s) =>
    s.items.some((item) => item.product.id === id),
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperInstance | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!selectedImage) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [selectedImage]);
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-16 text-center text-muted">
          {/* loading skeleton product card */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="relative aspect-square bg-gradient-to-br from-sky-50 to-cyan-50 rounded-3xl overflow-hidden mb-4 animate-pulse" />
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-xl bg-sky-50 animate-pulse"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-8 w-full bg-gray-200 rounded-md animate-pulse" />
                <div className="h-6 w-1/4 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {t.product.notFound}
          </h1>
          <p className="text-muted mt-2">{t.product.notFoundDesc}</p>
          <Link
            href="/shop"
            className="text-accent font-medium mt-4 inline-block hover:text-accent-dark"
          >
            {t.product.backToShop}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const related = products
    .filter((p) => p.species === product.species && p.id !== product.id)
    .slice(0, 4);

  const isOutOfStock = product.stockStatus === "out_of_stock";
  const isSold = product.adminStatus === "sold";
  const unavailable = isOutOfStock || isSold;
  const activeImage = product.images[activeImageIndex] ?? product.images[0];
  const showImage = (index: number) => {
    const nextIndex = (index + product.images.length) % product.images.length;
    setActiveImageIndex(nextIndex);
    if (mainSwiper && !mainSwiper.destroyed) {
      if (product.images.length > 1) mainSwiper.slideToLoop(nextIndex);
      else mainSwiper.slideTo(nextIndex);
    }
  };
  const openImageZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedImage(activeImage);
  };

  return (
    <>
      <Header />
      <main className="pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative mb-4 aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-50">
                <Swiper
                  key={product.id}
                  modules={[Autoplay, Navigation]}
                  onSwiper={(swiper) => setMainSwiper(swiper)}
                  onSlideChange={(swiper) => setActiveImageIndex(swiper.realIndex)}
                  slidesPerView={1}
                  loop={product.images.length > 1}
                  speed={700}
                  autoplay={product.images.length > 1 ? {
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  } : false}
                  navigation={product.images.length > 1}
                  className="absolute inset-0 !h-full w-full [--swiper-navigation-color:#fff] [--swiper-navigation-size:20px]"
                >
                  {product.images.map((image, index) => (
                    <SwiperSlide key={`${image}-${index}`}>
                      <button
                        type="button"
                        onClick={openImageZoom}
                        className="relative block h-full w-full cursor-zoom-in"
                        aria-label={`${t.product.viewImage}: ${product.name} ${index + 1}`}
                      >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>
                {product.images.length > 1 && (
                  <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                    {activeImageIndex + 1} / {product.images.length}
                  </span>
                )}
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-accent text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                    {product.badge}
                  </span>
                )}
                {isSold && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <span className="rounded-full bg-gray-800 px-5 py-2 text-base font-bold text-white shadow-lg">
                      {t.product.sold}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex scroll-smooth gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    type="button"
                    onClick={() => showImage(i)}
                    key={i}
                    className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-sky-50 transition sm:w-24 ${activeImageIndex === i ? "ring-2 ring-accent ring-offset-2" : "opacity-70 hover:opacity-100"}`}
                    aria-label={`แสดงรูปที่ ${i + 1}: ${product.name}`}
                    aria-current={activeImageIndex === i ? "true" : undefined}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-accent text-sm font-semibold">
                {product.species}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-1 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-accent">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-muted leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="mb-8 rounded-2xl bg-sky-50 p-5">
                <h3 className="mb-4 font-bold text-foreground">รายละเอียดสินค้า</h3>
                <div id="product-details" className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Detail label="รหัสสินค้า" value={product.sku ?? "-"} />
                  <Detail
                    label="เพศ"
                    value={
                      product.gender === "male"
                        ? "เพศผู้"
                        : product.gender === "female"
                          ? "เพศเมีย"
                          : "ไม่ระบุเพศ"
                    }
                  />
                  <Detail
                    label="ขนาด"
                    value={product.sizeInches != null ? `${product.sizeInches} นิ้ว` : "-"}
                  />
                  <Detail
                    label="อายุปลา"
                    value={product.ageMonths != null ? `${product.ageMonths} เดือน` : "-"}
                  />
                  <Detail label="หมวดหมู่" value={product.category ?? "-"} />
                  <Detail label="ประเภทหาง" value={product.tailType ?? "-"} />
                  <Detail
                    label="สถานะสินค้า"
                    value={product.stockStatus === "in_stock" ? "มีสินค้า" : product.stockStatus === "low_stock" ? "สินค้าใกล้หมด" : "หมดสินค้า"}
                    badgeStatus={product.stockStatus}
                  />
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() =>
                  !unavailable && !alreadyInCart && addItem(product)
                }
                disabled={unavailable || alreadyInCart}
                className={`w-full py-4 rounded-2xl text-lg font-semibold transition-colors ${
                  unavailable || alreadyInCart
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent-dark shadow-lg shadow-accent/25"
                }`}
              >
                {isSold
                  ? t.product.sold
                  : isOutOfStock
                  ? t.product.outOfStock
                  : alreadyInCart
                    ? t.product.alreadyInCart
                    : t.product.addToCart}
              </button>
            </motion.div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {t.product.moreSpecies.replace("{species}", product.species)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={t.product.viewImage}
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25"
            aria-label={t.product.closeImage}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          <div
            className="relative h-full w-full max-w-5xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`absolute inset-0 touch-none overflow-hidden ${zoom > 1 ? (isPanning ? "cursor-grabbing" : "cursor-grab") : ""}`}
              onPointerDown={(event) => {
                if (zoom <= 1 || (event.target as HTMLElement).closest("button")) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                panStart.current = {
                  pointerX: event.clientX,
                  pointerY: event.clientY,
                  x: pan.x,
                  y: pan.y,
                };
                setIsPanning(true);
              }}
              onPointerMove={(event) => {
                if (!panStart.current) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                const maxX = (bounds.width * (zoom - 1)) / 2;
                const maxY = (bounds.height * (zoom - 1)) / 2;
                setPan({
                  x: Math.max(-maxX, Math.min(maxX, panStart.current.x + event.clientX - panStart.current.pointerX)),
                  y: Math.max(-maxY, Math.min(maxY, panStart.current.y + event.clientY - panStart.current.pointerY)),
                });
              }}
              onPointerUp={() => { panStart.current = null; setIsPanning(false); }}
              onPointerCancel={() => { panStart.current = null; setIsPanning(false); }}
              onLostPointerCapture={() => { panStart.current = null; setIsPanning(false); }}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                draggable={false}
                className={`pointer-events-none select-none object-contain ${isPanning ? "" : "transition-transform duration-200"}`}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                sizes="100vw"
                priority
              />
            </div>
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 p-2" onPointerDown={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => setZoom((current) => {
                  const next = Math.max(1, current - 0.5);
                  if (next === 1) setPan({ x: 0, y: 0 });
                  return next;
                })}
                disabled={zoom <= 1}
                className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/15 disabled:opacity-40"
                aria-label="ซูมออก"
              >
                <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
              </button>
              <span className="min-w-12 text-center text-sm font-semibold text-white">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((current) => Math.min(3, current + 0.5))}
                disabled={zoom >= 3}
                className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/15 disabled:opacity-40"
                aria-label="ซูมเข้า"
              >
                <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}

const stockBadgeClasses: Record<StockStatus, string> = {
  in_stock: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  low_stock: "bg-amber-100 text-amber-700 ring-amber-600/20",
  out_of_stock: "bg-red-100 text-red-700 ring-red-600/20",
};

function Detail({ label, value, badgeStatus }: { label: string; value: string; badgeStatus?: StockStatus }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap"  >
      <span className="text-muted">{label}:</span>
      <span
        className={`ml-2 font-medium ${badgeStatus ? `inline-flex rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${stockBadgeClasses[badgeStatus]}` : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}
