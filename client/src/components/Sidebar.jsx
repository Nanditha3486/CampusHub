import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MessageSquareText,
  Trophy,
  Users,
  Sparkles,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Settings,
  X,
  Code2,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Community Feed', path: '/community', icon: MessageSquareText },
    { name: 'Hackathons', path: '/events', icon: Trophy },
    { name: 'Team Finder', path: '/teams', icon: Users },
    { name: 'AI Idea Lab', path: '/idea-lab', icon: Sparkles, badge: 'AI' },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Student Directory', path: '/students', icon: UserCheck },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck, admin: true });
  }

  navItems.push({ name: 'Settings', path: '/settings', icon: Settings });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 lg:z-30 h-full w-64 bg-slate-950/95 border-r border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:h-[calc(100vh-4rem)]`}
      >
        <div className="space-y-6">
          {/* Mobile Header Close */}
          <div className="flex items-center justify-between lg:hidden pb-4 border-b border-slate-800">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" /> CampusHub Menu
            </span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-600/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.admin && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Widget */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-indigo-200">Powered by Gemini</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Need feedback on your hackathon project? Run it through AI Idea Lab.
          </p>
        </div>
      </aside>
    </>
  );
};
