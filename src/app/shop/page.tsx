"use client";

import { useEffect, useMemo } from "react";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import ProductCard from "@/components/ProductCard";
import {
  speciesList,
  colorList,
  difficultyList,
} from "@/data/products";
import { useCategories, useProducts } from "@/lib/hooks/useCatalog";
import { useFilterStore } from "@/store/filter";
import { Species, Difficulty } from "@/types";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import BaseDropdown from "@/components/BaseDropdown";

export default function ShopPage() {
  const { products, loading, error } = useProducts();
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
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-muted">
              {t.subtitle.replace("{count}", String(products.length))}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
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
                  label="Category"
                  value={category}
                  placeholder="All categories"
                  onChange={setCategory}
                  options={categories.map((item) => ({ value: item.slug, label: item.name }))}
                />

                {/* Species */}
                <BaseDropdown
                  id="species"
                  label={t.species}
                  value={species}
                  placeholder={t.allSpecies}
                  onChange={(value) => setSpecies(value as Species | "")}
                  options={speciesList.map((s) => ({ value: s, label: s }))}
                />

                {/* Difficulty */}
                <BaseDropdown
                  id="difficulty"
                  label={t.difficulty}
                  value={difficulty}
                  placeholder={t.allDifficulty}
                  onChange={(value) => setDifficulty(value as Difficulty | "")}
                  options={difficultyList.map((d) => ({
                    value: d,
                    label: d.charAt(0).toUpperCase() + d.slice(1),
                  }))}
                />

                {/* Color */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    {t.color}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setColor("")}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        !color
                          ? "bg-accent text-white"
                          : "bg-gray-100 text-foreground/60 hover:bg-accent/10"
                      }`}
                    >
                      {t.allColors}
                    </button>
                    {colorList.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c === color ? "" : c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          color === c
                            ? "bg-accent text-white"
                            : "bg-gray-100 text-foreground/60 hover:bg-accent/10"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

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
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted">
                  Showing {filtered.length} of {products.length} fish
                </p>
              </div>

              {loading ? (
                <div className="text-center py-20 text-muted">Loading fish...</div>
              ) : error ? (
                <div className="text-center py-20 text-red-600">{error}</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">🐟</p>
                  <p className="text-foreground font-medium">{t.noResults}</p>
                  <p className="text-muted text-sm mt-1">{t.noResultsDesc}</p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-accent text-sm font-medium hover:text-accent-dark"
                  >
                    {t.reset}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
