import express from 'express';
import { Hall } from '../models/Hall.js';
import { Schedule } from '../models/Schedule.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createAuditLog } from '../middleware/auditLog.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const halls = await Hall.find().sort({ code: 1 });
    res.json(halls);
  } catch (error) {
    console.error('Get halls error:', error);
    res.status(500).json({ error: 'Failed to fetch halls' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const halls = await Hall.find();
    const now = new Date();

    const hallStatuses = await Promise.all(
      halls.map(async (hall) => {
        const current = await Schedule.findOne({
          hall: hall._id,
          startTime: { $lte: now },
          endTime: { $gt: now },
          status: { $ne: 'cancelled' }
        });

        const next = await Schedule.findOne({
          hall: hall._id,
          startTime: { $gt: now },
          status: { $ne: 'cancelled' }
        }).sort({ startTime: 1 });

        return {
          hall: {
            id: hall._id,
            name: hall.name,
            code: hall.code,
            location: hall.location
          },
          current: current || null,
          next: next || null,
          timeRemaining: current
            ? Math.max(0, Math.floor((current.endTime.getTime() - now.getTime()) / 60000))
            : null
        };
      })
    );

    res.json(hallStatuses);
  } catch (error) {
    console.error('Get hall status error:', error);
    res.status(500).json({ error: 'Failed to fetch hall status' });
  }
});

router.post('/',
  authenticate,
  authorize('admin'),
  createAuditLog('create', 'hall'),
  async (req, res) => {
    try {
      const hall = await Hall.create(req.body);
      res.status(201).json(hall);
    } catch (error) {
      console.error('Create hall error:', error);
      res.status(500).json({ error: 'Failed to create hall' });
    }
  }
);

router.put('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('update', 'hall'),
  async (req, res) => {
    try {
      const hall = await Hall.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!hall) {
        return res.status(404).json({ error: 'Hall not found' });
      }

      res.json(hall);
    } catch (error) {
      console.error('Update hall error:', error);
      res.status(500).json({ error: 'Failed to update hall' });
    }
  }
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('delete', 'hall'),
  async (req, res) => {
    try {
      const hall = await Hall.findByIdAndDelete(req.params.id);

      if (!hall) {
        return res.status(404).json({ error: 'Hall not found' });
      }

      res.json({ message: 'Hall deleted successfully' });
    } catch (error) {
      console.error('Delete hall error:', error);
      res.status(500).json({ error: 'Failed to delete hall' });
    }
  }
);

export default router;
