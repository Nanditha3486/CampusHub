import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserCheck, Search, Github, Globe, GraduationCap, Loader2, Sparkles } from 'lucide-react';

export const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let endpoint = '/users';
      if (searchQuery) endpoint += `?search=${encodeURIComponent(searchQuery)}`;
      const res = await api.get(endpoint);
      if (res.success) {
        setStudents(res.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-400" /> Student Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover peer developers, machine learning researchers, and collaborators across campuses.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, skill (Python, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No student profiles found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or skill keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((st) => (
            <div
              key={st._id || st.id}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={st.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
                    alt={st.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{st.name}</span>
                      {st.role === 'admin' && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300">
                          ADMIN
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-indigo-300 font-medium">{st.department || 'Computer Science'}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-slate-500" />
                      {st.college || 'Campus Member'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{st.bio}</p>

                {/* Skills Badges */}
                {st.skills && st.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {st.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/60 text-xs">
                {st.githubUrl && (
                  <a
                    href={st.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {st.portfolioUrl && (
                  <a
                    href={st.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
