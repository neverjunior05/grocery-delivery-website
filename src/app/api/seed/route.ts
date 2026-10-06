import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database reseeded successfully with 28+ grocery items and accounts!" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database reseeded successfully with 28+ grocery items and accounts!" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed" }, { status: 500 });
  }
}
