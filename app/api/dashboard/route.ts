// app/api/dashboard/route.ts

import { getServerSession } from "@/lib/action";
import { connectDB } from "@/lib/db/connect-db";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get total store value
    const products = await Product.find({ soldAt: { $exists: false } });
    const totalStoreValue = products.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);

    // Get out of stock count
    const outOfStockCount = await Product.countDocuments({
      quantity: 0,
      soldAt: { $exists: false },
    });

    // Get categories count
    const categoriesCount = await Category.countDocuments();

    // Get popular products (highest rated - sorted from highest to lowest)
    const popularProducts = await Product.find({
      soldAt: { $exists: false },
    })
      .sort({ rate: -1, createdAt: -1 }) // Sort by rate DESC, then by creation date DESC
      .limit(10)
      .select("productName price rate image quantity category")
      .populate("category", "name");

    // Get recent products with populated category
    const recentProducts = await Product.find({ soldAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("category", "name"); // Add this line to populate category

    return NextResponse.json({
      totalStoreValue,
      outOfStockCount,
      categoriesCount,
      popularProducts,
      recentProducts,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
