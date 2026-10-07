import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    organizer: { type: String, required: true, trim: true },
    domain: {
      type: String,
      enum: ['Web', 'AI/ML', 'Mobile', 'DevOps', 'CyberSecurity', 'General'],
      default: 'General',
    },
    date: { type: String, required: true },
    mode: { type: String, enum: ['Online', 'In-Person', 'Hybrid'], default: 'Online' },
    description: { type: String, required: true },
    registrationUrl: { type: String, required: true },
    locationUrl: { type: String, default: '' },
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);
