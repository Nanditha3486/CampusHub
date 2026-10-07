import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Tutorial', 'Documentation', 'Video', 'Tool', 'Book'],
      default: 'Tutorial',
    },
    domain: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Resource = mongoose.model('Resource', resourceSchema);
