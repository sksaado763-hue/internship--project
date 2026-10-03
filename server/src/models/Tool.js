import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 280 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  icon: { type: String, trim: true, default: 'Wrench' },
  tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
  isPopular: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  processingType: { type: String, enum: ['client', 'server'], default: 'client' },
}, { timestamps: true });

toolSchema.index({ name: 'text', description: 'text', tags: 'text' });
toolSchema.index({ isActive: 1, isPopular: -1, createdAt: -1 });

export default mongoose.models.Tool ?? mongoose.model('Tool', toolSchema);
