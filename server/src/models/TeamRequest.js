import mongoose from 'mongoose';

const teamRequestSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pitch: { type: String, required: true, trim: true },
    roleApplied: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

teamRequestSchema.index({ team: 1, applicant: 1 }, { unique: true });

export const TeamRequest = mongoose.model('TeamRequest', teamRequestSchema);
