// models/product.ts
import mongoose, { Schema, Types } from "mongoose";

export interface IProduct {
  _id?: Types.ObjectId;
  productName: string;
  description?: string;
  barcode?: string;
  quantity: number;
  price: number;
  rate: number;
  category: Types.ObjectId;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
    },
    barcode: {
      type: String,
      index: true, // Add index for faster barcode lookups
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      default: 0,
    },
    rate: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
      default: 5,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
