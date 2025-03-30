import { Request, Response, NextFunction } from 'express';
import { auth } from './auth';

// Admin middleware (checks if user is admin)
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  // First check if user is authenticated
  await auth(req, res, (err) => {
    if (err) return next(err);
    
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Admin privileges required'
      });
    }
    
    next();
  });
}; 