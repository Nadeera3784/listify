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

router.get('/', getListings);

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

router.get('/:id', getListingById);

router.put('/:id', auth, updateListing);

router.delete('/:id', auth, deleteListing);

router.post(
  '/:id/image', 
  auth, 
  upload.single('image'), 
  uploadListingImages
);


router.post(
  '/:id/images', 
  auth, 
  upload.array('images', 5), 
  uploadListingImages
);

export default router; 