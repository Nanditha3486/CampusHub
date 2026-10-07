import bcrypt from 'bcryptjs';

class MemoryStore {
  constructor() {
    this.users = [];
    this.posts = [];
    this.comments = [];
    this.events = [];
    this.teams = [];
    this.teamRequests = [];
    this.resources = [];
    this.notifications = [];
    this.reports = [];
    this.initialized = false;
  }

  generateId() {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Fictional Students
    const u1 = {
      _id: 'user_alex_1',
      id: 'user_alex_1',
      name: 'Alex Morgan',
      email: 'alex.morgan@campus.edu',
      password: hashedPassword,
      college: 'MIT World Peace University',
      department: 'Computer Science & AI',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      bio: 'Full-stack enthusiast & hackathon organizer. Building AI tools for education.',
      skills: ['React', 'Node.js', 'Python', 'Tailwind CSS', 'Gemini AI'],
      interests: ['Artificial Intelligence', 'Hackathons', 'Open Source', 'UI/UX Design'],
      githubUrl: 'https://github.com/alex-morgan',
      portfolioUrl: 'https://alexmorgan.dev',
      role: 'student',
      savedPosts: ['post_1'],
      bookmarkedResources: ['res_1'],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    };

    const u2 = {
      _id: 'user_sarah_2',
      id: 'user_sarah_2',
      name: 'Sarah Chen',
      email: 'sarah.chen@campus.edu',
      password: hashedPassword,
      college: 'Stanford Engineering',
      department: 'Data Science & ML',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
      bio: 'Machine Learning researcher working on LLM alignment & multi-modal agents.',
      skills: ['PyTorch', 'Python', 'TensorFlow', 'FastAPI', 'Docker'],
      interests: ['Deep Learning', 'NLP', 'Computer Vision', 'Data Analysis'],
      githubUrl: 'https://github.com/sarah-chen-ml',
      portfolioUrl: 'https://sarahchen.ai',
      role: 'student',
      savedPosts: [],
      bookmarkedResources: ['res_2'],
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    };

    const u3 = {
      _id: 'user_admin_3',
      id: 'user_admin_3',
      name: 'Admin CampusHub',
      email: 'admin@campushub.edu',
      password: hashedPassword,
      college: 'CampusHub Administration',
      department: 'Platform Moderation',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
      bio: 'Official CampusHub administrator managing platform safety, events, and curated learning hubs.',
      skills: ['System Design', 'Moderation', 'Community Management'],
      interests: ['Tech Communities', 'Student Growth', 'Hackathon Sponsorships'],
      githubUrl: 'https://github.com/campushub-admin',
      portfolioUrl: 'https://campushub.edu',
      role: 'admin',
      savedPosts: [],
      bookmarkedResources: [],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };

    this.users.push(u1, u2, u3);

    // 2. Fictional Community Posts
    const p1 = {
      _id: 'post_1',
      id: 'post_1',
      author: u1,
      title: 'Building an AI Study Assistant for College Exams using Gemini 1.5 Pro',
      content: `Hey everyone! Our team is developing CampusMind, an open-source study bot that digests lecture notes, PDFs, and slide decks to generate interactive flashcards and practice quizzes. We are using React + Vite on the frontend and Express + Gemini API on the backend. Looking for feedback and UI/UX contributors!`,
      category: 'Project',
      tags: ['AI', 'React', 'Gemini', 'OpenSource'],
      likes: ['user_sarah_2'],
      commentCount: 2,
      savedBy: ['user_alex_1'],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    };

    const p2 = {
      _id: 'post_2',
      id: 'post_2',
      author: u2,
      title: 'Which Web Framework do you prefer for 24-Hour Hackathons: Vite vs Next.js?',
      content: `In rapid 24-hour hackathons, speed of iteration is everything. Vite + React gives ultra-fast HMR and minimal setup overhead, while Next.js offers SSR and API routes built-in. What has been your experience when shipping under pressure?`,
      category: 'Discussion',
      tags: ['React', 'Nextjs', 'Vite', 'Hackathons'],
      likes: ['user_alex_1'],
      commentCount: 1,
      savedBy: [],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    };

    this.posts.push(p1, p2);

    // 3. Comments
    this.comments.push(
      {
        _id: 'comment_1',
        id: 'comment_1',
        post: 'post_1',
        author: u2,
        content: 'This sounds awesome! Are you guys using embeddings for PDF querying? Would love to test out your beta.',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        _id: 'comment_2',
        id: 'comment_2',
        post: 'post_1',
        author: u1,
        content: 'Yes! We use vector embeddings with Gemini for contextual RAG. DM me if you want early access!',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
      {
        _id: 'comment_3',
        id: 'comment_3',
        post: 'post_2',
        author: u1,
        content: 'Vite + React + Express API backend is my absolute go-to for hackathons. Zero configuration hassle!',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    );

    // 4. Hackathons / Events
    this.events.push(
      {
        _id: 'event_1',
        id: 'event_1',
        name: 'Global AI Student Hackathon 2026',
        organizer: 'TechInnovate & Google Developer Groups',
        domain: 'AI/ML',
        date: 'Oct 24 - Oct 26, 2026',
        mode: 'Online',
        description: 'Build innovative generative AI solutions for climate tech, education, or healthcare. $15,000 total prize pool!',
        registrationUrl: 'https://devpost.com/hackathons/global-ai-2026',
        locationUrl: 'https://discord.gg/campushub-ai',
        tags: ['AI', 'Gemini', 'Global', 'CashPrizes'],
        createdBy: u3._id,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        _id: 'event_2',
        id: 'event_2',
        name: 'Campus CodeSprint 2026',
        organizer: 'Department of Computer Science',
        domain: 'Web',
        date: 'Nov 12, 2026',
        mode: 'In-Person',
        description: 'An intense 12-hour coding marathon on campus. Free food, swag bags, and networking with top tech recruiters.',
        registrationUrl: 'https://campushub.edu/codesprint',
        locationUrl: 'Auditorium Hall B, Main Campus',
        tags: ['WebDev', 'InPerson', 'CampusEvent'],
        createdBy: u3._id,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      }
    );

    // 5. Teams
    this.teams.push(
      {
        _id: 'team_1',
        id: 'team_1',
        name: 'NeuroCraft AI',
        tagline: 'Building multi-modal AI agents for real-time classroom accessibility',
        description: 'We are competing in the Global AI Student Hackathon. We are looking for a frontend developer strong in React/Tailwind and a UI/UX designer.',
        domain: 'AI/ML',
        leader: u1,
        members: [u1],
        requiredSkills: ['React', 'Tailwind CSS', 'Figma', 'TypeScript'],
        openRoles: ['Frontend Engineer', 'UI/UX Designer'],
        status: 'Open',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        _id: 'team_2',
        id: 'team_2',
        name: 'CyberShield',
        tagline: 'Automated vulnerability scanner for student web apps',
        description: 'Building a lightweight web scanner that checks common OWASP top 10 vulnerabilities in student projects.',
        domain: 'CyberSecurity',
        leader: u2,
        members: [u2],
        requiredSkills: ['Python', 'Docker', 'Web Security'],
        openRoles: ['Backend Specialist'],
        status: 'Open',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      }
    );

    // 6. Team Requests
    this.teamRequests.push({
      _id: 'req_1',
      id: 'req_1',
      team: 'team_1',
      applicant: u2,
      pitch: 'I have experience building React dashboards and connecting PyTorch model outputs to REST APIs. Would love to join NeuroCraft!',
      roleApplied: 'Frontend Engineer',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    });

    // 7. Learning Resources
    this.resources.push(
      {
        _id: 'res_1',
        id: 'res_1',
        title: 'Complete Guide to Google Gemini API Integration in Node.js',
        category: 'Tutorial',
        domain: 'AI/ML',
        description: 'Step-by-step masterclass on setting up @google/generative-ai SDK with Express backend and streaming responses.',
        url: 'https://ai.google.dev/docs',
        upvotes: ['user_alex_1', 'user_sarah_2'],
        bookmarkedBy: ['user_alex_1'],
        addedBy: u3._id,
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        _id: 'res_2',
        id: 'res_2',
        title: 'Modern React Architecture & Custom Hooks Handbook',
        category: 'Documentation',
        domain: 'Web',
        description: 'Best practices for organizing production-grade React codebases, managing global context, and custom API hooks.',
        url: 'https://react.dev/learn',
        upvotes: ['user_sarah_2'],
        bookmarkedBy: ['user_sarah_2'],
        addedBy: u3._id,
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      }
    );

    // 8. Notifications
    this.notifications.push(
      {
        _id: 'notif_1',
        id: 'notif_1',
        recipient: 'user_alex_1',
        sender: u2,
        type: 'comment',
        title: 'New Comment on Your Post',
        message: 'Sarah Chen commented on your post "Building an AI Study Assistant..."',
        link: '/community',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        _id: 'notif_2',
        id: 'notif_2',
        recipient: 'user_alex_1',
        sender: u2,
        type: 'team_invite',
        title: 'New Team Join Request',
        message: 'Sarah Chen submitted a request to join your team "NeuroCraft AI"',
        link: '/teams',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      }
    );

    console.log('[MemoryStore] Seed data populated successfully.');
  }
}

export const memoryStore = new MemoryStore();
