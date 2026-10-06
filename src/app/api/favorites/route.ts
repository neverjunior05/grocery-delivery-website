import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, products, categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const list = await db
      .select({
        favoriteId: favorites.id,
        productId: products.id,
        name: products.name,
        price: products.price,
        unit: products.unit,
        imageUrl: products.imageUrl,
        stockQuantity: products.stockQuantity,
        inStock: products.inStock,
        badge: products.badge,
        categoryName: categories.name,
      })
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(favorites.userId, user.id));

    return NextResponse.json({ favorites: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req);
    if (error || !user) return error;

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const prodId = parseInt(productId, 10);
    const [existing] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.productId, prodId)))
      .limit(1);

    if (existing) {
      // Toggle off
      await db.delete(favorites).where(eq(favorites.id, existing.id));
      return NextResponse.json({ favorited: false, message: "Removed from favorites" });
    } else {
      // Toggle on
      await db.insert(favorites).values({
        userId: user.id,
        productId: prodId,
      });
      return NextResponse.json({ favorited: true, message: "Added to favorites" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update favorites" }, { status: 500 });
  }
}
