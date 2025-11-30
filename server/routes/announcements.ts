import express from 'express';
import { Announcement } from '../models/Announcement.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createAuditLog } from '../middleware/auditLog.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, priority, limit = '50' } = req.query;
    const query: any = {};

    if (type) query.type = type;
    if (priority) query.priority = priority;

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string));

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

router.post('/',
  authenticate,
  authorize('admin', 'volunteer'),
  body('title').trim().notEmpty(),
  body('type').isIn(['announcement', 'alert', 'transport', 'dinner', 'cultural']),
  body('priority').isIn(['normal', 'high', 'urgent']),
  body('content').trim().notEmpty(),
  createAuditLog('create', 'announcement'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const announcement = await Announcement.create({
        ...req.body,
        createdBy: req.user!.userId
      });

      const populated = await announcement.populate('createdBy', 'name email');

      req.app.get('io').emit('announcement:new', populated);

      res.status(201).json(populated);
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ error: 'Failed to create announcement' });
    }
  }
);

router.put('/:id',
  authenticate,
  authorize('admin', 'volunteer'),
  createAuditLog('update', 'announcement'),
  async (req, res) => {
    try {
      const announcement = await Announcement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      req.app.get('io').emit('announcement:update', announcement);

      res.json(announcement);
    } catch (error) {
      console.error('Update announcement error:', error);
      res.status(500).json({ error: 'Failed to update announcement' });
    }
  }
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('delete', 'announcement'),
  async (req, res) => {
    try {
      const announcement = await Announcement.findByIdAndDelete(req.params.id);

      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }

      req.app.get('io').emit('announcement:delete', { id: req.params.id });

      res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      console.error('Delete announcement error:', error);
      res.status(500).json({ error: 'Failed to delete announcement' });
    }
  }
);

export default router;
