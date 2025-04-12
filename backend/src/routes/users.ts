import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import { auth } from '../middlewares/auth';
import { adminAuth } from '../middlewares/adminAuth';

const router = express.Router();

router.get('/', auth, adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', auth, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('isAdmin').optional().isBoolean().withMessage('isAdmin must be a boolean')
], async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      res.status(403).json({ success: false, error: 'Not authorized' });
      return;
    }
    
    if (!req.user.isAdmin && req.body.isAdmin !== undefined) {
      res.status(403).json({ success: false, error: 'Not authorized to change admin status' });
      return;
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.isAdmin !== undefined && req.user.isAdmin) {
      user.isAdmin = req.body.isAdmin;
    }
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', auth, adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router; 