import { Request, Response } from 'express';
import Listing from '../models/Listing';
import Auction from '../models/Auction';

// @desc    Upload images to listing
// @route   POST /api/listings/:id/images
// @access  Private
export const uploadListingImages = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file(s) was uploaded
    if (!req.file && !req.files) {
      res.status(400).json({
        success: false,
        error: 'Please upload at least one file',
      });
      return;
    }

    // Find the listing
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
      return;
    }

    // Check if user is the owner of the listing
    if (listing.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to update this listing',
      });
      return;
    }

    // Get the server base URL from environment or use default
    const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5001';

    // Build the image URLs
    let imageUrls = [];

    // Handle single file upload
    if (req.file) {
      const fileUrl = `${serverBaseUrl}/uploads/${req.file.filename}`;
      imageUrls.push(fileUrl);
    }

    // Handle multiple file uploads
    if (req.files && Array.isArray(req.files)) {
      imageUrls = req.files.map((file) => `${serverBaseUrl}/uploads/${file.filename}`);
    }

    // Add new images to the listing's imageUrls array
    listing.imageUrls = [...listing.imageUrls, ...imageUrls];
    await listing.save();

    res.json({
      success: true,
      imageUrls,
      listing,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// @desc    Upload images to auction
// @route   POST /api/auctions/with-images
// @access  Private
export const uploadAuctionImages = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file(s) was uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Please upload at least one file',
      });
      return;
    }

    // Get the server base URL from environment or use default
    const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5001';

    // Build the image URLs
    const imageUrls = req.files.map((file) => `${serverBaseUrl}/uploads/${file.filename}`);

    // Return the image URLs
    res.json({
      success: true,
      imageUrls,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
}; 