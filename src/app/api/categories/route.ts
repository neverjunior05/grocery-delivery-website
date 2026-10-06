import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(categories).orderBy(asc(categories.name));
    return NextResponse.json({ categories: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth(req, ["admin"]);
    if (error) return error;

    const body = await req.json();
    const { name, slug, description, icon, color } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Category name and slug are required" }, { status: 400 });
    }

    const [category] = await db.insert(categories).values({
      name: name.trim(),
      slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
      description: description || null,
      icon: icon || "Tag",
      color: color || "#059669",
    }).returning();

    return NextResponse.json({ category, message: "Category created successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
