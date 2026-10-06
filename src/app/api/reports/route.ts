import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req, ["admin"]);
    if (error || !user) return error;

    // 1. Total revenue & orders count
    const [stats] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.status} != 'Cancelled' THEN ${orders.total}::numeric ELSE 0 END), 0)`,
        totalOrders: sql<number>`COUNT(*)`,
        completedOrders: sql<number>`COUNT(CASE WHEN ${orders.status} = 'Delivered' THEN 1 END)`,
        pendingOrders: sql<number>`COUNT(CASE WHEN ${orders.status} IN ('Placed', 'Packed', 'Out for Delivery') THEN 1 END)`,
        cancelledOrders: sql<number>`COUNT(CASE WHEN ${orders.status} = 'Cancelled' THEN 1 END)`,
      })
      .from(orders);

    // 2. Low-stock inventory items
    const lowStockItems = await db
      .select({
        id: products.id,
        name: products.name,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        price: products.price,
        unit: products.unit,
      })
      .from(products)
      .where(sql`${products.stockQuantity} <= ${products.lowStockThreshold}`)
      .orderBy(products.stockQuantity);

    // 3. Best-selling items (derived from order items JSON)
    const allCompletedOrders = await db
      .select({ items: orders.items })
      .from(orders)
      .where(sql`${orders.status} != 'Cancelled'`);

    const productSalesMap = new Map<number, { name: string; quantity: number; revenue: number }>();

    for (const ord of allCompletedOrders) {
      const items = (ord.items as any[]) || [];
      for (const item of items) {
        const id = item.productId;
        const current = productSalesMap.get(id) || { name: item.name, quantity: 0, revenue: 0 };
        current.quantity += parseInt(item.quantity, 10);
        current.revenue += parseFloat(item.subtotal || 0);
        productSalesMap.set(id, current);
      }
    }

    const bestSellers = Array.from(productSalesMap.entries())
      .map(([id, data]) => ({
        productId: id,
        name: data.name,
        quantity: data.quantity,
        revenue: data.revenue.toFixed(2),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 4. Delivery staff list for quick assignment
    const deliveryStaff = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
      })
      .from(users)
      .where(sql`${users.role} = 'delivery'`);

    return NextResponse.json({
      revenue: parseFloat(stats?.totalRevenue || "0").toFixed(2),
      totalOrders: Number(stats?.totalOrders || 0),
      completedOrders: Number(stats?.completedOrders || 0),
      pendingOrders: Number(stats?.pendingOrders || 0),
      cancelledOrders: Number(stats?.cancelledOrders || 0),
      lowStockItems,
      bestSellers,
      deliveryStaff,
    });
  } catch (error: any) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate reports" }, { status: 500 });
  }
}
