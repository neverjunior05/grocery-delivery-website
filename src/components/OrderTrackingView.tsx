"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Calendar,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function OrderTrackingView() {
  const { user, quickReorder, setActiveTab } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [reordering, setReordering] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.orders?.length > 0 && !selectedOrder) {
          setSelectedOrder(data.orders[0]);
        }
      }
    } catch (e) {
      console.error("Orders fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Simulate live tracking with auto-poll every 6 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 6000);
    return () => clearInterval(interval);
  }, [user]);

  const handleReorder = async (orderId: number) => {
    setReordering(orderId);
    setFeedback(null);
    const res = await quickReorder(orderId);
    setFeedback(res.message);
    setReordering(null);
  };

  const statusSteps = [
    { key: "Placed", label: "Order Placed", desc: "Received at grocery depot" },
    { key: "Packed", label: "Packed & Chilled", desc: "Fresh items bagged carefully" },
    { key: "Out for Delivery", label: "Out for Delivery", desc: "Courier on the way" },
    { key: "Delivered", label: "Delivered", desc: "Delivered to your doorstep" },
  ];

  const getStepIndex = (status: string) => {
    if (status === "Cancelled") return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 font-['Sora']">
          Track Your Grocery Deliveries
        </h2>
        <p className="text-xs text-zinc-500 mt-2">
          Please log in or register to inspect live status timelines and quickly reorder past grocery staples.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
        <p className="text-sm font-semibold text-zinc-600">Loading order timeline...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 font-['Sora'] flex items-center gap-2">
            <span>Orders & Live Tracking</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Live DB Polling
            </span>
          </h1>
          <p className="text-xs text-zinc-500">
            Monitor packing, dispatch, and courier milestones in real-time.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-bold self-start cursor-pointer transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Refresh Now</span>
        </button>
      </div>

      {feedback && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 font-['Sora']">No orders placed yet</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Explore our fresh produce, artisan bread, farm dairy, and premium cuts to place your first grocery delivery order!
          </p>
          <button
            onClick={() => setActiveTab("shop")}
            className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Start Fresh Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Order History List */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Past Orders ({orders.length})
            </h2>

            {orders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              const isCancelled = ord.status === "Cancelled";
              const isDelivered = ord.status === "Delivered";

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-600/15"
                      : "bg-white border-zinc-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-900">{ord.orderNumber}</span>
                      <p className="text-[11px] text-zinc-500">
                        {new Date(ord.createdAt).toLocaleDateString()} at{" "}
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : isCancelled
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800 animate-pulse"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-zinc-600">
                      {(ord.items as any[])?.length || 0} grocery items • <strong>${ord.total}</strong>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorder(ord.id);
                      }}
                      disabled={reordering === ord.id}
                      className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200 px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer"
                      title="1-Click Reorder all items from this order into your cart"
                    >
                      <RotateCcw className={`w-3 h-3 ${reordering === ord.id ? "animate-spin" : ""}`} />
                      <span>{reordering === ord.id ? "Adding..." : "1-Click Reorder"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Live Status Timeline & Order Deep Dive */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Order Header Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-zinc-900 font-['Sora']">
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        selectedOrder.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : selectedOrder.status === "Cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Slot: <strong className="text-zinc-700">{selectedOrder.deliverySlot}</strong>
                  </p>
                </div>

                <button
                  onClick={() => handleReorder(selectedOrder.id)}
                  disabled={reordering === selectedOrder.id}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer self-start"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${reordering === selectedOrder.id ? "animate-spin" : ""}`} />
                  <span>Reorder These Items</span>
                </button>
              </div>

              {/* Status Timeline */}
              {selectedOrder.status === "Cancelled" ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <p className="font-bold">This grocery order was cancelled.</p>
                    <p className="text-rose-600 mt-0.5">Inventory has been returned to available store stock.</p>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-6">
                    Live Delivery Status Progression
                  </h3>

                  <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getStepIndex(selectedOrder.status);
                      const isCompleted = currentIndex > index;
                      const isCurrent = currentIndex === index;
                      const isUpcoming = currentIndex < index;

                      return (
                        <div key={step.key} className="relative flex items-start space-x-4">
                          {/* Dot / Indicator */}
                          <div
                            className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                              isCompleted
                                ? "bg-emerald-600"
                                : isCurrent
                                ? "bg-amber-500 ring-4 ring-amber-100 animate-pulse"
                                : "bg-zinc-300 text-zinc-500"
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4
                                className={`text-sm font-bold ${
                                  isCompleted
                                    ? "text-emerald-900"
                                    : isCurrent
                                    ? "text-amber-800 font-extrabold"
                                    : "text-zinc-400"
                                }`}
                              >
                                {step.label}
                              </h4>
                              {isCurrent && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
                                  Current Milestone
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Details & Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-xs">
                <div>
                  <span className="text-zinc-500 font-semibold block mb-1">Destination Address</span>
                  <p className="font-bold text-zinc-900">{selectedOrder.deliveryAddress}</p>
                  <p className="text-zinc-600 mt-1">Recipient: {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
                  {selectedOrder.customerNotes && (
                    <p className="text-zinc-500 italic mt-1">Notes: "{selectedOrder.customerNotes}"</p>
                  )}
                </div>

                <div>
                  <span className="text-zinc-500 font-semibold block mb-1">Assigned Delivery Courier</span>
                  <p className="font-bold text-zinc-900">
                    {selectedOrder.assignedStaffName || "Depot dispatch pending"}
                  </p>
                  <p className="text-zinc-600 mt-1">Payment: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
                  <p className="text-zinc-600">Subtotal: ${selectedOrder.subtotal} | Fee: ${selectedOrder.deliveryFee}</p>
                  <p className="text-emerald-800 font-extrabold mt-1 text-sm font-['Sora']">
                    Total: ${selectedOrder.total}
                  </p>
                </div>
              </div>

              {/* Ordered Products breakdown */}
              <div>
                <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">
                  Packed Groceries ({(selectedOrder.items as any[])?.length || 0})
                </h4>
                <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl overflow-hidden">
                  {(selectedOrder.items as any[])?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white text-xs">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg bg-zinc-50 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-zinc-900">{item.name}</p>
                          <p className="text-zinc-500 text-[11px]">
                            ${item.price} / {item.unit} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-zinc-900">${item.subtotal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Audit Log */}
              {selectedOrder.statusHistory && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Audit Event History
                  </h4>
                  <div className="space-y-1.5 text-[11px] text-zinc-600">
                    {(selectedOrder.statusHistory as any[]).map((h: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-zinc-50">
                        <span className="font-semibold text-zinc-800">
                          {h.status}: {h.note}
                        </span>
                        <span className="text-zinc-400">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                          ({h.updatedBy || "System"})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
