// app/dashboard/product/view-all-products/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Star, ShoppingCart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface Product {
  _id: string;
  productName: string;
  description?: string;
  quantity: number;
  price: number;
  rate: number;
  image?: string;
  createdAt: string;
  category: string;
}

export default function ViewAllProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSoldDialogOpen, setIsSoldDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [soldQuantity, setSoldQuantity] = useState<number>(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
      } else {
        toast.error(data.error || "Failed to fetch products");
      }
    } catch (error) {
      console.log((error as Error).message);
      toast.error("An error occurred while fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.log((error as Error).message);
      toast.error("An error occurred while deleting the product");
    }
  };

  const handleSoldClick = (product: Product) => {
    setSelectedProduct(product);
    setSoldQuantity(1);
    setIsSoldDialogOpen(true);
  };

  const handleSoldSubmit = async () => {
    if (!selectedProduct) return;

    try {
      if (soldQuantity <= 0) {
        toast.error("Quantity must be greater than 0");
        return;
      }

      if (soldQuantity > selectedProduct.quantity) {
        toast.error("Quantity cannot exceed available stock");
        return;
      }

      const response = await fetch(
        `/api/products/${selectedProduct._id}/sold`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: selectedProduct._id,
            quantity: soldQuantity,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Product marked as sold successfully");
        setIsSoldDialogOpen(false);
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to mark product as sold");
      }
    } catch (error) {
      console.log((error as Error).message);
      toast.error("An error occurred while marking the product as sold");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return `₱${price.toFixed(2)}`;
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ));
  };

  const filteredProducts = products.filter(
    (product) =>
      (product.productName &&
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryDisplay = (
    category: { _id: string; name: string } | string | null | undefined
  ): string => {
    if (!category) return "Uncategorized";

    if (typeof category === "object" && category !== null) {
      return category.name || "Unnamed Category";
    }

    return String(category);
  };
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Products</CardTitle>
            <CardDescription>Manage your inventory products</CardDescription>
          </div>
          <Link href="/product/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-10">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              {searchTerm
                ? "No products match your search criteria."
                : "No products found. Add one to get started."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <Image
                              width={250}
                              height={250}
                              src={product.image}
                              alt={product.productName}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <div>{product.productName}</div>
                            {product.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryDisplay(product.category)}
                      </TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        {product.quantity === 0 ? (
                          <Badge variant="destructive">Out of stock</Badge>
                        ) : (
                          product.quantity
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {renderStars(product.rate)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(product.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleSoldClick(product)}
                            disabled={product.quantity === 0}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              router.push(`/product/edit/${product._id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete
                                  {product.productName}? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product._id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSoldDialogOpen} onOpenChange={setIsSoldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Sold</DialogTitle>
            <DialogDescription>
              Enter the quantity sold for {selectedProduct?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="soldQuantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="soldQuantity"
                type="number"
                min="1"
                max={selectedProduct?.quantity || 1}
                value={soldQuantity || ""}
                onChange={(e) => setSoldQuantity(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            {selectedProduct && (
              <div className="text-sm text-gray-500">
                Available stock: {selectedProduct.quantity}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSoldDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSoldSubmit}>Confirm Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
