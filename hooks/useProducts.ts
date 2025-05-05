"use client";

import { useState, useEffect } from "react";
import { IProduct } from "../models/product";

export function useProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function createProduct(productData: Partial<IProduct>) {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      await fetchProducts(); // Refresh products after creating
      return await response.json();
    } catch (err) {
      setError((err as Error).message || "An error occurred");
      throw err;
    }
  }

  // Add other product operations as needed (update, delete, etc.)

  // Initialize products
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    // Add other operations here
  };
}
