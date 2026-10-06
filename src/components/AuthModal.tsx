"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, Sparkles } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "delivery" | "admin">("customer");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || "Login failed");
      }
    } else {
      const res = await signup({
        name,
        email,
        password,
        role,
        phone,
        address,
      });
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || "Signup failed");
      }
    }
  };

  const fillDemoAccount = (demoRole: "customer" | "delivery" | "admin") => {
    setIsLogin(true);
    if (demoRole === "admin") {
      setEmail("admin@freshharvest.com");
      setPassword("adminpassword123");
    } else if (demoRole === "delivery") {
      setEmail("david.rider@freshharvest.com");
      setPassword("staffpassword123");
    } else {
      setEmail("customer@freshharvest.com");
      setPassword("customerpassword123");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mb-2 font-bold text-xl">
            🌱
          </div>
          <h2 className="text-xl font-black text-zinc-900 font-['Sora']">
            {isLogin ? "Welcome Back to FreshHarvest" : "Create Grocery Account"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isLogin ? "Sign in to track orders & reorder essentials" : "Fresh deliveries delivered directly to your door"}
          </p>
        </div>

        {/* Quick Demo Credentials Buttons */}
        <div className="mb-4 p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Demo Login Credentials:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount("customer")}
              className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold transition text-center cursor-pointer text-[11px]"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("delivery")}
              className="py-1.5 px-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-bold transition text-center cursor-pointer text-[11px]"
            >
              Delivery Staff
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("admin")}
              className="py-1.5 px-2 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 rounded-lg font-bold transition text-center cursor-pointer text-[11px]"
            >
              Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {!isLogin && (
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-600"
                  >
                    <option value="customer">Customer</option>
                    <option value="delivery">Delivery Staff</option>
                    <option value="admin">Store Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Default Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street address, Apt, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? "Authenticating..." : isLogin ? "Sign In to FreshHarvest" : "Create Fresh Account"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-zinc-500">
          {isLogin ? (
            <p>
              New customer?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
