import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { cartItems, products, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/cart: Get logged-in user's cart items with current product stock info
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ items: [], subtotal: 0 });
    }

    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        productName: products.name,
        price: products.price,
        unit: products.unit,
        stockQuantity: products.stockQuantity,
        imageUrl: products.imageUrl,
        inStock: products.inStock,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, user.id));

    const enriched = items.map((item) => {
      const priceNum = parseFloat(item.price);
      const isAvailable = item.stockQuantity > 0;
      const isExceedingStock = item.quantity > item.stockQuantity;
      return {
        ...item,
        priceNumber: priceNum,
        lineTotal: (priceNum * item.quantity).toFixed(2),
        isAvailable,
        isExceedingStock,
      };
    });

    const subtotal = enriched.reduce((acc, curr) => acc + (curr.isAvailable ? parseFloat(curr.lineTotal) : 0), 0);

    return NextResponse.json({
      items: enriched,
      subtotal: subtotal.toFixed(2),
      itemCount: enriched.reduce((acc, curr) => acc + curr.quantity, 0),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch cart" }, { status: 500 });
  }
}

// POST /api/cart: Add or update item quantity in cart
export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const prodId = parseInt(productId, 10);
    const qty = Math.max(0, parseInt(quantity, 10));

    // Verify product exists and check stock
    const [product] = await db.select().from(products).where(eq(products.id, prodId)).limit(1);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (qty > 0 && product.stockQuantity <= 0) {
      return NextResponse.json({ error: `${product.name} is currently out of stock` }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, prodId)))
      .limit(1);

    if (qty === 0) {
      if (existing) {
        await db.delete(cartItems).where(eq(cartItems.id, existing.id));
      }
      return NextResponse.json({ message: "Item removed from cart", removed: true });
    }

    // Limit to available stock
    const finalQty = Math.min(qty, product.stockQuantity);

    if (existing) {
      await db
        .update(cartItems)
        .set({ quantity: finalQty, updatedAt: new Date() })
        .where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({
        userId: user.id,
        productId: prodId,
        quantity: finalQty,
      });
    }

    return NextResponse.json({
      message: "Cart updated successfully",
      productId: prodId,
      quantity: finalQty,
      productName: product.name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update cart" }, { status: 500 });
  }
}

// DELETE /api/cart: Clear entire cart
export async function DELETE(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    await db.delete(cartItems).where(eq(cartItems.userId, user.id));
    return NextResponse.json({ success: true, message: "Cart emptied" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to clear cart" }, { status: 500 });
  }
}
