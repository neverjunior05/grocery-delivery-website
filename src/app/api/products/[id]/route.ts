import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const prodId = parseInt(id, 10);

    const [item] = await db
      .select({
        id: products.id,
        name: products.name,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        price: products.price,
        unit: products.unit,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        description: products.description,
        imageUrl: products.imageUrl,
        inStock: products.inStock,
        isFeatured: products.isFeatured,
        badge: products.badge,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, prodId))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        ...item,
        inStock: item.stockQuantity > 0,
        isLowStock: item.stockQuantity <= item.lowStockThreshold && item.stockQuantity > 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAuth(req, ["admin"]);
    if (error) return error;

    const { id } = await params;
    const prodId = parseInt(id, 10);
    const body = await req.json();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.categoryId !== undefined) updateData.categoryId = parseInt(body.categoryId, 10);
    if (body.price !== undefined) updateData.price = parseFloat(body.price).toFixed(2);
    if (body.unit !== undefined) updateData.unit = body.unit.trim();
    if (body.stockQuantity !== undefined) {
      updateData.stockQuantity = parseInt(body.stockQuantity, 10);
      updateData.inStock = updateData.stockQuantity > 0;
    }
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(body.lowStockThreshold, 10);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl.trim();
    if (body.badge !== undefined) updateData.badge = body.badge ? body.badge.trim() : null;
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);

    const [updated] = await db.update(products).set(updateData).where(eq(products.id, prodId)).returning();

    return NextResponse.json({ product: updated, message: "Product updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAuth(req, ["admin"]);
    if (error) return error;

    const { id } = await params;
    const prodId = parseInt(id, 10);

    await db.delete(products).where(eq(products.id, prodId));
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
