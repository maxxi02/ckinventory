// app/api/archives/route.ts

import { getServerSession } from "@/lib/action";
import { connectDB } from "@/lib/db/connect-db";
import { Archive } from "@/models/archives";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const archives = await Archive.find().sort({ soldAt: -1 });
    return NextResponse.json({ archives });
  } catch (error) {
    console.error("Failed to fetch archives:", error);
    return NextResponse.json(
      { error: "Failed to fetch archives" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await Archive.deleteMany({});
    return NextResponse.json({ message: "All archives cleared successfully" });
  } catch (error) {
    console.error("Failed to clear archives:", error);
    return NextResponse.json(
      { error: "Failed to clear archives" },
      { status: 500 }
    );
  }
}
