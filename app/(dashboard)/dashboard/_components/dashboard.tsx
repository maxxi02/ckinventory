// app/dashboard/page.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

import { Loader2, ArrowUpRight, Star, AlertTriangle, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { IProduct } from "@/models/product";
import { MainButton } from "@/components/MainButton";
import { cn, formatDate } from "@/lib/utils";

// Extended interface to handle populated category
interface PopulatedProduct extends Omit<IProduct, "category"> {
  category: { _id: string; name: string; path?: string } | string;
}

// Dashboard Components
const DashboardCard = ({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}) => {
  return (
    <Card className={cn("@container/card", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

const ProductCard = ({ product }: { product: PopulatedProduct }) => {
  const renderRatingStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          size={16}
          className={
            index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ));
  };

  // Check if image exists and is a valid URL
  const hasValidImage =
    product.image &&
    typeof product.image === "string" &&
    product.image.length > 0;

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <div className="relative h-[200] w-auto ">
        {hasValidImage ? (
          <div className="relative w-full h-full">
            <Image
              className="p-2 rounded-lg"
              src={product.image ? encodeURI(product.image) : ""}
              alt={product.productName}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center ">
            No Image
          </div>
        )}
      </div>
      <CardContent className="flex flex-col flex-grow p-4">
        <div className="flex mb-2">{renderRatingStars(product.rate)}</div>
        <h3 className="font-medium text-lg mb-1 line-clamp-2">
          {product.productName}
        </h3>
        <p className="text-primary font-bold mt-auto">
          ₱{product.price.toFixed(2)}
        </p>
        <div className="mt-2 text-sm text-gray-500">
          {product.quantity <= 0 ? (
            <span className="text-red-500 font-medium">Out of Stock</span>
          ) : (
            <span>In Stock: {product.quantity}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  // const [categories, setCategories] = useState<(typeof Category)[]>([]);

  const [dashboardData, setDashboardData] = useState({
    totalStoreValue: 0,
    outOfStockCount: 0,
    categories: 0,
    popularProducts: [] as PopulatedProduct[],
    recentProducts: [] as PopulatedProduct[],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getCategoryDisplay = (
    category: { _id: string; name: string } | string | null | undefined
  ): string => {
    if (!category) return "Uncategorized";

    if (typeof category === "object" && category !== null) {
      return category.name || "Unnamed Category";
    }

    return String(category);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard data from the new API endpoint
      const dashboardResponse = await fetch("/api/dashboard");
      if (!dashboardResponse.ok)
        throw new Error("Failed to fetch dashboard data");

      const dashboardData = await dashboardResponse.json();

      // Populate dashboardData state with the response
      setDashboardData({
        totalStoreValue: dashboardData.totalStoreValue || 0,
        outOfStockCount: dashboardData.outOfStockCount || 0,
        categories: dashboardData.categoriesCount || 0,
        popularProducts: dashboardData.popularProducts || [],
        recentProducts: dashboardData.recentProducts || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pr-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 grid-cols-1 lg:grid-cols-3">
        <DashboardCard
          title="Total Store Value"
          value={`₱${dashboardData.totalStoreValue.toFixed(2)}`}
          icon={<ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
        />
        <DashboardCard
          title="Out of Stock"
          value={dashboardData.outOfStockCount}
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
        />
        <DashboardCard
          title="All Categories"
          value={dashboardData.categories}
          icon={<Tag className="h-4 w-4 text-muted-foreground" />}
          className="md:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Popular Products Section - Carousel */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Popular Products</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/product/view")}
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.popularProducts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No products found
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {dashboardData.popularProducts.map((product) => (
                  <CarouselItem
                    key={product._id?.toString()}
                    className="md:basis-1/3 lg:basis-1/4 text-sm"
                  >
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}
        </CardContent>
      </Card>

      {/* Recent Products Section */}
      <Card className="w-full">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recently Added Products</CardTitle>
          <MainButton
            className="p-2 w-max text-sm"
            onClick={() => router.push("/product/add")}
          >
            Add New
          </MainButton>
        </CardHeader>
        <CardContent>
          {dashboardData.recentProducts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No recent products
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Added On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.recentProducts.map((product) => (
                    <TableRow key={product._id?.toString()}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell>
                        {getCategoryDisplay(product.category)}
                      </TableCell>
                      <TableCell>₱{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            product.quantity <= 0
                              ? "text-red-500 font-bold"
                              : ""
                          }
                        >
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(product.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
