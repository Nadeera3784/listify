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

router.get('/', getCategories);

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

router.get('/:id', getCategoryById);

router.put('/:id', [auth, admin], updateCategory);

router.delete('/:id', [auth, admin], deleteCategory);

export default router; 