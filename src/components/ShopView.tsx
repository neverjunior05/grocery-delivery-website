"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import ProductCard from "./ProductCard";
import {
  Apple,
  Milk,
  Croissant,
  Beef,
  Package,
  Coffee,
  Cookie,
  SlidersHorizontal,
  Flame,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw
} from "lucide-react";

export default function ShopView() {
  const { searchQuery, selectedCategory, setSelectedCategory, setActiveTab, user } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState("featured");
  const [priceRange, setPriceRange] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);
        if (catRes.ok) setCategories((await catRes.json()).categories || []);
        if (prodRes.ok) setProducts((await prodRes.json()).products || []);
      } catch (e) {
        console.error("Shop load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Category Icon Resolver
  const renderCategoryIcon = (slug: string) => {
    switch (slug) {
      case "fruits-vegetables":
        return <Apple className="w-5 h-5 text-emerald-600" />;
      case "dairy-eggs":
        return <Milk className="w-5 h-5 text-amber-600" />;
      case "bakery":
        return <Croissant className="w-5 h-5 text-amber-700" />;
      case "meat-seafood":
        return <Beef className="w-5 h-5 text-rose-600" />;
      case "pantry-staples":
        return <Package className="w-5 h-5 text-zinc-600" />;
      case "beverages":
        return <Coffee className="w-5 h-5 text-teal-600" />;
      case "snacks":
        return <Cookie className="w-5 h-5 text-orange-600" />;
      default:
        return <Package className="w-5 h-5 text-emerald-600" />;
    }
  };

  // Filter products client-side for fluid, instantaneous snappy reactivity
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all" && p.categorySlug !== selectedCategory) {
      return false;
    }
    if (inStockOnly && p.stockQuantity <= 0) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (priceRange === "under-5") {
      if (parseFloat(p.price) >= 5) return false;
    } else if (priceRange === "5-10") {
      const pr = parseFloat(p.price);
      if (pr < 5 || pr > 10) return false;
    } else if (priceRange === "over-10") {
      if (parseFloat(p.price) <= 10) return false;
    }
    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "price-asc") return parseFloat(a.price) - parseFloat(b.price);
    if (sortOption === "price-desc") return parseFloat(b.price) - parseFloat(a.price);
    if (sortOption === "name-asc") return a.name.localeCompare(b.name);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Grocery Highlights Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="container mx-auto px-6 py-10 md:py-14 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-600/60 backdrop-blur-xs border border-emerald-400/30 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Doorstep Delivery Guaranteed In 2 Hours</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight font-['Sora']">
              Crisp Produce, Bakery & Farm Staples.
            </h1>
            <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed max-w-lg">
              Farm-to-doorstep grocery delivery. Select your custom date & delivery slot, enjoy live tracking milestones, and reorder staples with 1 click.
            </p>

            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start text-xs font-semibold">
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <Truck className="w-4 h-4 text-emerald-300" />
                <span>Capped Slots (Zero Delay)</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Live Stock Re-validation</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <RotateCcw className="w-4 h-4 text-emerald-300" />
                <span>1-Click Repeat Basket</span>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-xs md:max-w-sm shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl text-zinc-900">
              <div className="bg-white rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
                    Next Available Slot
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    9 slots left
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <p className="text-xs font-bold text-zinc-900">Today 4:00 PM - 6:00 PM</p>
                  <p className="text-[11px] text-zinc-600">Free delivery on orders over $35</p>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById("catalog-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Shop Fresh Groceries</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Quick Navigation in warm/earthy tones */}
      <section id="catalog-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 font-['Sora']">
              Shop by Fresh Category
            </h2>
            <p className="text-xs text-zinc-500">Pick a category to filter your favorite staples</p>
          </div>

          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Show All ({products.length})
            </button>
          )}
        </div>

        {/* Category Cards Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {/* All */}
          <button
            onClick={() => setSelectedCategory("all")}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              selectedCategory === "all"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                : "bg-white border-zinc-200 hover:border-emerald-300 text-zinc-700"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-zinc-100 text-emerald-800"
              }`}
            >
              🌱
            </div>
            <span className="text-xs font-bold">All Items</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                    : "bg-white border-zinc-200 hover:border-emerald-300 text-zinc-700"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-white/20 text-white" : "bg-zinc-50"
                  }`}
                >
                  {renderCategoryIcon(cat.slug)}
                </div>
                <span className="text-xs font-bold truncate max-w-full">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Toolbar (Low Friction, Instant Search & Price/Stock Sorting) */}
      <section className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* In stock toggle */}
            <label className="flex items-center space-x-2 bg-zinc-50 border border-zinc-200 hover:border-emerald-400 px-3 py-1.5 rounded-xl cursor-pointer select-none transition">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-zinc-800">In-Stock Only</span>
            </label>

            {/* Price filter pills */}
            <div className="flex items-center space-x-1 bg-zinc-100 p-1 rounded-xl">
              <button
                onClick={() => setPriceRange("all")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  priceRange === "all" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                All Prices
              </button>
              <button
                onClick={() => setPriceRange("under-5")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  priceRange === "under-5" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Under $5
              </button>
              <button
                onClick={() => setPriceRange("5-10")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  priceRange === "5-10" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                $5 - $10
              </button>
              <button
                onClick={() => setPriceRange("over-10")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  priceRange === "over-10" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                $10+
              </button>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-zinc-500 font-semibold">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 font-bold text-zinc-800 outline-none focus:border-emerald-600"
            >
              <option value="featured">Featured & Best Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical (A - Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 font-['Sora']">
            {selectedCategory === "all"
              ? "All Fresh Groceries"
              : categories.find((c) => c.slug === selectedCategory)?.name || "Groceries"}
            <span className="text-xs text-zinc-500 font-normal ml-2">
              ({sortedProducts.length} items found)
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-zinc-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-md mx-auto">
            <Package className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-zinc-800 font-['Sora']">No items found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Try adjusting your search query, price filter, or category selection.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setInStockOnly(false);
                setPriceRange("all");
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
