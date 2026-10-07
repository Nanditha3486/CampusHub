import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    domain: { type: String, default: 'Web Development' },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    requiredSkills: [{ type: String }],
    openRoles: [{ type: String }],
    status: { type: String, enum: ['Open', 'Full', 'Closed'], default: 'Open' },
  },
  { timestamps: true }
);

export const Team = mongoose.model('Team', teamSchema);
