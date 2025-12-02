import mongoose from 'mongoose';

export interface IEvent extends mongoose.Document {
  title: string;
  type: string; // Allow any string type
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
    required: true,
    trim: true
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

// Ensure the type field doesn't have enum validation
// If the model already exists, update the schema path
if (mongoose.models.Event) {
  const existingSchema = mongoose.models.Event.schema;
  const typePath = existingSchema.path('type');
  if (typePath && typePath.enumValues) {
    // Remove enum validation by updating the path
    typePath.enumValues = undefined;
    typePath.enum = undefined;
  }
}

// Delete and recreate the model to ensure fresh schema
if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

export const Event = mongoose.model<IEvent>('Event', eventSchema);

