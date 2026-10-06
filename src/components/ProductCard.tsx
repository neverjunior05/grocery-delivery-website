"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Minus, ShoppingBag, Heart, Check, AlertTriangle } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    categoryId: number;
    categoryName?: string;
    categorySlug?: string;
    price: string;
    unit: string;
    stockQuantity: number;
    lowStockThreshold?: number;
    description: string;
    imageUrl: string;
    inStock: boolean;
    badge?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, updateCartItem, toggleFavorite, isFavorited } = useApp();
  const [imageLoaded, setImageLoaded] = useState(false);

  const cartItem = cart.find((item) => item.productId === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const favorited = isFavorited(product.id);

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 10);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCartQty >= product.stockQuantity) {
      alert(`Only ${product.stockQuantity} units available in stock.`);
      return;
    }
    addToCart(product, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCartQty > 0) {
      updateCartItem(product.id, inCartQty - 1);
    }
  };

  return (
    <div className="group relative bg-white border border-zinc-200/90 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between">
      {/* Top Media & Badges */}
      <div className="relative aspect-square w-full bg-zinc-50 overflow-hidden flex items-center justify-center">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.badge && (
            <span className="bg-emerald-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-md shadow-xs tracking-wide">
              {product.badge}
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Only {product.stockQuantity} left
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-zinc-800 text-zinc-200 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Favorite heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-transform active:scale-90 cursor-pointer ${
            favorited
              ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
              : "bg-white/90 text-zinc-400 hover:text-rose-500 hover:bg-white"
          } shadow-sm backdrop-blur-xs`}
          title={favorited ? "Remove favorite" : "Save to favorites"}
        >
          <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
        </button>

        {/* Product Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
            isOutOfStock ? "grayscale opacity-60" : ""
          }`}
          loading="lazy"
        />
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {product.categoryName && (
            <span className="text-[11px] font-semibold tracking-wider text-emerald-700 uppercase">
              {product.categoryName}
            </span>
          )}
          <h3 className="font-bold text-zinc-900 text-base line-clamp-1 group-hover:text-emerald-800 transition">
            {product.name}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Unit & Quick Stepper */}
        <div className="mt-4 pt-3 border-t border-zinc-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xl font-extrabold text-zinc-950 font-['Sora']">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-zinc-500 ml-1.5">
                / {product.unit}
              </span>
            </div>
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {product.unit}
            </span>
          </div>

          {/* Direct Stepper / Add to Cart (Grocery shopping is high-frequency/low-friction) */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 text-zinc-400 font-bold text-sm cursor-not-allowed flex items-center justify-center"
            >
              Out of Stock
            </button>
          ) : inCartQty > 0 ? (
            <div className="flex items-center justify-between bg-emerald-600 text-white rounded-xl p-1 shadow-sm">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 rounded-lg bg-emerald-700/80 hover:bg-emerald-800 flex items-center justify-center font-bold text-white transition active:scale-90 cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex flex-col items-center">
                <span className="font-extrabold text-sm px-2">{inCartQty} in cart</span>
              </div>
              <button
                onClick={handleIncrement}
                disabled={inCartQty >= product.stockQuantity}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white transition active:scale-90 cursor-pointer ${
                  inCartQty >= product.stockQuantity
                    ? "bg-emerald-800/40 cursor-not-allowed"
                    : "bg-emerald-700/80 hover:bg-emerald-800"
                }`}
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleIncrement}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm hover:shadow-emerald-600/25 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
