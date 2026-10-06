import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, deliverySlots } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { VALID_STATUS_TRANSITIONS } from "../route";

// GET /api/orders/[id]: View order details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const { id } = await params;
    const orderId = parseInt(id, 10);

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization: customer can only view own order, staff and admin can view
    if (user.role === "customer" && order.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/orders/[id]: Update order status or assign delivery staff
// Enforces state machine: Placed -> Packed -> Out for Delivery -> Delivered (or Cancelled)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error, user } = await requireAuth(req, ["admin", "delivery"]);
    if (error || !user) return error;

    const { id } = await params;
    const orderId = parseInt(id, 10);
    const body = await req.json();
    const { newStatus, assignedStaffId, assignedStaffName, note } = body;

    const [currentOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date(),
    };

    const currentHistory = (currentOrder.statusHistory as any[]) || [];

    // State machine status transition validation
    if (newStatus && newStatus !== currentOrder.status) {
      const allowedNext = VALID_STATUS_TRANSITIONS[currentOrder.status] || [];

      // Delivery staff can only transition: Packed -> Out for Delivery, or Out for Delivery -> Delivered
      if (user.role === "delivery") {
        const allowedStaffTransitions: Record<string, string[]> = {
          Packed: ["Out for Delivery"],
          "Out for Delivery": ["Delivered"],
        };
        const staffAllowed = allowedStaffTransitions[currentOrder.status] || [];
        if (!staffAllowed.includes(newStatus)) {
          return NextResponse.json({
            error: `As delivery staff, you cannot change status from "${currentOrder.status}" to "${newStatus}". Allowed: ${staffAllowed.join(", ") || "none"}`,
          }, { status: 400 });
        }
      } else if (user.role === "admin") {
        // Admin must adhere to valid transitions or cancellation
        if (!allowedNext.includes(newStatus)) {
          return NextResponse.json({
            error: `Invalid status transition from "${currentOrder.status}" to "${newStatus}". Allowed: ${allowedNext.join(", ") || "none"}`,
          }, { status: 400 });
        }
      }

      // If cancelling, restore product stock & decrement slot count
      if (newStatus === "Cancelled" && currentOrder.status !== "Cancelled") {
        const items = (currentOrder.items as any[]) || [];
        for (const it of items) {
          await db.update(products).set({
            stockQuantity: sql`${products.stockQuantity} + ${it.quantity}`,
            inStock: true,
          }).where(eq(products.id, it.productId));
        }

        if (currentOrder.slotId) {
          await db.update(deliverySlots).set({
            bookedCount: sql`GREATEST(0, ${deliverySlots.bookedCount} - 1)`,
          }).where(eq(deliverySlots.id, currentOrder.slotId));
        }
      }

      updates.status = newStatus;
      updates.statusHistory = [
        ...currentHistory,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: note || `Status updated to ${newStatus}`,
          updatedBy: `${user.name} (${user.role})`,
        },
      ];
    }

    // Assignment updates (Admin only or staff self-assignment)
    if (assignedStaffId !== undefined) {
      updates.assignedStaffId = assignedStaffId ? parseInt(assignedStaffId, 10) : null;
      updates.assignedStaffName = assignedStaffName || null;
    }

    const [updatedOrder] = await db.update(orders).set(updates).where(eq(orders.id, orderId)).returning();

    return NextResponse.json({
      order: updatedOrder,
      message: `Order #${updatedOrder.orderNumber} updated successfully.`,
    });
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}
