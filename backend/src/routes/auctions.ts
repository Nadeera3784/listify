import express from 'express';
import { body } from 'express-validator';
import * as auctionController from '../controllers/auctionController';
import { uploadAuctionImages } from '../controllers/uploadController';
import { auth } from '../middlewares/auth';
import { adminAuth } from '../middlewares/adminAuth';
import upload from '../middlewares/upload';

const router = express.Router();

// Protected routes - require authentication
// Get won auctions for current user
router.get('/user/won', auth, auctionController.getWonAuctions);

// Get won auctions for a specific user
router.get('/user/:userId/won', auth, auctionController.getWonAuctions);

// Public routes
// Get all auctions with filtering
router.get('/', auctionController.getAuctions);

// Get single auction
router.get('/:id', auctionController.getAuction);

// Get bids for auction
router.get('/:id/bids', auctionController.getAuctionBids);

// Create auction with image uploads
router.post(
  '/with-images',
  auth,
  upload.array('images', 5),
  auctionController.createAuctionWithImages
);

// Create new auction
router.post(
  '/',
  auth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('description').not().isEmpty().withMessage('Description is required'),
    body('startingBid').isNumeric().withMessage('Starting bid must be a number'),
    body('category').not().isEmpty().withMessage('Category is required'),
  ],
  auctionController.createAuction
);

// Update auction
router.put(
  '/:id',
  auth,
  [
    body('title').optional().not().isEmpty().withMessage('Title cannot be empty'),
    body('description').optional().not().isEmpty().withMessage('Description cannot be empty'),
    body('category').optional().not().isEmpty().withMessage('Category cannot be empty'),
    body('discount').optional().isNumeric().withMessage('Discount must be a number'),
  ],
  auctionController.updateAuction
);

// Update auction with image uploads
router.put(
  '/:id/with-images',
  auth,
  upload.array('images', 5),
  auctionController.updateAuctionWithImages
);

// Delete auction
router.delete('/:id', auth, auctionController.deleteAuction);

// Place bid on auction
router.post(
  '/:id/bids',
  auth,
  [
    body('amount').isNumeric().withMessage('Bid amount must be a number'),
  ],
  auctionController.placeBid
);

// Update auction status
router.put(
  '/:id/status',
  auth,
  [
    body('status').isIn(['SCHEDULED', 'ACCEPTING_BID', 'SOLD', 'UNSOLD'])
      .withMessage('Invalid status value'),
  ],
  auctionController.updateAuctionStatus
);

export default router; 