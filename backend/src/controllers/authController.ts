import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import generateToken from '../utils/generateToken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ 
        success: false,
        error: 'User already exists' 
      });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id as string,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken((user._id as unknown as string).toString()),
        },
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: 'Invalid user data' 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message || 'Server error' 
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        user: {
          _id: user._id as string,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken((user._id as unknown as string).toString()),
        },
      });
    } else {
      res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message || 'Server error' 
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    } else {
      res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message || 'Server error' 
    });
  }
}; 