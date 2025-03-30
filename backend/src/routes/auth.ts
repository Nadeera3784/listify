import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController';
import { auth } from '../middlewares/auth';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  registerUser
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  loginUser
);

// Get current user
router.get('/me', auth, getUserProfile);

export default router; 