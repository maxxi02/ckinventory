import mongoose, { Schema } from "mongoose";

export interface ICategory {
  _id?: string;
  name: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);
