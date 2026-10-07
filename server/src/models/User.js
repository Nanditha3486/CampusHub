import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    college: { type: String, default: 'MIT World Peace University' },
    department: { type: String, default: 'Computer Science' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: 'Passionate student exploring tech & innovation.' },
    skills: [{ type: String }],
    interests: [{ type: String }],
    githubUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    bookmarkedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
