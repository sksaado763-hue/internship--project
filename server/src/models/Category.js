import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 240, default: '' },
  icon: { type: String, trim: true, default: 'Boxes' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ isActive: 1, name: 1 });

export default mongoose.models.Category ?? mongoose.model('Category', categorySchema);
