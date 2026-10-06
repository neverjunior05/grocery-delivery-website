import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ user: null });
    }

    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      address: users.address,
    }).from(users).where(eq(users.id, authUser.id)).limit(1);

    return NextResponse.json({ user: user || null });
  } catch (error: any) {
    return NextResponse.json({ user: null });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address } = body;

    const [updated] = await db.update(users).set({
      name: name || undefined,
      phone: phone !== undefined ? phone : undefined,
      address: address !== undefined ? address : undefined,
      updatedAt: new Date(),
    }).where(eq(users.id, authUser.id)).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      address: users.address,
    });

    return NextResponse.json({ user: updated, message: "Profile updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
