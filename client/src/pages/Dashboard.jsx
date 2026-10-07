import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Sparkles,
  MessageSquareText,
  Trophy,
  Users,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { EventCard } from '../components/EventCard';

export const Dashboard = () => {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myTeamsCount, setMyTeamsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [postsRes, eventsRes, teamsRes] = await Promise.all([
          api.get('/posts?limit=3'),
          api.get('/events'),
          api.get('/teams'),
        ]);

        if (postsRes.success) {
          setRecentPosts((postsRes.posts || []).slice(0, 3));
        }
        if (eventsRes.success) {
          setUpcomingEvents((eventsRes.events || []).slice(0, 2));
        }
        if (teamsRes.success && user) {
          const userTeams = (teamsRes.teams || []).filter((t) => {
            const leaderId = t.leader?._id || t.leader?.id || t.leader;
            const uid = user._id || user.id;
            return leaderId === uid || (t.members || []).some((m) => (m._id || m.id || m) === uid);
          });
          setMyTeamsCount(userTeams.length);
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-bg p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>CampusHub Hub Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Innovator'}! 👋
          </h1>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            {user?.college || 'MIT WPU'} • {user?.department || 'Computer Science'}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/idea-lab"
              className="px-4 py-2 bg-white text-indigo-950 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" /> Run AI Idea Lab
            </Link>
            <Link
              to="/community"
              className="px-4 py-2 bg-indigo-950/40 hover:bg-indigo-950/60 text-white rounded-xl text-xs font-semibold border border-indigo-400/30 transition-colors inline-flex items-center gap-1.5"
            >
              <MessageSquareText className="w-4 h-4 text-indigo-300" /> Create Post
            </Link>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-purple-500/30 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Recent Posts</div>
            <div className="text-lg font-bold text-white">{recentPosts.length}</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Upcoming Hackathons</div>
            <div className="text-lg font-bold text-white">{upcomingEvents.length}</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">My Joined Teams</div>
            <div className="text-lg font-bold text-white">{myTeamsCount}</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Saved Items</div>
            <div className="text-lg font-bold text-white">{user?.savedPosts?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Community Activity & Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Community Feed Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Community Activity</h2>
            </div>
            <Link
              to="/community"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View Feed <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentPosts.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
                No recent activity. Start the conversation in the community feed!
              </div>
            ) : (
              recentPosts.map((post) => <PostCard key={post._id || post.id} post={post} />)
            )}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Events & Quick Launch */}
        <div className="space-y-6">
          {/* Upcoming Hackathons Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Upcoming Hackathons
              </h3>
              <Link to="/events" className="text-xs text-indigo-400 hover:underline">
                See all
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <EventCard key={evt._id || evt.id} event={evt} />
              ))}
            </div>
          </div>

          {/* Quick Launch Tools Widget */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase">
              Quick Launch Tools
            </h4>
            <div className="space-y-2 text-xs">
              <Link
                to="/teams"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold">Find Team Members</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/resources"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Browse Resources</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
