import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "freshharvest-grocery-delivery-jwt-secret-key-2025";

export interface TokenPayload {
  id: number;
  email: string;
  name: string;
  role: "customer" | "delivery" | "admin";
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserFromRequest(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get("authorization");
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // Also support cookies
    const cookieToken = req.cookies.get("grocery_token")?.value;
    if (cookieToken) token = cookieToken;
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(req: NextRequest, allowedRoles?: Array<"customer" | "delivery" | "admin">) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 }), user: null };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { 
      error: NextResponse.json({ error: "Forbidden: You do not have permission to access this resource" }, { status: 403 }), 
      user: null 
    };
  }

  return { error: null, user };
}
