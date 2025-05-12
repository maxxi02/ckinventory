import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect-db";
import { Product } from "@/models/product";

// Mock database of products with object detection mappings
const objectProducts = [
  {
    objectName: "Pogi",
    name: "Whey Protein Isolate",
    description: "High-quality protein powder for muscle recovery",
    price: 39.99,
    barcode: "123456789012",
  },
  {
    objectName: "creatine",
    name: "Active Creatine Monohydrate",
    description:
      "Pure creatine monohydrate powder for muscle strength and performance",
    price: 29.99,
    barcode: "745125547008",
  },
  {
    objectName: "pre-workout",
    name: "Pre-Workout Energy",
    description: "Advanced formula for energy and focus during workouts",
    price: 34.99,
    barcode: "987654321098",
  },
  {
    objectName: "amino acids",
    name: "BCAA Recovery",
    description: "Branch Chain Amino Acids for muscle recovery and endurance",
    price: 24.99,
    barcode: "456789123456",
  },
  {
    objectName: "water bottle",
    name: "Hydration Sports Bottle",
    description:
      "Durable 750ml water bottle for fitness and outdoor activities",
    price: 19.99,
    barcode: "234567890123",
  },
  {
    objectName: "shaker",
    name: "Protein Shaker Bottle",
    description:
      "Leak-proof mixing bottle with wire whisk for smooth protein shakes",
    price: 14.99,
    barcode: "345678901234",
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ className: string }> }
) {
  const { className } = await params;

  try {
    // First, try to find a match in the mock database
    const mockProduct = objectProducts.find((p) =>
      p.objectName.toLowerCase().includes(className.toLowerCase())
    );

    if (mockProduct) {
      // Find the corresponding category in the database
      await connectDB();

      return NextResponse.json({
        ...mockProduct,
      });
    }

    // If no mock product, try to find in the actual database
    await connectDB();

    // Use a more flexible search to match partial object names
    const product = await Product.findOne({
      $or: [
        { name: { $regex: className, $options: "i" } },
        { description: { $regex: className, $options: "i" } },
      ],
    });

    if (product) {
      return NextResponse.json(product);
    } else {
      // If no product found, return a generic response with the detected object name
      return NextResponse.json(
        {
          name: className.charAt(0).toUpperCase() + className.slice(1),
          className: className,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching product by object name:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
