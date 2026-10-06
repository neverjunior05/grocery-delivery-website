"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "delivery" | "admin";
  phone?: string | null;
  address?: string | null;
}

export interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
  productName: string;
  price: string;
  unit: string;
  stockQuantity: number;
  imageUrl: string;
  inStock: boolean;
  lineTotal?: string;
  isAvailable?: boolean;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: string;
  favorites: number[]; // productIds
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  addToCart: (product: any, delta?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  toggleFavorite: (productId: number) => Promise<void>;
  isFavorited: (productId: number) => boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  quickReorder: (orderId: number) => Promise<{ success: boolean; message: string }>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>("shop"); // 'shop', 'orders', 'favorites', 'delivery', 'admin'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize auth
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    }
    initAuth();
  }, []);

  // Fetch Cart & Favorites when user changes
  useEffect(() => {
    refreshCart();
    refreshFavorites();
  }, [user]);

  async function refreshCart() {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.items || []);
      }
    } catch (e) {
      console.error("Cart fetch error:", e);
    }
  }

  async function refreshFavorites() {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        const ids = (data.favorites || []).map((f: any) => f.productId);
        setFavorites(ids);
      }
    } catch (e) {
      console.error("Favorites fetch error:", e);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const signup = async (userData: any) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Signup failed" };
      }
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    setFavorites([]);
    document.cookie = "grocery_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setActiveTab("shop");
  };

  const updateCartItem = async (productId: number, quantity: number) => {
    if (!user) {
      // Local fallback for guest
      setCart((prev) => {
        if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
        return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
      });
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (e) {
      console.error("Cart update error:", e);
    }
  };

  const addToCart = async (product: any, delta = 1) => {
    const existing = cart.find((i) => i.productId === product.id);
    const newQty = (existing ? existing.quantity : 0) + delta;

    if (!user) {
      // Guest local
      setCart((prev) => {
        const found = prev.find((i) => i.productId === product.id);
        if (found) {
          return prev.map((i) => (i.productId === product.id ? { ...i, quantity: newQty } : i));
        }
        return [
          ...prev,
          {
            productId: product.id,
            quantity: newQty,
            productName: product.name,
            price: product.price,
            unit: product.unit,
            stockQuantity: product.stockQuantity,
            imageUrl: product.imageUrl,
            inStock: product.inStock,
            lineTotal: (parseFloat(product.price) * newQty).toFixed(2),
            isAvailable: true,
          },
        ];
      });
      return;
    }

    await updateCartItem(product.id, newQty);
  };

  const clearCart = async () => {
    if (user) {
      await fetch("/api/cart", { method: "DELETE" });
    }
    setCart([]);
  };

  const toggleFavorite = async (productId: number) => {
    if (!user) {
      alert("Please log in to save favorite items.");
      return;
    }
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.favorited) {
        setFavorites((prev) => [...prev, productId]);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== productId));
      }
    } catch (e) {
      console.error("Favorite toggle error:", e);
    }
  };

  const isFavorited = (productId: number) => favorites.includes(productId);

  const quickReorder = async (orderId: number) => {
    if (!user) {
      return { success: false, message: "Please log in to reorder." };
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/reorder`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        await refreshCart();
        setIsCartOpen(true);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || "Could not reorder" };
      }
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to reorder" };
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart
    .reduce((sum, item) => sum + parseFloat(item.price || "0") * item.quantity, 0)
    .toFixed(2);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        cart,
        cartCount,
        cartSubtotal,
        favorites,
        login,
        signup,
        logout,
        updateCartItem,
        addToCart,
        clearCart,
        refreshCart,
        toggleFavorite,
        isFavorited,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        quickReorder,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
