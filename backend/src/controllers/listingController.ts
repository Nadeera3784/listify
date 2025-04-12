import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Listing from '../models/Listing';

export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search
      ? {
          $or: [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { location: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const user = req.query.user ? { user: req.query.user } : {};
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const listings = await Listing.find({ ...search, ...category, ...user })
      .populate('user', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Listing.countDocuments({ ...search, ...category, ...user });

    res.json({
      success: true,
      listings,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

export const createListing = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const listing = await Listing.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      listing,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'name')
      .populate('category', 'name');

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
      return;
    }

    res.json({
      success: true,
      listing,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

export const updateListing = async (req: Request, res: Response): Promise<void> => {
  try {
    let listing = await Listing.findById(req.params.id);

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

    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      listing,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
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
        error: 'Not authorized to delete this listing',
      });
      return;
    }

    await listing.deleteOne();

    res.json({
      success: true,
      message: 'Listing removed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
}; 