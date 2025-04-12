import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Category from '../models/Category';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort('name');
    
    res.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { name, slug } = req.body;

    const categoryExists = await Category.findOne({ 
      $or: [{ name }, { slug }] 
    });

    if (categoryExists) {
      res.status(400).json({
        success: false,
        error: 'Category with that name or slug already exists',
      });
      return;
    }

    const category = await Category.create({
      name,
      slug,
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    res.json({
      success: true,
      category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    if (name || slug) {
      const duplicateCategory = await Category.findOne({
        $and: [
          { _id: { $ne: req.params.id } },
          { $or: [
            ...(name ? [{ name }] : []),
            ...(slug ? [{ slug }] : [])
          ]}
        ]
      });

      if (duplicateCategory) {
        res.status(400).json({
          success: false,
          error: 'Category with that name or slug already exists',
        });
        return;
      }
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category removed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
}; 