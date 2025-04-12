import mongoose from 'mongoose';

export interface IAuction extends mongoose.Document {
  title: string;
  description: string;
  imageUrls: string[];
  startingBid: number;
  currentBid: number;
  numberOfBids: number;
  status: 'SCHEDULED' | 'ACCEPTING_BID' | 'GOING_ONCE' | 'GOING_TWICE' | 'SOLD' | 'UNSOLD';
  winningUser?: mongoose.Types.ObjectId;
  discount: number;
  category: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  phoneNumber?: string;
  createdAt: Date;
}

const auctionSchema = new mongoose.Schema<IAuction>(
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
    imageUrls: {
      type: [String],
      default: [],
    },
    startingBid: {
      type: Number,
      required: [true, 'Please add a starting bid'],
      min: [0, 'Starting bid must be at least 0'],
    },
    currentBid: {
      type: Number,
      min: [0, 'Current bid must be at least 0'],
      default: function(this: any) {
        return this.startingBid;
      },
    },
    numberOfBids: {
      type: Number,
      default: 0,
      min: [0, 'Number of bids cannot be negative'],
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ACCEPTING_BID', 'GOING_ONCE', 'GOING_TWICE', 'SOLD', 'UNSOLD'],
      default: 'ACCEPTING_BID',
    },
    winningUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot be more than 100%'],
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
    phoneNumber: {
      type: String,
      trim: true,
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

auctionSchema.index({ title: 'text', description: 'text' });

const Auction = mongoose.model<IAuction>('Auction', auctionSchema);

export default Auction; 