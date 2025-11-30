import express from 'express';
import { User } from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createAuditLog } from '../middleware/auditLog.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });

      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('update', 'user'),
  async (req, res) => {
    try {
      const { password, ...updateData } = req.body;

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('delete', 'user'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

export default router;
