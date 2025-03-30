import mongoose from 'mongoose';

export interface IBid extends mongoose.Document {
  auction: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const bidSchema = new mongoose.Schema<IBid>(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add a bid amount'],
      min: [0.01, 'Bid amount must be at least 0.01'],
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

// Ensure bid is unique for user and auction combination
bidSchema.index({ auction: 1, user: 1, amount: 1 }, { unique: true });

const Bid = mongoose.model<IBid>('Bid', bidSchema);

export default Bid; 