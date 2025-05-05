// app/dashboard/product/archives/page.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Trash2, Star } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface Archive {
  _id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  price: number;
  rate: number;
  image?: string;
  soldAt: string;
  category: string;
}

export default function ArchivesPage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchArchives();
    fetchCategories();
  }, []);

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/archives");
      const data = await response.json();
      if (response.ok) {
        setArchives(data.archives);
      } else {
        toast.error(data.error || "Failed to fetch archives");
      }
    } catch (error) {
      console.log((error as Error).message);
      toast.error("An error occurred while fetching archives");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (response.ok) {
        const categoryMap: Record<string, string> = {};
        data.categories.forEach((category: Category) => {
          categoryMap[category._id] = category.name;
        });
        setCategories(categoryMap);
      }
    } catch (error) {
      console.log((error as Error).message);
      toast.error("An error occurred while fetching categories");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/archives/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Archive record deleted successfully");
        fetchArchives();
      } else {
        toast.error(data.error || "Failed to delete archive record");
      }
    } catch (error) {
      console.log((error as Error).message);
      toast.error("An error occurred while deleting the archive record");
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch("/api/archives", {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("All archives cleared successfully");
        fetchArchives();
      } else {
        toast.error(data.error || "Failed to clear archives");
      }
    } catch (error) {
      console.log((error as Error).message);
      toast.error("An error occurred while clearing archives");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return `₱${price.toFixed(2)}`;
  };

  const calculateTotalValue = (archive: Archive) => {
    return archive.price * archive.quantity;
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

  const filteredArchives = archives.filter(
    (archive) =>
      archive.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (archive.description &&
        archive.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSalesValue = archives.reduce((total, archive) => {
    return total + calculateTotalValue(archive);
  }, 0);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Archives</CardTitle>
            <CardDescription>View history of sold products</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Sales Value</div>
              <div className="text-xl font-bold">
                {formatPrice(totalSalesValue)}
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={archives.length === 0}>
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Archives</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all archive records? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search archives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-10">Loading archives...</div>
          ) : filteredArchives.length === 0 ? (
            <div className="text-center py-10">
              {searchTerm
                ? "No archives match your search criteria."
                : "No archives found."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Sold Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArchives.map((archive) => (
                    <TableRow key={archive._id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{archive.productName}</div>
                          {archive.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {archive.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {categories[archive.category] || "Unknown"}
                      </TableCell>
                      <TableCell>{formatPrice(archive.price)}</TableCell>
                      <TableCell>{archive.quantity}</TableCell>
                      <TableCell>
                        {formatPrice(calculateTotalValue(archive))}
                      </TableCell>
                      <TableCell>
                        <div className="flex">{renderStars(archive.rate)}</div>
                      </TableCell>
                      <TableCell>{formatDate(archive.soldAt)}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Archive Record
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this archive
                                record? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(archive._id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
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
