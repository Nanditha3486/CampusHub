import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  Users,
  Trophy,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
} from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Landing Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
            Campus<span className="text-indigo-400">Hub</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-xs font-semibold rounded-xl gradient-bg text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition-opacity"
          >
            Join Platform
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI-Powered Student Community Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Connect, Collaborate & Launch <span className="gradient-text">Student Projects</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            CampusHub brings together student developers, AI innovators, and hackathon competitors. Build dream project teams, discover upcoming hackathons, and optimize ideas using Google Gemini AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold rounded-2xl gradient-bg text-white shadow-xl shadow-indigo-600/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-colors text-center"
            >
              Demo Credentials
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="glass-panel p-6 rounded-3xl space-y-3 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Idea Lab</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit your rough project concept to obtain an improved problem statement, target audience personas, tech stack recommendations, and roadmap using Gemini AI.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-3 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Team Finder</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Form project teams for hackathons or course work. Specify open roles, required skills, and review custom join request pitches from fellow students.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-3 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Hackathon Explorer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discover online and in-person college hackathons, complete with dates, prize pools, domain filters, and direct registration links.
            </p>
          </div>
        </div>

        {/* Live Metrics Showcase */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-center grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-extrabold text-white gradient-text">500+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Active Student Builders</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white gradient-text">120+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Hackathon Teams Formed</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white gradient-text">350+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">AI Project Roadmaps</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white gradient-text">100%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Open Source Community</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">CampusHub Platform</span>
          </div>
          <p>© 2026 CampusHub. Built for student innovators worldwide.</p>
        </div>
      </footer>
    </div>
  );
};
