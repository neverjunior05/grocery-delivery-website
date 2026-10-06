"use client";

import React, { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import ShopView from "@/components/ShopView";
import CartDrawer from "@/components/CartDrawer";
import OrderTrackingView from "@/components/OrderTrackingView";
import DeliveryQueueView from "@/components/DeliveryQueueView";
import AdminPortalView from "@/components/AdminPortalView";
import FavoritesView from "@/components/FavoritesView";
import AuthModal from "@/components/AuthModal";
import { ShieldCheck, Truck, Clock, RefreshCw, ShoppingBag } from "lucide-react";

function MainContent() {
  const { activeTab, setActiveTab, user } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/60 font-['Inter',sans-serif] text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar with Sticky Cart & Search */}
      <Navbar onOpenAuthModal={() => setAuthModalOpen(true)} />

      {/* Main Container Body */}
      <main className="flex-1 container mx-auto px-4 pt-6">
        {activeTab === "shop" && <ShopView />}
        {activeTab === "orders" && <OrderTrackingView />}
        {activeTab === "favorites" && <FavoritesView />}
        {activeTab === "delivery" && <DeliveryQueueView />}
        {activeTab === "admin" && <AdminPortalView />}
      </main>

      {/* Cart Sliding Drawer */}
      <CartDrawer />

      {/* Auth Modal for Signin/Signup/Demo login */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 bg-white py-8 text-xs text-zinc-500">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-zinc-900 font-['Sora'] text-sm">
              Fresh<span className="text-emerald-600">Harvest</span> Express
            </span>
            <span className="text-[11px] text-zinc-400">© 2025 All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab("shop")}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Shop Groceries
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Orders & Timeline
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Favorites
            </button>
            {user?.role === "delivery" && (
              <button
                onClick={() => setActiveTab("delivery")}
                className="hover:text-amber-700 text-amber-800 font-bold transition cursor-pointer"
              >
                Delivery Staff Queue
              </button>
            )}
            {user?.role === "admin" && (
              <button
                onClick={() => setActiveTab("admin")}
                className="hover:text-emerald-800 text-emerald-900 font-bold transition cursor-pointer"
              >
                Admin Management
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
