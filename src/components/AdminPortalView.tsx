"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShieldCheck,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Clock,
  Filter,
} from "lucide-react";

export default function AdminPortalView() {
  const { user } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<"inventory" | "orders" | "reports" | "slots">("inventory");
  const [productsList, setProductsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [slotsList, setSlotsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Add/Edit Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    categoryId: 1,
    price: "",
    unit: "per kg",
    stockQuantity: 20,
    lowStockThreshold: 10,
    description: "",
    imageUrl: "",
    badge: "",
    isFeatured: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, repRes, slotRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/reports"),
        fetch("/api/delivery-slots"),
        fetch("/api/categories"),
      ]);

      if (prodRes.ok) setProductsList((await prodRes.json()).products || []);
      if (ordRes.ok) setOrdersList((await ordRes.json()).orders || []);
      if (repRes.ok) setReports(await repRes.json());
      if (slotRes.ok) {
        const slotData = await slotRes.json();
        setSlotsList(slotData.slots || []);
      }
      if (catRes.ok) setCategoriesList((await catRes.json()).categories || []);
    } catch (e) {
      console.error("Admin data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save product");
      } else {
        setShowProductModal(false);
        setEditingProduct(null);
        await fetchData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this grocery item?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      alert("Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus,
          note: `Admin status override to ${newStatus}`,
        }),
      });
      if (res.ok) {
        await fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Transition rejected");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAssignCourier = async (orderId: number, staffId: number, staffName: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedStaffId: staffId,
          assignedStaffName: staffName,
          note: `Assigned courier to ${staffName}`,
        }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      categoryId: p.categoryId,
      price: p.price,
      unit: p.unit,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold || 10,
      description: p.description,
      imageUrl: p.imageUrl,
      badge: p.badge || "",
      isFeatured: Boolean(p.isFeatured),
    });
    setShowProductModal(true);
  };

  const openNewModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      categoryId: categoriesList[0]?.id || 1,
      price: "3.99",
      unit: "per kg",
      stockQuantity: 25,
      lowStockThreshold: 10,
      description: "",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      badge: "Fresh Pick",
      isFeatured: false,
    });
    setShowProductModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-800 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </span>
            <div>
              <h1 className="text-xl font-bold font-['Sora']">Grocery Admin & Store Control</h1>
              <p className="text-xs text-emerald-200">
                Manage grocery catalog, inspect low-stock thresholds, assign delivery couriers, and track reports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-800/80 hover:bg-emerald-800 rounded-xl text-xs font-bold text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Grocery Item</span>
          </button>
        </div>
      </div>

      {/* Reports Summary Bar */}
      {reports && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
              Total Grocery Revenue
            </span>
            <p className="text-2xl font-black text-emerald-700 font-['Sora'] mt-1">
              ${reports.revenue}
            </p>
            <span className="text-[11px] text-zinc-400">Excluding cancelled orders</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
              Total Orders
            </span>
            <p className="text-2xl font-black text-zinc-900 font-['Sora'] mt-1">
              {reports.totalOrders}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">
              {reports.completedOrders} Delivered • {reports.pendingOrders} Active
            </span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
              Low-Stock Alerts
            </span>
            <p className="text-2xl font-black text-amber-600 font-['Sora'] mt-1">
              {reports.lowStockItems?.length || 0}
            </p>
            <span className="text-[11px] text-amber-700 font-medium">Under restock threshold</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
              Delivery Staff Active
            </span>
            <p className="text-2xl font-black text-zinc-800 font-['Sora'] mt-1">
              {reports.deliveryStaff?.length || 0}
            </p>
            <span className="text-[11px] text-zinc-400">Ready for dispatch</span>
          </div>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex border-b border-zinc-200 mb-6 gap-2">
        <button
          onClick={() => setActiveSubTab("inventory")}
          className={`py-2 px-4 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeSubTab === "inventory"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Product Inventory ({productsList.length})
        </button>
        <button
          onClick={() => setActiveSubTab("orders")}
          className={`py-2 px-4 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeSubTab === "orders"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          All Customer Orders ({ordersList.length})
        </button>
        <button
          onClick={() => setActiveSubTab("slots")}
          className={`py-2 px-4 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeSubTab === "slots"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Delivery Slot Capacity ({slotsList.length})
        </button>
        <button
          onClick={() => setActiveSubTab("reports")}
          className={`py-2 px-4 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeSubTab === "reports"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Sales & Best-Sellers
        </button>
      </div>

      {/* SUB-TAB 1: PRODUCT INVENTORY */}
      {activeSubTab === "inventory" && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 uppercase font-bold border-b border-zinc-200">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price / Unit</th>
                    <th className="p-3">Stock Level</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {productsList.map((prod) => {
                    const isLow = prod.stockQuantity <= prod.lowStockThreshold;
                    const isOut = prod.stockQuantity <= 0;

                    return (
                      <tr key={prod.id} className="hover:bg-zinc-50 transition">
                        <td className="p-3 flex items-center space-x-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg bg-zinc-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-zinc-900">{prod.name}</p>
                            {prod.badge && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                                {prod.badge}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-zinc-600 font-medium">
                          {prod.categoryName || "Grocery"}
                        </td>

                        <td className="p-3">
                          <span className="font-bold text-zinc-900">${prod.price}</span>
                          <span className="text-zinc-500 text-[11px]"> / {prod.unit}</span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-black ${
                                isOut
                                  ? "text-rose-600"
                                  : isLow
                                  ? "text-amber-600 font-bold"
                                  : "text-zinc-900"
                              }`}
                            >
                              {prod.stockQuantity} units
                            </span>
                            {isLow && !isOut && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                Low
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            (Min: {prod.lowStockThreshold})
                          </span>
                        </td>

                        <td className="p-3">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              isOut
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isOut ? "Out of Stock" : "In Stock"}
                          </span>
                        </td>

                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 hover:bg-zinc-200 text-zinc-700 rounded-lg transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ALL ORDERS & DISPATCH */}
      {activeSubTab === "orders" && (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 uppercase font-bold border-b border-zinc-200">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer & Slot</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Courier Assigned</th>
                  <th className="p-3 text-right">Progress Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {ordersList.map((ord) => {
                  return (
                    <tr key={ord.id} className="hover:bg-zinc-50 transition">
                      <td className="p-3">
                        <p className="font-extrabold text-zinc-900">{ord.orderNumber}</p>
                        <p className="text-[11px] text-zinc-400">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-zinc-900">{ord.customerName}</p>
                        <p className="text-[11px] text-zinc-500 truncate max-w-xs">{ord.deliveryAddress}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold">{ord.deliverySlot}</p>
                      </td>

                      <td className="p-3 font-extrabold text-zinc-900 font-['Sora']">
                        ${ord.total}
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            ord.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "Cancelled"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <select
                          value={ord.assignedStaffId || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const found = reports?.deliveryStaff?.find((s: any) => s.id === parseInt(val, 10));
                              handleAssignCourier(ord.id, parseInt(val, 10), found?.name || "Staff");
                            }
                          }}
                          className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 focus:border-emerald-600 outline-none"
                        >
                          <option value="">-- Assign Rider --</option>
                          {reports?.deliveryStaff?.map((st: any) => (
                            <option key={st.id} value={st.id}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-3 text-right">
                        {ord.status === "Placed" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, "Packed")}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Mark Packed
                          </button>
                        )}
                        {ord.status === "Packed" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, "Out for Delivery")}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Dispatch (Out)
                          </button>
                        )}
                        {ord.status === "Out for Delivery" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, "Delivered")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {ord.status === "Delivered" && (
                          <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                        {ord.status === "Cancelled" && (
                          <span className="text-rose-600 font-semibold flex items-center justify-end gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DELIVERY SLOTS CAPACITY */}
      {activeSubTab === "slots" && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900">
            <strong>Capacity Management:</strong> Each delivery slot caps the maximum allowable concurrent orders to prevent courier overload. Slots automatically lock when booked count reaches the maximum limit.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slotsList.map((slot) => {
              const pct = Math.min(100, Math.round((slot.bookedCount / slot.maxCapacity) * 100));

              return (
                <div key={slot.id} className="p-4 bg-white border border-zinc-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{slot.timeWindow}</h4>
                      <p className="text-xs text-zinc-500">Date: {slot.date}</p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        slot.isFull
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {slot.statusText}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>Booked: {slot.bookedCount} / {slot.maxCapacity}</span>
                      <span>{pct}% Capacity</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          pct >= 90 ? "bg-rose-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: REPORTS & BEST-SELLERS */}
      {activeSubTab === "reports" && reports && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Sellers */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Top Selling Grocery Staples
            </h3>

            {reports.bestSellers?.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">No completed sales recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {reports.bestSellers.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-zinc-900">{item.name}</p>
                        <p className="text-zinc-500 text-[11px]">{item.quantity} units sold</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-800 font-['Sora']">
                      ${item.revenue}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Inventory Low-Stock Thresholds
            </h3>

            {reports.lowStockItems?.length === 0 ? (
              <p className="text-xs text-emerald-700 py-6 text-center font-medium">
                ✅ All inventory levels are above restock safety buffers!
              </p>
            ) : (
              <div className="space-y-2">
                {reports.lowStockItems.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs"
                  >
                    <div>
                      <p className="font-bold text-zinc-900">{prod.name}</p>
                      <p className="text-amber-800 text-[11px]">
                        Remaining: <strong>{prod.stockQuantity}</strong> (Threshold: {prod.lowStockThreshold})
                      </p>
                    </div>

                    <button
                      onClick={() => openEditModal(prod)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-zinc-900 font-['Sora']">
              {editingProduct ? "Edit Grocery Item" : "Add New Grocery Item"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Organic Honeycrisp Apples"
                  className="w-full p-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: parseInt(e.target.value, 10) })}
                    className="w-full p-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-600"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full p-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="per kg, 500g, dozen"
                    className="w-full p-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: parseInt(e.target.value, 10) })}
                    className="w-full p-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Low-Stock Alert</label>
                  <input
                    type="number"
                    value={productForm.lowStockThreshold}
                    onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: parseInt(e.target.value, 10) })}
                    className="w-full p-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="Organic, Fresh Pick, Bestseller"
                    className="w-full p-2 border border-zinc-200 rounded-lg outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="pt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featuredCheck"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <label htmlFor="featuredCheck" className="font-semibold text-zinc-800">
                    Feature on Home page
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
