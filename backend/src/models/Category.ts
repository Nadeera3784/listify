import mongoose from 'mongoose';

export interface ICategory extends mongoose.Document {
  name: string;
  slug: string;
  createdAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Please add a category slug'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [50, 'Category slug cannot be more than 50 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category; 