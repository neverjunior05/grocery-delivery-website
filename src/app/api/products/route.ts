import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, like, and, gte, lte, or, sql, desc, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const inStockOnly = searchParams.get("inStock") === "true";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "featured"; // featured, price-asc, price-desc, name-asc
    const lowStockAlert = searchParams.get("lowStock") === "true";

    const conditions = [];

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${products.name}) LIKE ${q}`,
          sql`LOWER(${products.description}) LIKE ${q}`
        )
      );
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, parseInt(categoryId, 10)));
    }

    if (inStockOnly) {
      conditions.push(sql`${products.stockQuantity} > 0`);
    }

    if (lowStockAlert) {
      conditions.push(sql`${products.stockQuantity} <= ${products.lowStockThreshold}`);
    }

    if (minPrice) {
      conditions.push(gte(products.price, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(products.price, maxPrice));
    }

    // Join with categories to retrieve category name and slug
    let query = db
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
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (categorySlug) {
      conditions.push(eq(categories.slug, categorySlug));
    }

    let finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;

    // Sorting
    if (sort === "price-asc") {
      finalQuery = finalQuery.orderBy(asc(products.price)) as any;
    } else if (sort === "price-desc") {
      finalQuery = finalQuery.orderBy(desc(products.price)) as any;
    } else if (sort === "name-asc") {
      finalQuery = finalQuery.orderBy(asc(products.name)) as any;
    } else {
      finalQuery = finalQuery.orderBy(desc(products.isFeatured), desc(products.id)) as any;
    }

    const items = await finalQuery;

    // Computed flag: inStock sync
    const itemsWithStock = items.map((item) => ({
      ...item,
      inStock: item.stockQuantity > 0,
      isLowStock: item.stockQuantity <= item.lowStockThreshold && item.stockQuantity > 0,
    }));

    return NextResponse.json({ products: itemsWithStock });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req, ["admin"]);
    if (error) return error;

    const body = await req.json();
    const {
      name,
      categoryId,
      price,
      unit,
      stockQuantity,
      lowStockThreshold = 10,
      description,
      imageUrl,
      badge,
      isFeatured = false,
    } = body;

    if (!name || !categoryId || !price || !unit || !imageUrl) {
      return NextResponse.json({ error: "Name, category, price, unit and image URL are required" }, { status: 400 });
    }

    const parsedStock = parseInt(stockQuantity || 0, 10);
    const parsedThreshold = parseInt(lowStockThreshold || 10, 10);

    const [newProduct] = await db.insert(products).values({
      name: name.trim(),
      categoryId: parseInt(categoryId, 10),
      price: parseFloat(price).toFixed(2),
      unit: unit.trim(),
      stockQuantity: parsedStock,
      lowStockThreshold: parsedThreshold,
      description: description || "",
      imageUrl: imageUrl.trim(),
      badge: badge ? badge.trim() : null,
      isFeatured: Boolean(isFeatured),
      inStock: parsedStock > 0,
    }).returning();

    return NextResponse.json({ product: newProduct, message: "Product created successfully" });
  } catch (error: any) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
