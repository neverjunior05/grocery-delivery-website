"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Truck, CheckCircle2, Clock, MapPin, Phone, RefreshCw, AlertCircle, User } from "lucide-react";

export default function DeliveryQueueView() {
  const { user } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "packed" | "out">("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchQueue = async () => {
    try {
      // For staff, GET /api/orders returns assigned or actionable orders
      const res = await fetch("/api/orders?scope=assigned");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Queue fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus,
          assignedStaffId: user?.id,
          assignedStaffName: user?.name,
          note: `Delivery staff ${user?.name} updated status to ${newStatus}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update order status");
      } else {
        await fetchQueue();
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "packed") return o.status === "Packed";
    if (filter === "out") return o.status === "Out for Delivery";
    return o.status !== "Delivered" && o.status !== "Cancelled";
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-600 text-white p-2 rounded-xl">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-amber-950 font-['Sora']">
                Delivery Staff Queue
              </h1>
              <p className="text-xs text-amber-800">
                Logged in as <strong>{user?.name}</strong> • Transition orders safely: Packed → Out for Delivery → Delivered
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchQueue}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Queue</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            filter === "all"
              ? "bg-amber-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Active Deliveries ({orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length})
        </button>
        <button
          onClick={() => setFilter("packed")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            filter === "packed"
              ? "bg-amber-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Ready to Pick Up ({orders.filter((o) => o.status === "Packed").length})
        </button>
        <button
          onClick={() => setFilter("out")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            filter === "out"
              ? "bg-amber-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          En Route ({orders.filter((o) => o.status === "Out for Delivery").length})
        </button>
      </div>

      {/* Orders Queue Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-zinc-800">All caught up!</h3>
          <p className="text-xs text-zinc-500 mt-1">
            There are currently no active deliveries waiting for pickup or drop-off in your queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((ord) => {
            const isUpdating = updatingId === ord.id;
            const items = (ord.items as any[]) || [];

            return (
              <div
                key={ord.id}
                className="bg-white border border-zinc-200 hover:border-amber-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-zinc-900">
                        {ord.orderNumber}
                      </span>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Slot: {ord.deliverySlot}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                        ord.status === "Packed"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  {/* Customer and address */}
                  <div className="mt-3 p-3 bg-zinc-50 rounded-xl space-y-1 text-xs">
                    <p className="font-bold text-zinc-900 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      {ord.customerName}
                    </p>
                    <p className="text-zinc-600 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {ord.customerPhone}
                    </p>
                    <p className="text-zinc-700 font-medium flex items-start gap-1 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{ord.deliveryAddress}</span>
                    </p>
                    {ord.customerNotes && (
                      <p className="text-[11px] text-zinc-500 italic pt-1 border-t border-zinc-200/60">
                        Note: "{ord.customerNotes}"
                      </p>
                    )}
                  </div>

                  {/* Groceries Checklist preview */}
                  <div className="mt-3">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                      Items in Order ({items.length})
                    </p>
                    <div className="text-xs text-zinc-600 space-y-1">
                      {items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="truncate pr-2">
                            • {item.quantity}x {item.name}
                          </span>
                          <span className="text-zinc-400 font-mono text-[11px]">{item.unit}</span>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-[11px] text-zinc-400 italic">
                          + {items.length - 3} more grocery items...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status action buttons enforced by strict state machine */}
                <div className="pt-3 border-t border-zinc-100">
                  {ord.status === "Packed" && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "Out for Delivery")}
                      disabled={isUpdating}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{isUpdating ? "Updating..." : "Start Delivery (Out for Delivery)"}</span>
                    </button>
                  )}

                  {ord.status === "Out for Delivery" && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "Delivered")}
                      disabled={isUpdating}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isUpdating ? "Confirming..." : "Confirm Handover (Delivered)"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
