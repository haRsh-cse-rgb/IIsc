import mongoose from 'mongoose';

export interface IEvent extends mongoose.Document {
  title: string;
  type: 'dinner' | 'cultural';
  description: string;
  venue: string;
  startTime: Date;
  endTime: Date;
  rsvpRequired: boolean;
  ticketInfo?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['dinner', 'cultural'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  venue: {
    type: String,
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
  rsvpRequired: {
    type: Boolean,
    default: false
  },
  ticketInfo: {
    type: String
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

eventSchema.index({ startTime: 1 });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

