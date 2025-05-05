// app/api/products/barcode/[barcode]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect-db";
import { Product } from "@/models/product";

// Mock database of products with barcodes
const barcodeProducts = [
  {
    barcode: "745125547008",
    name: "Active Creatine Monohydrate",
    description:
      "Pure creatine monohydrate powder for muscle strength and performance",
    price: 29.99,
    category: "supplements",
  },
  {
    barcode: "123456789012",
    name: "Whey Protein Isolate",
    description: "High-quality protein powder for muscle recovery",
    price: 39.99,
    category: "supplements",
  },
  {
    barcode: "987654321098",
    name: "Pre-Workout Energy",
    description: "Advanced formula for energy and focus during workouts",
    price: 34.99,
    category: "supplements",
  },
  {
    barcode: "456789123456",
    name: "BCAA Recovery",
    description: "Branch Chain Amino Acids for muscle recovery and endurance",
    price: 24.99,
    category: "supplements",
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> }
) {
  const { barcode } = await params;

  try {
    const mockProduct = barcodeProducts.find((p) => p.barcode === barcode);

    if (mockProduct) {
      return NextResponse.json(mockProduct);
    }

    await connectDB();
    const product = await Product.findOne({ barcode });

    if (product) {
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
