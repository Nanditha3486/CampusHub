import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import {
  Sparkles,
  Zap,
  Target,
  Layers,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Share2,
} from 'lucide-react';

export const AIIdeaLab = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('AI/ML & Web');
  const [targetAudience, setTargetAudience] = useState('College Students');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addToast('Project title and description are required', 'info');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.post('/ai/idea-lab', {
        title: title.trim(),
        description: description.trim(),
        domain,
        targetAudience,
      });

      if (res.success && res.analysis) {
        setAnalysisResult(res.analysis);
        addToast('Project roadmap & breakdown generated!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'AI Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportToFeed = async () => {
    if (!analysisResult) return;
    try {
      const postTitle = `[AI Idea Lab] ${title}`;
      const postContent = `💡 Project Proposal: ${title}\n\n🎯 Refined Problem Statement:\n${analysisResult.problemStatement}\n\n✨ Key Features:\n${analysisResult.suggestedFeatures?.map(f => `• ${f}`).join('\n')}\n\n🛠 Tech Stack:\n${analysisResult.proposedTechStack?.map(t => `${t.category}: ${t.technology}`).join(' | ')}`;

      const res = await api.post('/posts', {
        title: postTitle,
        content: postContent,
        category: 'Project',
        tags: [domain.split(' ')[0], 'AIIdeaLab', 'Roadmap'],
      });

      if (res.success) {
        addToast('Idea published to Community Feed!', 'success');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Google Gemini AI Accelerator</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          AI Project <span className="gradient-text">Idea Lab</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Turn raw project concepts into clear, hackathon-ready implementation specifications using artificial intelligence.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Working Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SmartCampus AI Study Bot"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Tech Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="AI/ML & Web">AI/ML & Web</option>
                <option value="Full-Stack Web">Full-Stack Web</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="CyberSecurity & DevOps">CyberSecurity & DevOps</option>
                <option value="IoT & Hardware">IoT & Hardware</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. College students preparing for final exam week"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Rough Concept Summary & Problem Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your app will do, what problem it solves, and any specific features you have in mind..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 rounded-2xl gradient-bg text-white font-extrabold text-sm shadow-xl shadow-indigo-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Gemini AI Analyzing Proposal...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Generate Project Breakdown</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Structured Output Section */}
      {analysisResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* AI Engine Status Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>
                Analysis Model: <strong>{analysisResult.aiModelUsed}</strong>
              </span>
            </div>
            <button
              onClick={handleExportToFeed}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow"
            >
              <Share2 className="w-3.5 h-3.5" /> Post to Community Feed
            </button>
          </div>

          {/* 1. Refined Problem Statement */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" /> Refined Problem Statement
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {analysisResult.problemStatement}
            </p>
          </div>

          {/* 2. Target User Personas & Core Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" /> Target User Personas
              </h3>
              <ul className="space-y-2">
                {analysisResult.targetUsers?.map((user, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{user}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> Core Suggested Features
              </h3>
              <ul className="space-y-2">
                {analysisResult.suggestedFeatures?.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Proposed Technology Stack */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" /> Proposed Tech Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysisResult.proposedTechStack?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
                    {item.category}
                  </span>
                  <p className="text-xs font-semibold text-white">{item.technology}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Implementation Milestones */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" /> Implementation Roadmap
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysisResult.implementationMilestones?.map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-amber-400">{m.phase}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Possible Edge Cases & Limitations */}
          <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/30 space-y-3">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Possible Edge Cases & Limitations
            </h3>
            <ul className="space-y-2">
              {analysisResult.possibleLimitations?.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-rose-200/90">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
