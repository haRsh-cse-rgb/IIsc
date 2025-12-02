import mongoose from 'mongoose';

export interface IMenu extends mongoose.Document {
  day: number; // 1, 2, or 3
  mealType: 'breakfast' | 'lunch' | 'tea';
  items: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const menuSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'tea'],
    required: true
  },
  items: [{
    type: String,
    required: true,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure unique combination of day and mealType
menuSchema.index({ day: 1, mealType: 1 }, { unique: true });

export const Menu = mongoose.models.Menu || mongoose.model<IMenu>('Menu', menuSchema);



