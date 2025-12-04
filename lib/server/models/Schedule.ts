import mongoose from 'mongoose';

export interface ISchedule extends mongoose.Document {
  title: string;
  authors: string;
  hall: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags: string[];
  slideLink?: string;
  description?: string;
  isPlenary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  authors: {
    type: String,
    required: true,
    trim: true
  },
  hall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  tags: [{
    type: String,
    trim: true
  }],
  slideLink: {
    type: String
  },
  description: {
    type: String
  },
  isPlenary: {
    type: Boolean,
    default: false,
    required: false
  }
}, {
  timestamps: true
});

scheduleSchema.index({ startTime: 1, hall: 1 });
scheduleSchema.index({ status: 1 });

export const Schedule = mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', scheduleSchema);

