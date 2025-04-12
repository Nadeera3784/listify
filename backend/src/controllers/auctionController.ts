import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Auction from '../models/Auction';
import Bid from '../models/Bid';
import User from '../models/User';
import { redisClient } from '../services/redisService';
import { io } from '../index';


export const getAuctions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      status, 
      category, 
      user,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (user) filter.user = user;
    
    const total = await Auction.countDocuments(filter);
    
    const auctions = await Auction.find(filter)
      .populate('category', 'name slug')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const pages = Math.ceil(total / Number(limit));
    
    res.json({
      success: true,
      auctions,
      total,
      pages,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getAuction = async (req: Request, res: Response): Promise<void> => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('user', 'name email');
    
    if (!auction) {
      res.status(404).json({ success: false, error: 'Auction not found' });
      return;
    }
    
    res.json({
      success: true,
      auction
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const createAuction = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated or user ID missing' });
      return;
    }
    
    const { title, description, startingBid, imageUrls: providedImageUrls, category, status, discount } = req.body;
    
    const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5001';
    const imageUrls = providedImageUrls?.map((url: string) => {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `${serverBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }) || [];
    
    const newAuction = new Auction({
      title,
      description,
      startingBid,
      currentBid: startingBid,
      imageUrls,
      category,
      user: req.user.id,
      status: status || 'SCHEDULED',
      discount: discount || 0,
      numberOfBids: 0
    });
    
    await newAuction.save();
    
    await redisClient.hSet(`auction:${newAuction._id?.toString() || ''}`, {
      id: newAuction._id?.toString() || '',
      title: newAuction.title,
      currentBid: newAuction.currentBid.toString(),
      numberOfBids: newAuction.numberOfBids.toString(),
      status: newAuction.status
    });
    
    res.status(201).json({
      success: true,
      auction: newAuction
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateAuction = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  
  try {
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      res.status(404).json({ success: false, error: 'Auction not found' });
      return;
    }
    
    if (auction.user.toString() !== req.user.id && !req.user.isAdmin) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }
    
    const { title, description, imageUrls, category, discount } = req.body;
    
    if (title) auction.title = title;
    if (description) auction.description = description;
    if (imageUrls) auction.imageUrls = imageUrls;
    if (category) auction.category = category;
    if (discount !== undefined) auction.discount = discount;
    
    await auction.save();

    await redisClient.hSet(`auction:${auction._id}`, {
      title: auction.title,
      discount: auction.discount.toString()
    });
    
    res.json({
      success: true,
      auction
    });
  } catch (error) {
    console.error('Error updating auction:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const deleteAuction = async (req: Request, res: Response): Promise<void> => {
  try {
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      res.status(404).json({ success: false, error: 'Auction not found' });
      return;
    }
    
    if (auction.user.toString() !== req.user.id && !req.user.isAdmin) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }
    
    await Auction.findByIdAndDelete(req.params.id);
    
    await redisClient.del(`auction:${req.params.id}`);
    
    res.json({
      success: true,
      message: 'Auction deleted'
    });
  } catch (error) {
    console.error('Error deleting auction:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateAuctionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!['SCHEDULED', 'ACCEPTING_BID', 'SOLD', 'UNSOLD'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status' });
      return;
    }
    
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      res.status(404).json({ success: false, error: 'Auction not found' });
      return;
    }
    
    if (auction.user.toString() !== req.user.id && !req.user.isAdmin) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }
    
    auction.status = status;
    await auction.save();
    
    await redisClient.hSet(`auction:${auction._id}`, { status });
    
    res.json({
      success: true,
      auction
    });
  } catch (error) {
    console.error('Error updating auction status:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const placeBid = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      res.status(404).json({ success: false, error: 'Auction not found' });
      return;
    }
    
    const allowedStatuses = ['ACCEPTING_BID', 'GOING_ONCE', 'GOING_TWICE'];
    if (!allowedStatuses.includes(auction.status)) {
      res.status(400).json({ success: false, error: `Auction is not accepting bids (status: ${auction.status})` });
      return;
    }
    
    if (auction.user.toString() === userId) {
      res.status(400).json({ success: false, error: 'You cannot bid on your own auction' });
      return;
    }
    
    if (Number(amount) <= auction.currentBid) {
      res.status(400).json({
        success: false,
        error: `Bid must be higher than current bid ($${auction.currentBid})`
      });
      return;
    }
    
    const newBid = new Bid({
      user: userId,
      auction: req.params.id,
      amount: Number(amount)
    });
    
    await newBid.save();
    
    auction.currentBid = Number(amount);
    auction.numberOfBids += 1;
    auction.set('lastBidder', userId);
    
    const currentStatus = auction.status as string;
    if (currentStatus === 'GOING_ONCE' || currentStatus === 'GOING_TWICE') {
      console.log(`Resetting auction ${auction._id} from ${auction.status} to ACCEPTING_BID due to new bid`);
      auction.status = 'ACCEPTING_BID';
    }
    
    await auction.save();
    
    await redisClient.hSet(`auction:${auction._id?.toString() || ''}`, {
      currentBid: auction.currentBid.toString(),
      numberOfBids: auction.numberOfBids.toString(),
      lastBidder: userId,
      status: auction.status
    });
    
    const user = await User.findById(userId);
    
    if (io) {
      io.emit(`auction:${auction._id}:update`, {
        auction,
        bid: {
          ...newBid.toObject(),
          user: {
            _id: user?._id,
            name: user?.name
          }
        }
      });
      
      io.emit(`auction:${auction._id}:newBid`, {
        ...newBid.toObject(),
        user: {
          _id: user?._id,
          name: user?.name
        }
      });
    }
    
    res.json({
      success: true,
      bid: newBid,
      auction: {
        id: auction._id,
        currentBid: auction.currentBid,
        numberOfBids: auction.numberOfBids
      }
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getAuctionBids = async (req: Request, res: Response): Promise<void> => {
  try {
    const bids = await Bid.find({ auction: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      bids
    });
  } catch (error) {
    console.error('Error getting auction bids:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getWonAuctions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const userId = req.params.userId || req.user.id;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter = {
      winningUser: userId,
      status: 'SOLD'
    };
    
    const total = await Auction.countDocuments(filter);
    
    const auctions = await Auction.find(filter)
      .populate('category', 'name slug')
      .populate('user', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const pages = Math.ceil(total / Number(limit));
    
    res.json({
      success: true,
      auctions,
      total,
      pages,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching won auctions:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const createAuctionWithImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated or user ID missing' });
      return;
    }
    
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: 'No images uploaded' });
      return;
    }
    
    const { 
      title, 
      description, 
      startingBid, 
      category, 
      status, 
      discount,
      phoneNumber 
    } = req.body;
    
    if (!title || !description || !startingBid || !category) {
      res.status(400).json({ 
        success: false, 
        error: 'Required fields are missing' 
      });
      return;
    }
    
    const imageUrls = files.map(file => {
      const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5001';
      return `${serverBaseUrl}/uploads/${file.filename}`;
    });
    
    const newAuction = new Auction({
      title,
      description,
      startingBid: parseFloat(startingBid),
      currentBid: parseFloat(startingBid),
      imageUrls,
      category,
      user: req.user.id,
      status: status || 'SCHEDULED',
      discount: discount ? parseFloat(discount) : 0,
      numberOfBids: 0,
      phoneNumber: phoneNumber || ''
    });
    
    await newAuction.save();
    
    await redisClient.hSet(`auction:${newAuction._id?.toString() || ''}`, {
      id: newAuction._id?.toString() || '',
      title: newAuction.title,
      currentBid: newAuction.currentBid.toString(),
      numberOfBids: newAuction.numberOfBids.toString(),
      status: newAuction.status
    });
    
    res.status(201).json({
      success: true,
      auction: newAuction
    });
  } catch (error) {
    console.error('Error creating auction with images:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateAuctionWithImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated or user ID missing' });
      return;
    }
    
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      res.status(404).json({ success: false, error: 'Auction not found' });
      return;
    }
    
    if (auction.user.toString() !== req.user.id && !req.user.isAdmin) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }
    
    const files = req.files as Express.Multer.File[];
    
    const { 
      title, 
      description, 
      startingBid, 
      category, 
      status, 
      discount,
      phoneNumber,
      existingImages
    } = req.body;
    
    if (!title || !description || !startingBid || !category) {
      res.status(400).json({ 
        success: false, 
        error: 'Required fields are missing' 
      });
      return;
    }
    
    let imageUrls: string[] = [];
    
    if (existingImages) {
      if (typeof existingImages === 'string') {
        imageUrls.push(existingImages);
      } else {
        imageUrls = [...existingImages];
      }
    }
    
    if (files && files.length > 0) {
      const newImageUrls = files.map(file => {
        const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5001';
        return `${serverBaseUrl}/uploads/${file.filename}`;
      });
      
      imageUrls = [...imageUrls, ...newImageUrls];
    }
    
    if (imageUrls.length === 0) {
      res.status(400).json({ success: false, error: 'At least one image is required' });
      return;
    }
    
    auction.title = title;
    auction.description = description;
    auction.category = category;
    auction.status = status;
    auction.startingBid = parseFloat(startingBid);
    auction.imageUrls = imageUrls;
    
    if (auction.currentBid < parseFloat(startingBid)) {
      auction.currentBid = parseFloat(startingBid);
    }
    
    if (discount !== undefined) {
      auction.discount = parseFloat(discount);
    }
    
    if (phoneNumber) {
      auction.phoneNumber = phoneNumber;
    }
    
    await auction.save();
    
    await redisClient.hSet(`auction:${auction._id}`, {
      title: auction.title,
      status: auction.status,
      discount: auction.discount.toString()
    });
    
    res.json({
      success: true,
      auction
    });
  } catch (error) {
    console.error('Error updating auction with images:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 