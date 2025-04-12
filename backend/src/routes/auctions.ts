import express from 'express';
import { body } from 'express-validator';
import * as auctionController from '../controllers/auctionController';
import { auth } from '../middlewares/auth';
import upload from '../middlewares/upload';

const router = express.Router();

router.get('/user/won', auth, auctionController.getWonAuctions);


router.get('/user/:userId/won', auth, auctionController.getWonAuctions);


router.get('/', auctionController.getAuctions);

router.get('/:id', auctionController.getAuction);

router.get('/:id/bids', auctionController.getAuctionBids);

router.post(
  '/with-images',
  auth,
  upload.array('images', 5),
  auctionController.createAuctionWithImages
);

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

router.put(
  '/:id/with-images',
  auth,
  upload.array('images', 5),
  auctionController.updateAuctionWithImages
);

router.delete('/:id', auth, auctionController.deleteAuction);

router.post(
  '/:id/bids',
  auth,
  [
    body('amount').isNumeric().withMessage('Bid amount must be a number'),
  ],
  auctionController.placeBid
);

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