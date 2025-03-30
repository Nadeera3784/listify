import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ success: false, error: 'No token, authorization denied' });
      return;
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Get user from payload
    const user = await User.findById((decoded as any).id).select('-password');
    
    if (!user) {
      res.status(401).json({ success: false, error: 'Token is not valid' });
      return;
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ success: false, error: 'Token is not valid' });
  }
};

// Admin middleware
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Not authorized as an admin'
    });
  }
}; 