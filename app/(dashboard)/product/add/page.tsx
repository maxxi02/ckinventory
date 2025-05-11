"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2, Barcode, XCircle, Camera } from "lucide-react";
import BarcodeScanner from "@/lib/barcodescanner-utilities/barcode-scanner";
import ObjectDetector, {
  DetectedObject,
} from "@/lib/objectdetector-utilities/object-detector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Category {
  _id: string;
  name: string;
}

// Enhanced product schema with detectedObject
const productSchema = z.object({
  barcode: z.string().optional(),
  productName: z
    .string()
    .min(2, { message: "Product name must be at least 2 characters" }),
  description: z.string().optional(),
  quantity: z.coerce
    .number()
    .min(0, { message: "Quantity must be at least 0" }),
  price: z.coerce.number().min(0, { message: "Price must be at least 0" }),
  rate: z.coerce
    .number()
    .min(1, { message: "Rating must be between 1 and 5" })
    .max(5),
  category: z.string({ required_error: "Please select a category" }),
  image: z.any().optional(),
  detectedObject: z.string().optional(),
});

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Barcode scanner states
  const [isScannerActive, setScannerActive] = useState(false);
  const [isScannerLoading, setIsScannerLoading] = useState(false);
  const scannerRef = useRef<BarcodeScanner | null>(null);
  const scannerDivId = "barcode-scanner";
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(
    null
  );

  // Object detector states
  const [isDetectorActive, setDetectorActive] = useState(false);
  const autoCloseEnabled = true;
  const [lastDetectedObject, setLastDetectedObject] = useState<string | null>(
    null
  );

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      barcode: "",
      productName: "",
      description: "",
      quantity: 0,
      price: 0,
      rate: 5,
      category: "",
      detectedObject: "",
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (response.ok) {
          setCategories(data.categories);
        } else {
          toast.error(data.error || "Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("An error occurred while fetching categories");
      }
    }

    fetchCategories();
  }, []);

  // Handle successful barcode scan
  const handleScanSuccess = async (decodedText: string) => {
    console.log("Code scanned:", decodedText);
    toast.success(`Scanned barcode: ${decodedText}`);
    setLastScannedBarcode(decodedText);
    setScannerActive(false);
    form.setValue("barcode", decodedText);

    try {
      const loadingToast = toast.loading("Looking up product information...");
      const response = await fetch(`/api/products/barcode/${decodedText}`);
      toast.dismiss(loadingToast);

      if (response.ok) {
        const productData = await response.json();
        form.setValue("productName", productData.name || decodedText);
        form.setValue("description", productData.description || "");
        form.setValue("price", productData.price || 0);

        if (productData.category) {
          if (typeof productData.category === "string") {
            const matchingCategory = categories.find(
              (cat) =>
                cat.name.toLowerCase() === productData.category.toLowerCase()
            );
            if (matchingCategory) {
              form.setValue("category", matchingCategory._id);
            }
          } else {
            form.setValue("category", productData.category);
          }
        }
        toast.success("Product information loaded successfully");
      } else {
        toast.error(
          "No product information found. Using barcode as reference."
        );
      }
    } catch (error) {
      console.error("Barcode lookup error:", error);
      toast.error("Error looking up product information");
    }
  };

  // Start barcode scanner
  const startScanner = async () => {
    // Make sure to stop object detector if running
    if (isDetectorActive) {
      setDetectorActive(false);
    }

    setIsScannerLoading(true);
    if (!scannerRef.current) {
      scannerRef.current = new BarcodeScanner(scannerDivId, {
        onScanSuccess: handleScanSuccess,
        onScannerClosed: () => setScannerActive(false),
        onScanError: (error) => {
          if (error.includes("NotAllowedError")) {
            toast.error(
              "Camera access denied. Please enable camera permissions."
            );
          }
        },
      });
    }

    try {
      const started = await scannerRef.current.start();
      if (started) {
        setScannerActive(true);
      } else {
        toast.error("Failed to start scanner");
      }
    } catch (error) {
      console.error("Scanner start error:", error);
      toast.error("Failed to start scanner");
    } finally {
      setIsScannerLoading(false);
    }
  };

  // Stop barcode scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setScannerActive(false);
  };

  // Handle object detection results
  const handleObjectDetection = (objects: DetectedObject[]) => {
    if (objects && objects.length > 0) {
      // Sort by confidence score and take the highest one
      const sortedObjects = [...objects].sort((a, b) => b.score - a.score);
      const topObject = sortedObjects[0];

      console.log("Detected object:", topObject.className);
      setLastDetectedObject(topObject.className);

      // Update form with detected object
      form.setValue("detectedObject", topObject.className);

      // If product name is empty, use the detected object name
      if (!form.getValues("productName")) {
        form.setValue(
          "productName",
          topObject.className.charAt(0).toUpperCase() +
            topObject.className.slice(1)
        );
      }

      toast.success(`Detected: ${topObject.className}`);
    }
  };

  // Toggle object detector
  const toggleObjectDetector = () => {
    // Make sure to stop scanner if active
    if (isScannerActive) {
      stopScanner();
    }

    setDetectorActive(!isDetectorActive);
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof productSchema>) {
    setIsLoading(true);
    try {
      const productData = {
        ...values,
        image: undefined,
      };

      if (values.image && values.image[0] instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append("image", values.image[0]);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            "Image upload failed: " + (errorData.error || "Unknown error")
          );
        }

        const uploadData = await uploadResponse.json();
        productData.image = uploadData.imageUrl;
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Product added successfully");
        router.push("/product/view");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", (error as Error).message);
      toast.error("An error occurred while adding the product");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image", e.target.files);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>
            Enter product details manually or use smart tools to automate the
            process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Smart Tools and Detection Section */}
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-md">
                    <div className="text-lg font-medium mb-2">
                      Smart Product Tools
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={isScannerActive ? "destructive" : "outline"}
                        onClick={isScannerActive ? stopScanner : startScanner}
                        disabled={isScannerLoading || isDetectorActive}
                        className="flex items-center"
                      >
                        {isScannerLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Barcode size={16} className="mr-2" />
                        )}
                        {isScannerActive ? "Stop Scanner" : "Scan Barcode"}
                      </Button>

                      <Button
                        type="button"
                        variant={isDetectorActive ? "destructive" : "outline"}
                        onClick={toggleObjectDetector}
                        disabled={isScannerActive}
                        className="flex items-center"
                      >
                        <Camera size={16} className="mr-2" />
                        {isDetectorActive ? "Stop Detector" : "Detect Object"}
                      </Button>
                    </div>
                  </div>

                  {/* Scanner/Detector View Area */}
                  <div className="h-auto border rounded-md overflow-hidden">
                    {/* Barcode Scanner */}
                    <div
                      className={` ${isScannerActive ? "relative" : "hidden"} w-full h-full`}
                    >
                      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center z-10">
                        <p className="text-sm font-medium text-white">
                          Barcode Scanner
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopScanner}
                          className="h-7 px-2 text-xs text-white hover:bg-black hover:bg-opacity-30"
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                      <div id={scannerDivId} className="w-full h-full"></div>
                    </div>

                    {/* Object Detector */}
                    {isDetectorActive && (
                      <ObjectDetector
                        isActive={isDetectorActive}
                        onActivationChange={setDetectorActive}
                        onDetection={handleObjectDetection}
                        autoCapture={autoCloseEnabled}
                        captureThreshold={0.7}
                      />
                    )}

                    {/* Default prompt when no tool active */}
                    {!isScannerActive && !isDetectorActive && (
                      <div className="flex flex-col items-center justify-center h-full bg-muted py-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          Use the smart tools above to scan a barcode or detect
                          an object
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={startScanner}
                            className="flex items-center"
                          >
                            <Barcode size={16} className="mr-2" />
                            Scan Barcode
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleObjectDetector}
                            className="flex items-center"
                          >
                            <Camera size={16} className="mr-2" />
                            Detect Object
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detection Results */}
                  <div className="grid grid-cols-1 gap-4">
                    {lastScannedBarcode && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">
                          Scanned Barcode: {lastScannedBarcode}
                        </p>
                      </div>
                    )}

                    {lastDetectedObject && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">
                          Detected Object: {lastDetectedObject}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Form Section */}
                <div className="space-y-5">
                  <div className="text-lg font-medium mb-2">
                    Product Information
                  </div>

                  {/* Barcode field */}
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter barcode or scan"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Scan or enter a barcode to automatically populate
                          product information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter product description"
                            className="resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₱)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating (1-5 stars)</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={String(field.value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <SelectItem
                                    key={rating}
                                    value={String(rating)}
                                  >
                                    {rating} {rating === 1 ? "Star" : "Stars"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.length > 0 ? (
                                  categories.map((category) => (
                                    <SelectItem
                                      key={category._id}
                                      value={category._id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="loading" disabled>
                                    Loading categories...
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Detected Object (hidden field) */}
                  <FormField
                    control={form.control}
                    name="detectedObject"
                    render={({ field }) => <input type="hidden" {...field} />}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                      <FormItem>
                        <FormLabel>Product Image (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                          />
                        </FormControl>
                        <FormDescription>
                          Upload an image of the product (JPG, PNG)
                        </FormDescription>
                        <FormMessage />
                        {imagePreview && (
                          <div className="mt-4">
                            <Image
                              width={200}
                              height={200}
                              src={imagePreview}
                              alt="Product preview"
                              className="h-40 w-40 object-contain rounded border bg-white"
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Product"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
