import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, deliverySlots, cartItems } from "@/db/schema";
import { getUserFromRequest, requireAuth } from "@/lib/auth";
import { eq, desc, and, sql } from "drizzle-orm";

/**
 * Valid order status progression:
 * Placed -> Packed -> Out for Delivery -> Delivered
 * (Cancelled is allowed from Placed or Packed only)
 */
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  Placed: ["Packed", "Cancelled"],
  Packed: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

// GET /api/orders:
// - Customer gets their own orders
// - Delivery staff gets their assigned orders (or all if query all=true)
// - Admin gets all orders
export async function GET(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status");
    const scope = searchParams.get("scope"); // "assigned" for delivery staff queue

    let orderList;

    if (user.role === "admin") {
      if (filterStatus) {
        orderList = await db.select().from(orders).where(eq(orders.status, filterStatus)).orderBy(desc(orders.createdAt));
      } else {
        orderList = await db.select().from(orders).orderBy(desc(orders.createdAt));
      }
    } else if (user.role === "delivery") {
      if (scope === "assigned" || !searchParams.has("all")) {
        // Staff queue: either explicitly assigned to them OR ready for delivery
        orderList = await db
          .select()
          .from(orders)
          .where(
            sql`(${orders.assignedStaffId} = ${user.id} OR (${orders.status} IN ('Packed', 'Out for Delivery') AND ${orders.assignedStaffId} IS NULL))`
          )
          .orderBy(desc(orders.createdAt));
      } else {
        orderList = await db.select().from(orders).orderBy(desc(orders.createdAt));
      }
    } else {
      // Customer: own orders only
      orderList = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, user.id))
        .orderBy(desc(orders.createdAt));
    }

    return NextResponse.json({ orders: orderList });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders: Create new grocery order
// Key Business Logic:
// 1. Stock-aware ordering: Re-validate live inventory for every item before finalizing.
//    If any item's available stock < requested quantity, reject checkout with clear inventory feedback.
// 2. Delivery slot capacity: Cap the number of orders per delivery slot; fail if slot is full.
// 3. Decrement stock atomically.
// 4. Clear user's cart on success.
export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const body = await req.json();
    const {
      deliveryAddress,
      customerPhone,
      deliverySlotId,
      deliverySlotText,
      paymentMethod = "Sandbox Card",
      customerNotes = "",
      items: rawItems, // optional override or defaults to current cart
    } = body;

    if (!deliveryAddress || !customerPhone || (!deliverySlotId && !deliverySlotText)) {
      return NextResponse.json({ error: "Delivery address, contact phone, and delivery slot are required." }, { status: 400 });
    }

    // Step 1: Verify & Check Delivery Slot Capacity
    let slotText = deliverySlotText;
    let selectedSlotId: number | null = null;

    if (deliverySlotId) {
      selectedSlotId = parseInt(deliverySlotId, 10);
      const [slot] = await db.select().from(deliverySlots).where(eq(deliverySlots.id, selectedSlotId)).limit(1);
      if (!slot) {
        return NextResponse.json({ error: "The chosen delivery slot does not exist." }, { status: 400 });
      }

      if (slot.bookedCount >= slot.maxCapacity) {
        return NextResponse.json({
          error: `Delivery slot "${slot.timeWindow}" is fully booked! Please select another time window.`,
          slotFull: true
        }, { status: 400 });
      }
      slotText = `${slot.date} (${slot.timeWindow})`;
    }

    // Step 2: Determine items to purchase
    let itemsToProcess = rawItems;
    if (!itemsToProcess || itemsToProcess.length === 0) {
      // Pull from cart
      const cartRecords = await db
        .select({
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          productName: products.name,
          price: products.price,
          unit: products.unit,
          imageUrl: products.imageUrl,
          stockQuantity: products.stockQuantity,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, user.id));

      if (cartRecords.length === 0) {
        return NextResponse.json({ error: "Your cart is empty. Add grocery items before checkout." }, { status: 400 });
      }

      itemsToProcess = cartRecords.map((c) => ({
        productId: c.productId,
        quantity: c.quantity,
      }));
    }

    // Step 3: Critical Business Logic — Stock Re-validation
    // Verify each product's current stock at the instant of order placement to prevent overselling
    const finalOrderItems = [];
    let calculatedSubtotal = 0;
    const stockErrors: string[] = [];

    for (const item of itemsToProcess) {
      const prodId = parseInt(item.productId, 10);
      const qty = parseInt(item.quantity, 10);

      const [product] = await db.select().from(products).where(eq(products.id, prodId)).limit(1);

      if (!product) {
        stockErrors.push(`Item ID #${prodId} is no longer available.`);
        continue;
      }

      if (product.stockQuantity < qty) {
        stockErrors.push(
          `Insufficient stock for "${product.name}". Requested: ${qty}, Available: ${product.stockQuantity}.`
        );
        continue;
      }

      const itemPrice = parseFloat(product.price);
      const lineSubtotal = parseFloat((itemPrice * qty).toFixed(2));
      calculatedSubtotal += lineSubtotal;

      finalOrderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: qty,
        imageUrl: product.imageUrl,
        subtotal: lineSubtotal.toFixed(2),
      });
    }

    if (stockErrors.length > 0) {
      return NextResponse.json({
        error: "Stock availability has changed. Please adjust your order.",
        stockErrors,
      }, { status: 409 });
    }

    // Step 4: Calculate fees & total
    const deliveryFee = calculatedSubtotal >= 35 ? "0.00" : "3.99"; // Free delivery above $35
    const totalAmount = (calculatedSubtotal + parseFloat(deliveryFee)).toFixed(2);

    // Generate readable order number: FH-XXXX-YYYY
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `FH-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    const initialHistory = [
      {
        status: "Placed",
        timestamp: new Date().toISOString(),
        note: "Order confirmed and sent to store for packing.",
        updatedBy: user.name,
      },
    ];

    // Step 5: Insert Order
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone,
      deliveryAddress,
      deliverySlot: slotText || "Standard Next Delivery",
      slotId: selectedSlotId,
      status: "Placed",
      subtotal: calculatedSubtotal.toFixed(2),
      deliveryFee,
      discount: "0.00",
      total: totalAmount,
      paymentMethod,
      paymentStatus: "Paid",
      items: finalOrderItems,
      statusHistory: initialHistory,
      customerNotes,
    }).returning();

    // Step 6: Atomically decrement product stock & update inStock flag
    for (const item of finalOrderItems) {
      await db.update(products).set({
        stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
        inStock: sql`CASE WHEN (${products.stockQuantity} - ${item.quantity}) > 0 THEN true ELSE false END`,
        updatedAt: new Date(),
      }).where(eq(products.id, item.productId));
    }

    // Step 7: Increment delivery slot booked count
    if (selectedSlotId) {
      await db.update(deliverySlots).set({
        bookedCount: sql`${deliverySlots.bookedCount} + 1`,
      }).where(eq(deliverySlots.id, selectedSlotId));
    }

    // Step 8: Clear customer's cart
    await db.delete(cartItems).where(eq(cartItems.userId, user.id));

    return NextResponse.json({
      order: newOrder,
      message: "Order placed successfully!",
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 500 });
  }
}
