import React from 'react';
import { Trophy, Calendar, MapPin, ExternalLink, Globe, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EventCard = ({ event, onDeleteEvent }) => {
  const { isAdmin } = useAuth();

  const getDomainBadgeClass = (domain) => {
    switch (domain) {
      case 'AI/ML':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Web':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Mobile':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'CyberSecurity':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'DevOps':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Domain & Mode Badges */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${getDomainBadgeClass(
              event.domain
            )}`}
          >
            {event.domain || 'General'}
          </span>
          <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 text-slate-300 flex items-center gap-1 border border-slate-700/60">
            <Globe className="w-3 h-3 text-indigo-400" />
            {event.mode || 'Online'}
          </span>
        </div>

        {/* Title & Organizer */}
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{event.name}</span>
          </h3>
          <p className="text-xs text-indigo-300 font-medium mt-0.5">by {event.organizer}</p>
        </div>

        {/* Date & Location */}
        <div className="space-y-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{event.date}</span>
          </div>
          {event.locationUrl && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">{event.locationUrl}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{event.description}</p>
      </div>

      {/* Footer CTA & Admin Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-xs font-semibold rounded-xl gradient-bg text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition-opacity flex items-center gap-1.5"
        >
          <span>Register Now</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {isAdmin && onDeleteEvent && (
          <button
            onClick={() => onDeleteEvent(event._id || event.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Delete hackathon card"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
