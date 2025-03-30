import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { auth, admin } from '../middlewares/auth';

const router = express.Router();

// Get all categories
router.get('/', getCategories);

// Create a new category (admin only)
router.post(
  '/',
  [
    auth,
    admin,
    body('name').not().isEmpty().withMessage('Category name is required'),
    body('slug').not().isEmpty().withMessage('Category slug is required'),
  ],
  createCategory
);

// Get category by id
router.get('/:id', getCategoryById);

// Update category (admin only)
router.put('/:id', [auth, admin], updateCategory);

// Delete category (admin only)
router.delete('/:id', [auth, admin], deleteCategory);

export default router; 