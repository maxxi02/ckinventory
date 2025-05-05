// app/api/products/route.ts
import { getServerSession } from "@/lib/action";
import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/models/product";
import { connectDB } from "@/lib/db/connect-db";

//get method for reading products
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
//post method for adding product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    console.log("Product data with image field:", data);

    // Make sure image field exists
    const productData = {
      ...data,
      // Only include image if it's defined
      ...(data.image ? { image: data.image } : {}),
    };

    const product = new Product(productData);
    await product.save();

    console.log("Product saved with image:", product.image);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
