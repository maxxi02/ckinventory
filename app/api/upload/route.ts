import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/action";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called");
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      console.error("No file in upload request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    console.log("File received:", file.name, file.type, file.size);

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Get file extension
    const fileExt = path.extname(file.name);
    const fileNameWithoutExt = path.basename(file.name, fileExt);

    // Create unique filename - only keep alphanumeric characters and underscores
    const timestamp = Date.now();
    const sanitizedName = fileNameWithoutExt.replace(/[^a-zA-Z0-9_]/g, "_");
    const filename = `${timestamp}-${sanitizedName}${fileExt}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL path
    const imageUrl = `/uploads/${filename}`;
    console.log("Generated image URL:", imageUrl);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
