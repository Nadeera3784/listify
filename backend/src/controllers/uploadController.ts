import { Request, Response } from 'express';
import Listing from '../models/Listing';

export const uploadListingImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file && !req.files) {
      res.status(400).json({
        success: false,
        error: 'Please upload at least one file',
      });
      return;
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
      return;
    }

    if (listing.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to update this listing',
      });
      return;
    }

    const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5001';

    let imageUrls = [];

    if (req.file) {
      const fileUrl = `${serverBaseUrl}/uploads/${req.file.filename}`;
      imageUrls.push(fileUrl);
    }

    if (req.files && Array.isArray(req.files)) {
      imageUrls = req.files.map((file) => `${serverBaseUrl}/uploads/${file.filename}`);
    }

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

export const uploadAuctionImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Please upload at least one file',
      });
      return;
    }

    const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5001';

    const imageUrls = req.files.map((file) => `${serverBaseUrl}/uploads/${file.filename}`);

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