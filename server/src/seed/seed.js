import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Event } from '../models/Event.js';
import { Team } from '../models/Team.js';
import { TeamRequest } from '../models/TeamRequest.js';
import { Resource } from '../models/Resource.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const seedDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campushub';
  try {
    console.log(`[Seed] Connecting to MongoDB at ${mongoURI}...`);
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Event.deleteMany({});
    await Team.deleteMany({});
    await TeamRequest.deleteMany({});
    await Resource.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Generating password hashes...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('[Seed] Creating fictional student profiles...');
    const alex = await User.create({
      name: 'Alex Morgan',
      email: 'alex.morgan@campus.edu',
      password: hashedPassword,
      college: 'MIT World Peace University',
      department: 'Computer Science & AI',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      bio: 'Full-stack enthusiast & hackathon organizer. Building AI tools for education.',
      skills: ['React', 'Node.js', 'Python', 'Tailwind CSS', 'Gemini AI'],
      interests: ['Artificial Intelligence', 'Hackathons', 'Open Source'],
      githubUrl: 'https://github.com/alex-morgan',
      portfolioUrl: 'https://alexmorgan.dev',
      role: 'student',
    });

    const sarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.chen@campus.edu',
      password: hashedPassword,
      college: 'Stanford Engineering',
      department: 'Data Science & ML',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
      bio: 'Machine Learning researcher working on LLM alignment & multi-modal agents.',
      skills: ['PyTorch', 'Python', 'TensorFlow', 'FastAPI', 'Docker'],
      interests: ['Deep Learning', 'NLP', 'Computer Vision'],
      githubUrl: 'https://github.com/sarah-chen-ml',
      portfolioUrl: 'https://sarahchen.ai',
      role: 'student',
    });

    const admin = await User.create({
      name: 'Admin CampusHub',
      email: 'admin@campushub.edu',
      password: hashedPassword,
      college: 'CampusHub Administration',
      department: 'Platform Moderation',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
      bio: 'Official CampusHub administrator managing platform safety and events.',
      skills: ['System Design', 'Moderation', 'Community Management'],
      interests: ['Tech Communities', 'Student Growth'],
      role: 'admin',
    });

    console.log('[Seed] Creating sample posts...');
    const post1 = await Post.create({
      author: alex._id,
      title: 'Building an AI Study Assistant for College Exams using Gemini 1.5 Pro',
      content: `Hey everyone! Our team is developing CampusMind, an open-source study bot that digests lecture notes, PDFs, and slide decks to generate interactive flashcards and practice quizzes. We are using React + Vite on the frontend and Express + Gemini API on the backend. Looking for feedback and UI/UX contributors!`,
      category: 'Project',
      tags: ['AI', 'React', 'Gemini', 'OpenSource'],
      likes: [sarah._id],
      commentCount: 1,
    });

    await Comment.create({
      post: post1._id,
      author: sarah._id,
      content: 'This sounds awesome! Are you guys using embeddings for PDF querying? Would love to test out your beta.',
    });

    console.log('[Seed] Creating sample hackathons...');
    await Event.create({
      name: 'Global AI Student Hackathon 2026',
      organizer: 'TechInnovate & Google Developer Groups',
      domain: 'AI/ML',
      date: 'Oct 24 - Oct 26, 2026',
      mode: 'Online',
      description: 'Build innovative generative AI solutions for climate tech, education, or healthcare. $15,000 total prize pool!',
      registrationUrl: 'https://devpost.com/hackathons/global-ai-2026',
      locationUrl: 'https://discord.gg/campushub-ai',
      tags: ['AI', 'Gemini', 'Global'],
      createdBy: admin._id,
    });

    console.log('[Seed] Creating sample project teams...');
    const team1 = await Team.create({
      name: 'NeuroCraft AI',
      tagline: 'Building multi-modal AI agents for real-time classroom accessibility',
      description: 'We are competing in the Global AI Student Hackathon. We are looking for a frontend developer strong in React/Tailwind and a UI/UX designer.',
      domain: 'AI/ML',
      leader: alex._id,
      members: [alex._id],
      requiredSkills: ['React', 'Tailwind CSS', 'Figma', 'TypeScript'],
      openRoles: ['Frontend Engineer', 'UI/UX Designer'],
      status: 'Open',
    });

    await TeamRequest.create({
      team: team1._id,
      applicant: sarah._id,
      pitch: 'I have experience building React dashboards and connecting model endpoints. Would love to join NeuroCraft!',
      roleApplied: 'Frontend Engineer',
      status: 'pending',
    });

    console.log('[Seed] Creating sample learning resources...');
    await Resource.create({
      title: 'Complete Guide to Google Gemini API Integration in Node.js',
      category: 'Tutorial',
      domain: 'AI/ML',
      description: 'Step-by-step masterclass on setting up @google/generative-ai SDK with Express backend.',
      url: 'https://ai.google.dev/docs',
      upvotes: [alex._id, sarah._id],
      addedBy: admin._id,
    });

    console.log('✅ [Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
