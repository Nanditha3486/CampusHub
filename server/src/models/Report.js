import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: { type: String, enum: ['post', 'comment', 'team'], required: true },
    targetId: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
