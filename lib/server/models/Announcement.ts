import mongoose from 'mongoose';

export interface IAnnouncement extends mongoose.Document {
  title: string;
  type: 'announcement' | 'alert' | 'transport' | 'dinner' | 'cultural';
  priority: 'normal' | 'high' | 'urgent';
  content: string;
  link?: string;
  file?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['announcement', 'alert', 'transport', 'dinner', 'cultural'],
    required: true
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  content: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  file: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', announcementSchema);

