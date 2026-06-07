import mongoose from 'mongoose';

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  value: { type: Number, required: true, min: 0 },
  stage: { type: String, enum: STAGES, default: 'lead' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expectedCloseDate: { type: Date, default: null },
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

dealSchema.statics.STAGES = STAGES;

export default mongoose.model('Deal', dealSchema);
