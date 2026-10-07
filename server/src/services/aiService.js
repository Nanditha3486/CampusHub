import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateProjectIdeaAnalysis = async ({ title, description, domain, targetAudience }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a senior tech mentor and software architect.
A college student is proposing a software project:
- Title: "${title}"
- Description: "${description}"
- Target Domain: "${domain || 'Web/AI'}"
- Intended Audience: "${targetAudience || 'College Students'}"

Analyze this project proposal and generate a structured JSON object response ONLY (no markdown backticks, raw valid JSON string) with the following structure:
{
  "problemStatement": "Clear, concise 2-3 sentence problem breakdown",
  "targetUsers": ["Persona 1", "Persona 2", "Persona 3"],
  "suggestedFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "proposedTechStack": [
    {"category": "Frontend", "technology": "React, Vite, Tailwind CSS"},
    {"category": "Backend", "technology": "Node.js, Express, REST API"},
    {"category": "Database", "technology": "MongoDB / PostgreSQL"},
    {"category": "AI / Services", "technology": "Gemini API"}
  ],
  "implementationMilestones": [
    {"phase": "Phase 1: MVP Setup", "goal": "Core UI & authentication setup"},
    {"phase": "Phase 2: Core Features", "goal": "Main application workflow & APIs"},
    {"phase": "Phase 3: Integration & Polish", "goal": "AI features & UI refinements"}
  ],
  "possibleLimitations": ["Edge case 1", "Scalability challenge 2", "API rate limits or data security"]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Clean possible markdown code fence
      const cleanJsonStr = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      const parsedData = JSON.parse(cleanJsonStr);

      return {
        ...parsedData,
        isDemoFallback: false,
        aiModelUsed: 'Google Gemini 1.5 Flash',
      };
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed or key error. Falling back to Smart AI Generator:', err.message);
    }
  }

  // Smart Fallback Generator when GEMINI_API_KEY is not configured
  return getSmartFallbackAnalysis(title, description, domain, targetAudience);
};

function getSmartFallbackAnalysis(title, description, domain = 'General', targetAudience = 'Students') {
  const safeTitle = title || 'Student Project';
  const cleanDomain = domain || 'Web & AI Technology';

  return {
    problemStatement: `Students and users often struggle with fragmented tools when attempting to "${description.slice(0, 80)}...". Existing solutions lack intuitive real-time collaboration, leading to low engagement and high drop-off rates.`,
    targetUsers: [
      `${targetAudience || 'College Students'} looking for streamlined tools`,
      'Hackathon participants needing rapid prototyping capabilities',
      'Academic mentors monitoring student team progress',
    ],
    suggestedFeatures: [
      `Interactive Dashboard tailored for ${safeTitle}`,
      'Real-time collaborative workspace with role-based access control',
      `Smart AI recommendation engine for ${cleanDomain}`,
      'Automated notifications and activity tracking feed',
    ],
    proposedTechStack: [
      { category: 'Frontend', technology: 'React, Vite, Tailwind CSS, Lucide Icons' },
      { category: 'Backend', technology: 'Node.js, Express.js, JWT Authentication' },
      { category: 'Database', technology: 'MongoDB with Mongoose (with fallback)' },
      { category: 'AI & Services', technology: 'Google Gemini API / Custom REST Pipeline' },
    ],
    implementationMilestones: [
      { phase: 'Phase 1: Architecture & Auth', goal: 'Establish frontend design system, REST API routes, and user profile management.' },
      { phase: 'Phase 2: Core Functional Engine', goal: `Implement core logic for ${safeTitle} with modular component state.` },
      { phase: 'Phase 3: AI Augmentation', goal: 'Integrate intelligent prompt engineering and real-time user feedback.' },
      { phase: 'Phase 4: Optimization & Launch', goal: 'Perform end-to-end testing, deploy to production, and monitor API performance.' },
    ],
    possibleLimitations: [
      'High client-side render load when displaying large real-time datasets without pagination.',
      'API rate limits for third-party AI LLM endpoints during peak traffic.',
      'Ensuring strict data validation across non-relational database schemas.',
    ],
    isDemoFallback: true,
    aiModelUsed: 'CampusHub AI Engine (Demo Mode - Add GEMINI_API_KEY to .env for live Gemini output)',
  };
}
