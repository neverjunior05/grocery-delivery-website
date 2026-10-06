import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAuth(req, ["admin"]);
    if (error) return error;

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid image format. Supported formats: JPG, PNG, WEBP." }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds maximum size limit of 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public uploads
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    // In Next.js App Router, ensure directory exists or save
    const path = join(uploadDir, filename);
    await writeFile(path, buffer).catch(async () => {
      // create dir if not exists
      const { mkdir } = await import("fs/promises");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path, buffer);
    });

    return NextResponse.json({
      url: `/uploads/${filename}`,
      message: "Image uploaded successfully",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
