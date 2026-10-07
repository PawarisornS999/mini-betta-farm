"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import LazyProductCard from "@/components/LazyProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { useCategories } from "@/lib/hooks/useCatalog";
import { useFilterStore } from "@/store/filter";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import BaseDropdown from "@/components/BaseDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFishFins } from "@fortawesome/free-solid-svg-icons";
import type { Product } from "@/types";

const PRODUCT_PAGE_SIZE = 12;

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestLock = useRef(false);
  const { categories } = useCategories();
  const {
    search,
    species,
    category,
    priceRange,
    difficulty,
    color,
    setSearch,
    setSpecies,
    setCategory,
    setPriceRange,
    setDifficulty,
    setColor,
    resetFilters,
  } = useFilterStore();
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).shop;

  const loadPage = useCallback(async (nextPage: number) => {
    if (requestLock.current) return;
    requestLock.current = true;
    if (nextPage === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const response = await fetch(`/api/products?page=${nextPage}&pageSize=${PRODUCT_PAGE_SIZE}`, { cache: "no-store" });
      const result = await response.json() as {
        success: boolean;
        message?: string;
        data?: { data: Product[]; total: number; page: number; totalPages: number };
      };
      if (!response.ok || !result.data) throw new Error(result.message || "โหลดสินค้าไม่สำเร็จ");
      setProducts((current) => nextPage === 1 ? result.data!.data : [...current, ...result.data!.data]);
      setTotalProducts(result.data.total);
      setPage(result.data.page);
      setHasMore(result.data.page < result.data.totalPages);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "โหลดสินค้าไม่สำเร็จ");
    } finally {
      requestLock.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore || loading || loadingMore || error) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !requestLock.current) void loadPage(page + 1);
    }, { rootMargin: "400px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loadPage, loading, loadingMore, page]);

  useEffect(() => {
    const categoryFromUrl = new URLSearchParams(window.location.search).get("category");
    if (categoryFromUrl) setCategory(categoryFromUrl);
  }, [setCategory]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (species && p.species !== species) return false;
      if (category && p.category !== category) return false;
      if (
        difficulty &&
        p.difficultyLevel !==
          (difficulty === "intermediate" ? "medium" : difficulty)
      )
        return false;
      if (color && p.color !== color) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [products, search, species, category, priceRange, difficulty, color]);

  return (
    <>
      <Header />
      <main className="pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-muted">
              {t.subtitle.replace("{count}", String(totalProducts))}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="relative z-20 lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">
                    {t.filterHeading}
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-accent hover:text-accent-dark"
                  >
                    {t.reset}
                  </button>
                </div>

                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    {t.search.replace("...", "")}
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.search}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-accent focus:outline-none text-sm"
                  />
                </div>

                {/* Species */}
                <BaseDropdown
                  id="category"
                  label={t.species}
                  value={category}
                  placeholder={t.allSpecies}
                  onChange={setCategory}
                  options={categories.map((item) => ({ value: item.slug, label: item.name }))}
                />
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    {t.priceRange}: ฿{priceRange[0]} — ฿{priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-full accent-accent"
                  />
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="relative z-0 lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: PRODUCT_PAGE_SIZE }, (_, index) => <ProductCardSkeleton key={index} />)}
                </div>
              ) : error ? (
                <div className="text-center py-20 text-red-600">{error}</div>
              ) : filtered.length === 0 ? (
                <>
                  <div className="text-center py-20">
                    <FontAwesomeIcon icon={faFishFins} className="mb-4 text-4xl text-muted/50" />
                    <p className="text-foreground font-medium">{hasMore ? (lang === "en" ? "Loading more products…" : "กำลังโหลดสินค้าเพิ่มเติม…") : t.noResults}</p>
                    {!hasMore && <>
                      <p className="text-muted text-sm mt-1">{t.noResultsDesc}</p>
                      <button onClick={resetFilters} className="mt-4 text-accent text-sm font-medium hover:text-accent-dark">{t.reset}</button>
                    </>}
                  </div>
                  <div ref={loadMoreRef} aria-hidden="true" className="h-8" />
                  {loadingMore && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <ProductCardSkeleton key={index} />)}</div>}
                  {error && <div className="py-6 text-center"><p className="mb-3 text-sm text-red-600">{error}</p><button onClick={() => void loadPage(page + 1)} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">โหลดอีกครั้ง</button></div>}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((product) => (
                      <LazyProductCard key={product.id} product={product} />
                    ))}
                    {loadingMore && Array.from({ length: 6 }, (_, index) => <ProductCardSkeleton key={`loading-${index}`} />)}
                  </div>
                  <div ref={loadMoreRef} aria-hidden="true" className="h-8" />
                  {error && products.length > 0 && (
                    <div className="py-6 text-center">
                      <p className="mb-3 text-sm text-red-600">{error}</p>
                      <button onClick={() => void loadPage(page + 1)} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">โหลดอีกครั้ง</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
