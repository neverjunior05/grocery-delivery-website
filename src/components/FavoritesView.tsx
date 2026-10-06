"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import ProductCard from "./ProductCard";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";

export default function FavoritesView() {
  const { user, favorites, setActiveTab } = useApp();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/favorites");
        if (res.ok) {
          const data = await res.json();
          setFavoriteProducts(data.favorites || []);
        }
      } catch (e) {
        console.error("Favorites fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [user, favorites]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <Heart className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 font-['Sora']">Your Saved Grocery Staples</h2>
        <p className="text-xs text-zinc-500 mt-2">
          Log in to view and 1-click add your favorite pantry essentials, fresh produce, and snacks.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 font-['Sora'] flex items-center gap-2">
            <span>Frequently Bought & Favorites</span>
            <span className="text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
              {favoriteProducts.length} items
            </span>
          </h1>
          <p className="text-xs text-zinc-500">
            Quickly replenish your regular milk, eggs, bread, and greens without searching.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("shop")}
          className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Browse All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Heart className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-zinc-800">No favorite items saved yet</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Tap the heart icon on any grocery item in the catalog to pin it here for instant replenishment.
          </p>
          <button
            onClick={() => setActiveTab("shop")}
            className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Explore Groceries
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map((prod) => (
            <ProductCard
              key={prod.productId}
              product={{
                ...prod,
                id: prod.productId,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
