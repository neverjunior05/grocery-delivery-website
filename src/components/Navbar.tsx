"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  Search,
  User,
  Heart,
  Clock,
  Truck,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  ChevronDown
} from "lucide-react";

interface NavbarProps {
  onOpenAuthModal: () => void;
}

export default function Navbar({ onOpenAuthModal }: NavbarProps) {
  const {
    user,
    logout,
    cartCount,
    cartSubtotal,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    favorites,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("✨ Fresh sample grocery inventory and accounts seeded successfully!");
        window.location.reload();
      } else {
        alert("Seed failed: " + data.error);
      }
    } catch (e) {
      alert("Seed request failed.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner: Free Delivery + Express Slots */}
      <div className="bg-emerald-700 text-emerald-50 text-xs px-4 py-1.5 font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/40 text-emerald-100 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full">
              Express 2hr
            </span>
            <span>Free delivery on grocery orders over $35 • Fresh harvest guaranteed daily</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center space-x-1 hover:text-white transition bg-emerald-800/80 hover:bg-emerald-900 px-2.5 py-0.5 rounded text-white cursor-pointer"
              title="Reset sample grocery inventory, delivery slots & demo accounts"
            >
              <RefreshCw className={`w-3 h-3 ${seeding ? "animate-spin" : ""}`} />
              <span>{seeding ? "Seeding..." : "Reset / Seed Demo"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => {
              setActiveTab("shop");
            }}
            className="flex items-center space-x-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-black tracking-tight text-emerald-950 font-['Sora']">
                  Fresh<span className="text-emerald-600">Harvest</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                  Express
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium -mt-0.5">Farm fresh grocery doorstep delivery</p>
            </div>
          </button>

          {/* Search Bar - Big Tap Target & Instant Filter */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search fresh produce, dairy, bakery, meat, organic eggs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "shop") setActiveTab("shop");
                }}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-emerald-400 focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-500/15 rounded-full pl-10 pr-4 py-2 text-sm text-zinc-800 transition placeholder:text-zinc-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700 bg-zinc-200/70 hover:bg-zinc-300 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items & Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Customer Orders / History */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === "orders"
                  ? "bg-emerald-50 text-emerald-800 font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Orders & Tracking</span>
            </button>

            {/* Favorites */}
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer relative ${
                activeTab === "favorites"
                  ? "bg-emerald-50 text-emerald-800 font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="hidden lg:inline">Saved</span>
              {favorites.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Role Tab: Delivery Staff */}
            {user && (user.role === "delivery" || user.role === "admin") && (
              <button
                onClick={() => setActiveTab("delivery")}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeTab === "delivery"
                    ? "bg-amber-100 text-amber-900 font-semibold"
                    : "text-amber-800 bg-amber-50 hover:bg-amber-100"
                }`}
              >
                <Truck className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">Delivery Queue</span>
              </button>
            )}

            {/* Role Tab: Admin Portal */}
            {user && user.role === "admin" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-emerald-800 text-white font-semibold"
                    : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="font-bold">Admin Portal</span>
              </button>
            )}

            {/* User Account / Profile */}
            <div className="relative">
              {user ? (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition text-sm text-zinc-800 font-medium cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 uppercase px-1.5 py-0.5 rounded font-bold">
                      {user.role}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-zinc-100">
                        <p className="text-sm font-bold text-zinc-900">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        <p className="text-[11px] font-semibold text-emerald-700 uppercase mt-1">
                          Role: {user.role}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab("orders");
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 cursor-pointer"
                      >
                        <Clock className="w-4 h-4" />
                        <span>My Past Orders & Reorder</span>
                      </button>

                      {user.role === "delivery" && (
                        <button
                          onClick={() => {
                            setActiveTab("delivery");
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-amber-800 hover:bg-amber-50 flex items-center space-x-2 cursor-pointer"
                        >
                          <Truck className="w-4 h-4 text-amber-600" />
                          <span>Delivery Staff Queue</span>
                        </button>
                      )}

                      {user.role === "admin" && (
                        <button
                          onClick={() => {
                            setActiveTab("admin");
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50 flex items-center space-x-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Admin Management</span>
                        </button>
                      )}

                      <div className="border-t border-zinc-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-sm font-semibold transition cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Log In / Sign Up</span>
                </button>
              )}
            </div>

            {/* Quick Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-amber-500 text-white font-extrabold text-[10px] rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="font-bold hidden sm:inline">
                {cartCount > 0 ? `$${cartSubtotal}` : "Cart"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "shop") setActiveTab("shop");
              }}
              className="w-full bg-zinc-100 border border-zinc-200 focus:bg-white focus:border-emerald-600 rounded-lg pl-9 pr-3 py-1.5 text-sm text-zinc-800 outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
