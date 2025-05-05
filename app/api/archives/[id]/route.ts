import { getServerSession } from "@/lib/action";
import { connectDB } from "@/lib/db/connect-db";
import { Archive } from "@/models/archives";
import { NextRequest, NextResponse } from "next/server";
// Define route segment config
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Not using edge runtime

// Define route handler
export async function DELETE(
  request: NextRequest,
  // Type the context parameter with Record<string, string> to satisfy the type system
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const archive = await Archive.findByIdAndDelete(id);
    if (!archive) {
      return NextResponse.json(
        { error: "Archive record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Archive ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Failed to delete archive record:", error);
    return NextResponse.json(
      { error: "Failed to delete archive record" },
      { status: 500 }
    );
  }
}
