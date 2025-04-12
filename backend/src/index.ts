import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { initRedis, redisClient } from './services/redisService';
import Auction from './models/Auction';
import User from './models/User';
import Bid from './models/Bid';


import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import listingRoutes from './routes/listings';
import auctionRoutes from './routes/auctions';
import categoryRoutes from './routes/categories';

dotenv.config();


const app = express();
const server = http.createServer(app);


export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Listify API' });
});


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('placeBid', async (data) => {
    console.log('Bid received:', data);
    
    try {
      const { auctionId, amount, userId } = data;
      

      const auction = await Auction.findById(auctionId);
      
      if (!auction) {
        console.error(`Auction ${auctionId} not found`);
        return;
      }
      
      const user = await User.findById(userId);
      
      if (!user) {
        console.error(`User ${userId} not found`);
        return;
      }
      
      if (auction.user.toString() === userId) {
        console.error(`User ${userId} attempted to bid on their own auction ${auctionId}`);
        socket.emit('bidError', { 
          auctionId, 
          error: 'You cannot bid on your own auction' 
        });
        return;
      }
      
      const bid = new Bid({
        auction: auctionId,
        user: userId,
        amount
      });
      
      await bid.save();
      
      auction.currentBid = amount;
      auction.numberOfBids += 1;
      await auction.save();
      
      await redisClient.hSet(`auction:${auctionId}`, {
        currentBid: amount.toString(),
        numberOfBids: auction.numberOfBids.toString()
      });
      
      io.emit(`auction:${auctionId}:update`, {
        auction,
        bid: {
          ...bid.toObject(),
          user: {
            _id: user._id,
            name: user.name
          }
        }
      });
      
      io.emit(`auction:${auctionId}:newBid`, {
        ...bid.toObject(),
        user: {
          _id: user._id,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Error processing bid:', error);
    }
  });

  socket.on('updateAuctionStatus', async (data) => {
    console.log('Auction status update received:', data);
    
    try {
      const { auctionId, status, winningUserId } = data;
      
      const validStatuses = ['SCHEDULED', 'ACCEPTING_BID', 'GOING_ONCE', 'GOING_TWICE', 'SOLD', 'UNSOLD'];
      if (!validStatuses.includes(status)) {
        console.error(`Invalid auction status: ${status}`);
        return;
      }
      
      const auction = await Auction.findById(auctionId);
      
      if (!auction) {
        console.error(`Auction ${auctionId} not found`);
        return;
      }
      
      console.log(`Changing auction ${auctionId} status from ${auction.status} to ${status}`);
      
      auction.status = status;

      if (status === 'SOLD' && winningUserId) {
        console.log(`Setting winning user to ${winningUserId}`);
        auction.winningUser = winningUserId;
      }
      
      await auction.save();
      console.log(`Auction ${auctionId} status updated successfully to ${status}`);
      
      const redisUpdate: Record<string, string> = { status };
      if (status === 'SOLD' && winningUserId) {
        redisUpdate.winningUser = winningUserId;
      }
      await redisClient.hSet(`auction:${auctionId}`, redisUpdate);
      
      console.log(`Broadcasting auction:${auctionId}:update event`);
      io.emit(`auction:${auctionId}:update`, { auction });
      
      if (status === 'SOLD' || status === 'UNSOLD') {
        console.log(`Broadcasting auction:${auctionId}:completed event`);
        io.emit(`auction:${auctionId}:completed`, { 
          status, 
          winningUserId: status === 'SOLD' ? winningUserId : null 
        });
      }
    } catch (error) {
      console.error('Error updating auction status:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/listify';

mongoose.set('strictQuery', false);

const startServer = async () => {
  try {
    await initRedis();
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
}); 