import mongoose, { Schema } from "mongoose";

export interface IArchive {
  _id?: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  price: number;
  rate: number;
  image?: string;
  soldAt: Date;
  category: string;
}

const archiveSchema = new Schema<IArchive>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  rate: { type: Number, required: true },
  image: { type: String },
  soldAt: { type: Date, default: Date.now },
  category: { type: String, required: true },
});

export const Archive =
  mongoose.models.Archive || mongoose.model<IArchive>("Archive", archiveSchema);
