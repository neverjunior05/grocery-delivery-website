import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, cartItems } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/orders/[id]/reorder
 *
 * Key Business Logic:
 * Reorder pulling a past order's items and re-adding them to the current user's cart,
 * gracefully skipping any items that are now out of stock or discontinued,
 * with a clear message about what couldn't be re-added or if quantities were capped.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error, user } = await requireAuth(req, ["customer", "admin"]);
    if (error || !user) return error;

    const { id } = await params;
    const orderId = parseInt(id, 10);

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (user.role === "customer" && order.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const pastItems = (order.items as any[]) || [];
    if (pastItems.length === 0) {
      return NextResponse.json({ error: "No items found in this past order" }, { status: 400 });
    }

    const addedItems: string[] = [];
    const skippedItems: string[] = [];
    const adjustedItems: string[] = [];

    for (const item of pastItems) {
      const prodId = parseInt(item.productId, 10);
      const requestedQty = parseInt(item.quantity, 10);

      // Check current live product info
      const [product] = await db.select().from(products).where(eq(products.id, prodId)).limit(1);

      if (!product) {
        skippedItems.push(`"${item.name}" (discontinued)`);
        continue;
      }

      if (product.stockQuantity <= 0) {
        skippedItems.push(`"${product.name}" (currently out of stock)`);
        continue;
      }

      // Check if user already has this in cart
      const [existingInCart] = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, prodId)))
        .limit(1);

      const targetQty = (existingInCart?.quantity || 0) + requestedQty;
      const finalQty = Math.min(targetQty, product.stockQuantity);

      if (finalQty < targetQty) {
        adjustedItems.push(`"${product.name}" (capped at remaining stock: ${product.stockQuantity})`);
      }

      if (existingInCart) {
        await db
          .update(cartItems)
          .set({ quantity: finalQty, updatedAt: new Date() })
          .where(eq(cartItems.id, existingInCart.id));
      } else {
        await db.insert(cartItems).values({
          userId: user.id,
          productId: prodId,
          quantity: finalQty,
        });
      }

      addedItems.push(`${product.name} (x${finalQty})`);
    }

    let summaryMessage = `Reordered ${addedItems.length} item(s) to your cart.`;
    if (skippedItems.length > 0) {
      summaryMessage += ` Skipped: ${skippedItems.join(", ")}.`;
    }
    if (adjustedItems.length > 0) {
      summaryMessage += ` Adjusted: ${adjustedItems.join(", ")}.`;
    }

    return NextResponse.json({
      success: true,
      message: summaryMessage,
      addedCount: addedItems.length,
      skippedCount: skippedItems.length,
      skippedItems,
      adjustedItems,
    });
  } catch (error: any) {
    console.error("Reorder error:", error);
    return NextResponse.json({ error: error.message || "Failed to reorder items" }, { status: 500 });
  }
}
