import express from 'express';
import { Complaint } from '../models/Complaint.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createAuditLog } from '../middleware/auditLog.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('assignedTo', 'name email')
      .sort({ priority: -1, createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .select('category priority status createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(complaints);
  } catch (error) {
    console.error('Get public complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

router.post('/',
  body('category').isIn(['transport', 'guesthouse', 'cleaning', 'presentation', 'other']),
  body('priority').isIn(['low', 'medium', 'high']),
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const complaint = await Complaint.create(req.body);

      req.app.get('io').emit('complaint:new', complaint);

      res.status(201).json(complaint);
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ error: 'Failed to create complaint' });
    }
  }
);

router.put('/:id',
  authenticate,
  authorize('admin', 'volunteer'),
  createAuditLog('update', 'complaint'),
  async (req, res) => {
    try {
      const complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email');

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      req.app.get('io').emit('complaint:update', complaint);

      res.json(complaint);
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({ error: 'Failed to update complaint' });
    }
  }
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('delete', 'complaint'),
  async (req, res) => {
    try {
      const complaint = await Complaint.findByIdAndDelete(req.params.id);

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
      console.error('Delete complaint error:', error);
      res.status(500).json({ error: 'Failed to delete complaint' });
    }
  }
);

export default router;
