import mongoose from 'mongoose';

export interface ITechnicalSession extends mongoose.Document {
  title: string;
  code: string;
  day: string; // ISO date string e.g. 2025-12-10
  startTime: Date;
  endTime: Date;
  hall: mongoose.Types.ObjectId;
  chairName?: string;
  chairTitle?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const technicalSessionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  day: { type: String, required: true, trim: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  chairName: { type: String, trim: true },
  chairTitle: { type: String, trim: true },
  description: { type: String, trim: true },
}, {
  timestamps: true,
});

technicalSessionSchema.index({ day: 1, hall: 1 });
technicalSessionSchema.index({ code: 1 }, { unique: false });

export const TechnicalSession = mongoose.models.TechnicalSession || mongoose.model<ITechnicalSession>('TechnicalSession', technicalSessionSchema);

