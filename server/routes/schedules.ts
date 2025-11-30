import express from 'express';
import { Schedule } from '../models/Schedule.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createAuditLog } from '../middleware/auditLog.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { hall, status, day, tags } = req.query;
    const query: any = {};

    if (hall) query.hall = hall;
    if (status) query.status = status;
    if (tags) query.tags = { $in: (tags as string).split(',') };

    if (day) {
      const startOfDay = new Date(day as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day as string);
      endOfDay.setHours(23, 59, 59, 999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const schedules = await Schedule.find(query)
      .populate('hall', 'name code location')
      .sort({ startTime: 1 });

    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('hall', 'name code location');

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

router.post('/',
  authenticate,
  authorize('admin'),
  body('title').trim().notEmpty(),
  body('authors').trim().notEmpty(),
  body('hall').notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  createAuditLog('create', 'schedule'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const schedule = await Schedule.create(req.body);
      const populated = await schedule.populate('hall', 'name code location');

      req.app.get('io').emit('schedule:new', populated);

      res.status(201).json(populated);
    } catch (error) {
      console.error('Create schedule error:', error);
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  }
);

router.put('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('update', 'schedule'),
  async (req, res) => {
    try {
      const schedule = await Schedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('hall', 'name code location');

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      req.app.get('io').emit('schedule:update', schedule);

      res.json(schedule);
    } catch (error) {
      console.error('Update schedule error:', error);
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  }
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('delete', 'schedule'),
  async (req, res) => {
    try {
      const schedule = await Schedule.findByIdAndDelete(req.params.id);

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      req.app.get('io').emit('schedule:delete', { id: req.params.id });

      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error('Delete schedule error:', error);
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  }
);

export default router;
