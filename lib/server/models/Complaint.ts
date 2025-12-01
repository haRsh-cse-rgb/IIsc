import mongoose from 'mongoose';

export interface IComplaint extends mongoose.Document {
  category: 'transport' | 'guesthouse' | 'cleaning' | 'presentation' | 'other';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  contactEmail?: string;
  contactPhone?: string;
  attachments: string[];
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: mongoose.Types.ObjectId;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['transport', 'guesthouse', 'cleaning', 'presentation', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    type: String
  }
}, {
  timestamps: true
});

complaintSchema.index({ status: 1, priority: -1 });
complaintSchema.index({ createdAt: -1 });

export const Complaint = mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', complaintSchema);

