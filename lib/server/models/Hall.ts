import mongoose from 'mongoose';

export interface IHall extends mongoose.Document {
  name: string;
  code: string;
  capacity: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  capacity: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Hall = mongoose.models.Hall || mongoose.model<IHall>('Hall', hallSchema);

