import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAuth(req, ["admin"]);
    if (error) return error;

    const { id } = await params;
    const catId = parseInt(id, 10);
    const body = await req.json();

    const [updated] = await db.update(categories).set({
      name: body.name,
      description: body.description,
      icon: body.icon,
      color: body.color,
    }).where(eq(categories.id, catId)).returning();

    return NextResponse.json({ category: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAuth(req, ["admin"]);
    if (error) return error;

    const { id } = await params;
    const catId = parseInt(id, 10);

    // Delete category (associated products will cascade or need reassignment)
    await db.delete(categories).where(eq(categories.id, catId));
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
