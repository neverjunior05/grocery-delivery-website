import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, signToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = "customer", phone, address } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    // Role validation: default to customer, or allow delivery/admin if explicitly authorized
    const allowedRoles = ["customer", "delivery", "admin"];
    const userRole = allowedRoles.includes(role) ? role : "customer";

    const passwordHash = await hashPassword(password);
    const [newUser] = await db.insert(users).values({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: userRole,
      phone: phone || null,
      address: address || null,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      address: users.address,
    });

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as "customer" | "delivery" | "admin",
    });

    const response = NextResponse.json({
      user: newUser,
      token,
      message: "Registration successful"
    });

    response.cookies.set("grocery_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}
