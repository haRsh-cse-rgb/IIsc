import express from 'express';
import { Event } from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createAuditLog } from '../middleware/auditLog.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, upcoming } = req.query;
    const query: any = {};

    if (type) query.type = type;
    if (upcoming === 'true') {
      query.startTime = { $gte: new Date() };
    }

    const events = await Event.find(query).sort({ startTime: 1 });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.post('/',
  authenticate,
  authorize('admin'),
  body('title').trim().notEmpty(),
  body('type').isIn(['dinner', 'cultural']),
  body('description').trim().notEmpty(),
  body('venue').trim().notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  createAuditLog('create', 'event'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Event.create(req.body);

      req.app.get('io').emit('event:new', event);

      res.status(201).json(event);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

router.put('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('update', 'event'),
  async (req, res) => {
    try {
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      req.app.get('io').emit('event:update', event);

      res.json(event);
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  }
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  createAuditLog('delete', 'event'),
  async (req, res) => {
    try {
      const event = await Event.findByIdAndDelete(req.params.id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      req.app.get('io').emit('event:delete', { id: req.params.id });

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  }
);

export default router;
