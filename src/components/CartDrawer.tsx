"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Truck
} from "lucide-react";

interface DeliverySlot {
  id: number;
  date: string;
  timeWindow: string;
  maxCapacity: number;
  bookedCount: number;
  isFull: boolean;
  remainingCapacity: number;
  statusText: string;
}

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartCount,
    cartSubtotal,
    updateCartItem,
    clearCart,
    user,
    setActiveTab,
  } = useApp();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Sandbox Card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Sync user info if loaded
  useEffect(() => {
    if (user) {
      if (!deliveryAddress && user.address) setDeliveryAddress(user.address);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Load slots when opening checkout
  useEffect(() => {
    if (isCartOpen && step === "checkout") {
      fetchSlots();
    }
  }, [isCartOpen, step]);

  const fetchSlots = async () => {
    try {
      const res = await fetch("/api/delivery-slots");
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
        // Auto-select first available slot
        const firstAvailable = (data.slots || []).find((s: DeliverySlot) => !s.isFull);
        if (firstAvailable) {
          setSelectedSlotId(firstAvailable.id);
        }
      }
    } catch (e) {
      console.error("Error loading delivery slots:", e);
    }
  };

  const subtotalNum = parseFloat(cartSubtotal);
  const deliveryFee = subtotalNum >= 35 ? 0 : 3.99;
  const grandTotal = (subtotalNum + deliveryFee).toFixed(2);
  const freeDeliveryGap = Math.max(0, 35 - subtotalNum).toFixed(2);

  const handleProceedToCheckout = () => {
    if (!user) {
      alert("Please log in or sign up to complete your grocery checkout.");
      return;
    }
    setStep("checkout");
    fetchSlots();
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);
    if (!deliveryAddress.trim()) {
      setCheckoutError("Please enter a valid delivery address.");
      return;
    }
    if (!customerPhone.trim()) {
      setCheckoutError("Please enter a phone number for the delivery courier.");
      return;
    }
    if (!selectedSlotId) {
      setCheckoutError("Please select an available delivery slot.");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedSlot = slots.find((s) => s.id === selectedSlotId);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryAddress,
          customerPhone,
          deliverySlotId: selectedSlotId,
          deliverySlotText: selectedSlot ? `${selectedSlot.date} (${selectedSlot.timeWindow})` : "",
          paymentMethod,
          customerNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.stockErrors && Array.isArray(data.stockErrors)) {
          setCheckoutError(`Stock notice: ${data.stockErrors.join(". ")}`);
        } else {
          setCheckoutError(data.error || "Failed to place order.");
        }
        setIsSubmitting(false);
        return;
      }

      setPlacedOrder(data.order);
      setStep("success");
    } catch (e: any) {
      setCheckoutError(e.message || "An unexpected error occurred during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    // If order completed, reset drawer
    if (step === "success") {
      setStep("cart");
      setPlacedOrder(null);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-zinc-900 font-['Sora']">
              {step === "cart" && `My Grocery Cart (${cartCount})`}
              {step === "checkout" && "Choose Delivery Slot & Checkout"}
              {step === "success" && "Order Confirmed!"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {step !== "success" && (
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-xs">
            {deliveryFee === 0 ? (
              <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Congrats! You qualified for Free Delivery on this order.
              </span>
            ) : (
              <span className="text-zinc-600">
                Add <strong className="text-emerald-700">${freeDeliveryGap}</strong> more of fresh groceries for{" "}
                <strong className="text-emerald-700">FREE delivery</strong>!
              </span>
            )}
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* STEP 1: CART ITEMS VIEW */}
          {step === "cart" && (
            <div>
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-800">Your basket is empty</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Fill it up with fresh fruits, farm dairy, artisan bakery, and everyday pantry staples.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveTab("shop");
                    }}
                    className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Selected Groceries ({cart.length} items)
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                    </button>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-emerald-200 transition"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded-lg bg-white shrink-0"
                      />
                      <div className="flex-1 px-3">
                        <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">
                          {item.productName}
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          ${parseFloat(item.price).toFixed(2)} / {item.unit}
                        </p>
                        <p className="text-xs font-extrabold text-emerald-800 mt-0.5">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center space-x-1.5 bg-white border border-zinc-200 rounded-lg p-1">
                        <button
                          onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-zinc-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CHECKOUT (DELIVERY SLOT SELECTION + ADDRESS + PAYMENT) */}
          {step === "checkout" && (
            <div className="space-y-5">
              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{checkoutError}</p>
                </div>
              )}

              {/* Delivery Slot Selection (Defining grocery feature) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Select Delivery Slot (Date & Window)
                  </label>
                  <span className="text-[11px] text-zinc-500">Capacity capped</span>
                </div>
                <p className="text-xs text-zinc-500">
                  Pick your preferred delivery time. Slots marked <strong>Full</strong> cannot accept more orders.
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          if (!slot.isFull) setSelectedSlotId(slot.id);
                        }}
                        className={`p-3 rounded-xl border transition flex items-center justify-between ${
                          slot.isFull
                            ? "bg-zinc-100 border-zinc-200 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 cursor-pointer"
                            : "bg-white border-zinc-200 hover:border-emerald-300 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="deliverySlot"
                            checked={isSelected}
                            disabled={slot.isFull}
                            onChange={() => setSelectedSlotId(slot.id)}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <p className="text-xs font-bold text-zinc-900">{slot.timeWindow}</p>
                            <p className="text-[11px] text-zinc-500">Date: {slot.date}</p>
                          </div>
                        </div>

                        <div>
                          {slot.isFull ? (
                            <span className="text-[10px] uppercase font-bold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded">
                              Full (Cap reached)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                              {slot.remainingCapacity} slots left
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address & Contact */}
              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Delivery Address & Contact
                </label>

                <div>
                  <input
                    type="text"
                    placeholder="Apartment, Street address, City, ZIP code"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Recipient phone number (e.g. +1 555-0199)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Drop-off instructions (e.g., Leave by front porch door)"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Payment Mode (Sandbox Test Mode) */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Payment Method (Sandbox Test Mode)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Sandbox Card")}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                      paymentMethod === "Sandbox Card"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    💳 Instant Test Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Cash / Pay on Delivery")}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                      paymentMethod === "Cash / Pay on Delivery"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    💵 Pay on Delivery
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  * Live stock is locked & decremented atomically on checkout confirmation.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === "success" && placedOrder && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-zinc-900 font-['Sora']">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  Order ID: {placedOrder.orderNumber}
                </p>
                <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto">
                  Your order is booked for <strong>{placedOrder.deliverySlot}</strong>. Our staff is preparing your fresh harvest items!
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Destination:</span>
                  <span className="font-semibold text-zinc-800">{placedOrder.deliveryAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Charged:</span>
                  <span className="font-extrabold text-emerald-800">${placedOrder.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Current Status:</span>
                  <span className="font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px]">
                    {placedOrder.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleClose();
                    setActiveTab("orders");
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Live Order Progress</span>
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-zinc-600 hover:text-zinc-900 text-xs font-semibold cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer / Summary & Actions */}
        {step !== "success" && cart.length > 0 && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/70 space-y-3">
            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Groceries Subtotal</span>
                <span className="font-semibold text-zinc-900">${cartSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery Fee</span>
                <span className="font-semibold text-zinc-900">
                  {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-200 text-sm font-bold text-zinc-900">
                <span>Total</span>
                <span className="text-emerald-800 font-['Sora']">${grandTotal}</span>
              </div>
            </div>

            {/* Buttons */}
            {step === "cart" ? (
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Select Delivery Slot & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("cart")}
                  className="px-4 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Validating Inventory & Placing Order...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm & Pay ${grandTotal}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
