import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deliverySlots } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { asc, gte, sql } from "drizzle-orm";
import { getDeliverySlotsData } from "@/db/seed";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    let list = await db.select().from(deliverySlots).orderBy(asc(deliverySlots.date), asc(deliverySlots.id));

    // If slots are completely empty, auto-seed defaults
    if (list.length === 0) {
      const defaultSlots = getDeliverySlotsData();
      for (const s of defaultSlots) {
        await db.insert(deliverySlots).values(s);
      }
      list = await db.select().from(deliverySlots).orderBy(asc(deliverySlots.date), asc(deliverySlots.id));
    }

    if (date) {
      list = list.filter((s) => s.date === date);
    }

    // Augment with availability status
    const augmented = list.map((slot) => {
      const isFull = slot.bookedCount >= slot.maxCapacity;
      const remainingCapacity = Math.max(0, slot.maxCapacity - slot.bookedCount);
      return {
        ...slot,
        isFull,
        remainingCapacity,
        statusText: isFull ? "Full" : `${remainingCapacity} slots left`,
      };
    });

    return NextResponse.json({ slots: augmented });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch delivery slots" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAuth(req, ["admin"]);
    if (error) return error;

    const body = await req.json();
    const { date, timeWindow, maxCapacity = 20 } = body;

    if (!date || !timeWindow) {
      return NextResponse.json({ error: "Date and time window are required" }, { status: 400 });
    }

    const [newSlot] = await db.insert(deliverySlots).values({
      date,
      timeWindow,
      maxCapacity: parseInt(maxCapacity, 10),
      bookedCount: 0,
    }).returning();

    return NextResponse.json({ slot: newSlot });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create delivery slot" }, { status: 500 });
  }
}
