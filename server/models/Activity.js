import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deal_created', 'deal_stage_changed', 'deal_updated', 'deal_deleted', 'contact_created', 'note_added'],
    required: true,
  },
  description: { type: String, required: true },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', default: null },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
