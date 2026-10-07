# CampusHub — AI-Powered Student Community Platform

CampusHub is a full-stack, modular, and locally runnable web application engineered for college students to share ideas, find hackathon teammates, discover upcoming hackathons, access learning resources, and refine project proposals using Google Gemini AI.

---

## 🌟 Key Features

1. **Authentication & User Profiles**:
   - Secure email/password authentication using bcrypt password hashing and JWT token storage.
   - Customizable student profiles with skills, department, college, bio, GitHub, and portfolio links.
   - 1-click Quick Demo Logins for rapid testing (`Alex Morgan`, `Sarah Chen`, `Admin`).

2. **Community Feed**:
   - Share project updates, ask technical questions, and announce opportunities.
   - Filter by categories (`Project`, `Discussion`, `Question`, `Opportunity`), tags, or keywords.
   - Interactive likes, threaded comments, shareable URLs, and content report moderation queue.

3. **AI Idea Lab (Google Gemini API)**:
   - Submit project concepts to generate structured breakdowns:
     - **Refined Problem Statement**
     - **Target User Personas**
     - **Core Suggested Features**
     - **Proposed Technology Stack** (Frontend, Backend, DB, Services)
     - **Implementation Roadmap Milestones** (Phases 1-4)
     - **Edge Cases & Possible Limitations**
   - Direct export/publish button from AI Idea Lab to Community Feed.
   - Includes automatic **Smart Fallback Generator** if no Gemini API key is configured.

4. **Hackathon Explorer**:
   - Filter events by tech domain (`AI/ML`, `Web`, `Mobile`, `CyberSecurity`, `DevOps`, `General`) and mode (`Online`, `In-Person`, `Hybrid`).
   - Direct external registration links and organizer metadata.
   - Add custom hackathon events.

5. **Team Finder & Collaboration**:
   - Create project teams with open roles and required skill badges.
   - Submit join requests with custom pitch messages.
   - Team leader accept/reject workflow with automatic notifications.

6. **Learning Resources**:
   - Categorized resources (`Tutorial`, `Documentation`, `Video`, `Tool`, `Book`).
   - Upvotes and bookmarking functionality.

7. **In-App Notifications**:
   - Live notifications for comments, post likes, team invitations, and request acceptances.

8. **Admin Panel**:
   - Content moderation queue for reported posts.
   - Platform analytics overview (total users, posts, hackathons, teams).

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js REST API, Centralized Error Handling, `express-validator`.
- **Database**: MongoDB with Mongoose Schemas (User, Post, Comment, Event, Team, TeamRequest, Resource, Notification, Report) **with seamless In-Memory / Demo DB fallback** so it runs instantly even if MongoDB is not running locally.
- **AI Integration**: `@google/generative-ai` (Gemini 1.5 Flash) with fallback engine.

---

## 📁 Directory Structure

```
CampusHub/
├── package.json              # Root workspace scripts
├── server/
│   ├── src/
│   │   ├── config/           # MongoDB connection & hybrid fallback
│   │   ├── models/           # Mongoose schemas
│   │   ├── controllers/      # Auth, Post, Event, Team, Resource, Notification, AI, Admin
│   │   ├── routes/           # REST API routes
│   │   ├── middleware/       # JWT auth & Admin role verification
│   │   ├── services/         # Gemini AI SDK & MemoryStore fallback
│   │   ├── seed/             # Database seed script
│   │   └── index.js          # Express app entrypoint
│   ├── tests/                # Integration tests for REST APIs
│   ├── package.json
│   └── .env.example
└── client/
    ├── src/
    │   ├── api/              # Axios client with JWT interceptor
    │   ├── context/          # AuthContext & NotificationContext
    │   ├── components/       # Layout, Navbar, Sidebar, Modals, Cards
    │   ├── pages/            # Landing, Login, Register, Dashboard, Feed, Events, Teams, IdeaLab, Resources, Profile, Settings, Admin
    │   ├── index.css         # Tailwind & custom glassmorphism styles
    │   └── App.jsx           # React Router
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Quick Start Instructions (Windows & VS Code)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** *(Optional)*: Recommended for persistent database storage. If MongoDB is not running, CampusHub automatically switches to **In-Memory Demo Mode**.

---

### Step 1: Install Dependencies

From the root directory (`CampusHub`), run:

```bash
npm run setup
```

Or install in both directories manually:

```bash
cd server && npm install
cd ../client && npm install
```

---

### Step 2: Environment Configuration

Create or verify `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campushub
JWT_SECRET=campushub_jwt_secret_key_2026_super_secure
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Note: If `GEMINI_API_KEY` is left blank, the app will use its built-in Smart AI Generator for the Idea Lab).*

---

### Step 3: Run the Application

To run the backend and frontend concurrently:

#### Option A: Terminal 1 (Backend Server)
```bash
cd server
npm run dev
```
*Backend runs at: `http://localhost:5000`*

#### Option B: Terminal 2 (Frontend Client)
```bash
cd client
npm run dev
```
*Frontend runs at: `http://localhost:3000`*

---

### Step 4: Seed Database (Optional)

To populate a live MongoDB database with fictional student accounts, hackathons, and posts:

```bash
cd server
npm run seed
```

---

### Step 5: Run Automated Tests

To execute backend API integration tests:

```bash
cd server
npm test
```

---

## 🔑 Demo Login Credentials

You can click any of the 1-click quick login buttons on the Login page or use:

- **Student User**: `alex.morgan@campus.edu` / `password123`
- **ML Researcher**: `sarah.chen@campus.edu` / `password123`
- **Platform Admin**: `admin@campushub.edu` / `password123`
