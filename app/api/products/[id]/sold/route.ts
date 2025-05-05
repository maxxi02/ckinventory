// app/api/products/[id]/sell/route.ts
import { getServerSession } from "@/lib/action";
import { connectDB } from "@/lib/db/connect-db";
import { Archive } from "@/models/archives";
import { Product } from "@/models/product";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { quantity } = await req.json();

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.quantity < quantity) {
      return NextResponse.json(
        { error: "Not enough inventory" },
        { status: 400 }
      );
    }

    // Create archive record
    const archive = await Archive.create({
      productId: product._id,
      productName: product.productName,
      description: product.description,
      quantity: quantity,
      price: product.price,
      rate: product.rate,
      image: product.image,
      category: product.category,
    });

    // Update product quantity
    product.quantity -= quantity;
    await product.save();

    return NextResponse.json({
      message: "Product sold successfully",
      archive,
      product,
    });
  } catch (error) {
    console.error("Error selling product:", error);
    return NextResponse.json(
      { error: "Failed to sell product" },
      { status: 500 }
    );
  }
}
