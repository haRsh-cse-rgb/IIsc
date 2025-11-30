import express from 'express';
import { Schedule } from '../models/Schedule.js';
import { Complaint } from '../models/Complaint.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const convertToCSV = (data: any[], headers: string[]): string => {
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] !== undefined ? row[header] : '';
      const escaped = ('' + value).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

router.get('/schedules',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const schedules = await Schedule.find()
        .populate('hall', 'name code')
        .sort({ startTime: 1 });

      const data = schedules.map(s => ({
        title: s.title,
        authors: s.authors,
        hall: s.hall?.name || '',
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        status: s.status,
        tags: s.tags.join('; '),
        slideLink: s.slideLink || ''
      }));

      const headers = ['title', 'authors', 'hall', 'startTime', 'endTime', 'status', 'tags', 'slideLink'];
      const csv = convertToCSV(data, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=schedules.csv');
      res.send(csv);
    } catch (error) {
      console.error('Export schedules error:', error);
      res.status(500).json({ error: 'Failed to export schedules' });
    }
  }
);

router.get('/complaints',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const complaints = await Complaint.find()
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });

      const data = complaints.map(c => ({
        category: c.category,
        priority: c.priority,
        title: c.title,
        description: c.description,
        status: c.status,
        assignedTo: c.assignedTo?.name || '',
        contactEmail: c.contactEmail || '',
        contactPhone: c.contactPhone || '',
        response: c.response || '',
        createdAt: c.createdAt.toISOString()
      }));

      const headers = ['category', 'priority', 'title', 'description', 'status', 'assignedTo', 'contactEmail', 'contactPhone', 'response', 'createdAt'];
      const csv = convertToCSV(data, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
      res.send(csv);
    } catch (error) {
      console.error('Export complaints error:', error);
      res.status(500).json({ error: 'Failed to export complaints' });
    }
  }
);

export default router;
