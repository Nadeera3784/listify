import express from 'express';
import { body } from 'express-validator';
import { 
  getListings, 
  createListing, 
  getListingById, 
  updateListing, 
  deleteListing 
} from '../controllers/listingController';
import { uploadListingImages } from '../controllers/uploadController';
import { auth } from '../middlewares/auth';
import upload from '../middlewares/upload';

const router = express.Router();

// Get all listings with filtering options
router.get('/', getListings);

// Create new listing
router.post(
  '/',
  [
    auth,
    body('title').not().isEmpty().withMessage('Title is required'),
    body('description').not().isEmpty().withMessage('Description is required'),
    body('location').not().isEmpty().withMessage('Location is required'),
    body('phoneNumber').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
    body('category').not().isEmpty().withMessage('Category is required'),
  ],
  createListing
);

// Get listing by id
router.get('/:id', getListingById);

// Update listing
router.put('/:id', auth, updateListing);

// Delete listing
router.delete('/:id', auth, deleteListing);

// Add image to listing - single upload
router.post(
  '/:id/image', 
  auth, 
  upload.single('image'), 
  uploadListingImages
);

// Add multiple images to listing
router.post(
  '/:id/images', 
  auth, 
  upload.array('images', 5), // Max 5 images at once
  uploadListingImages
);

export default router; 