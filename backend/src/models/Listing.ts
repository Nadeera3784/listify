import mongoose from 'mongoose';

export interface IListing extends mongoose.Document {
  title: string;
  description: string;
  price?: number;
  location: string;
  phoneNumber?: string;
  imageUrls: string[];
  category: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const listingSchema = new mongoose.Schema<IListing>(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    price: {
      type: Number,
      min: [0, 'Price must be at least 0'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add index for better search performance
listingSchema.index({ title: 'text', description: 'text', location: 'text' });

const Listing = mongoose.model<IListing>('Listing', listingSchema);

export default Listing; 