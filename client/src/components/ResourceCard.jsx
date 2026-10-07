import React, { useState } from 'react';
import { BookOpen, ThumbsUp, Bookmark, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';

export const ResourceCard = ({ resource }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [upvotes, setUpvotes] = useState(resource.upvotes || []);
  const [bookmarkedBy, setBookmarkedBy] = useState(resource.bookmarkedBy || []);

  const userId = user?._id || user?.id;
  const isUpvoted = userId ? upvotes.includes(userId) : false;
  const isBookmarked = userId ? bookmarkedBy.includes(userId) : false;

  const handleToggleUpvote = async () => {
    if (!user) {
      addToast('Please login to upvote resources', 'info');
      return;
    }
    try {
      const res = await api.post(`/resources/${resource._id || resource.id}/upvote`);
      if (res.success) {
        setUpvotes(res.upvotes);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      addToast('Please login to bookmark resources', 'info');
      return;
    }
    try {
      const res = await api.post(`/resources/${resource._id || resource.id}/bookmark`);
      if (res.success) {
        setBookmarkedBy(res.bookmarkedBy);
        addToast(
          res.bookmarkedBy.includes(userId) ? 'Resource bookmarked!' : 'Bookmark removed',
          'info'
        );
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const getCategoryClass = (cat) => {
    switch (cat) {
      case 'Tutorial':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Documentation':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Video':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Tool':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${getCategoryClass(resource.category)}`}>
            {resource.category || 'Tutorial'}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
            {resource.domain}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white flex items-start justify-between gap-2 group">
          <span>{resource.title}</span>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-indigo-400 transition-colors p-1"
            title="Open Resource URL"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
          </a>
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{resource.description}</p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
        <button
          onClick={handleToggleUpvote}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
            isUpvoted
              ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40 font-semibold'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-indigo-400' : ''}`} />
          <span>{upvotes.length} Upvotes</span>
        </button>

        <button
          onClick={handleToggleBookmark}
          className={`p-2 rounded-xl border transition-colors ${
            isBookmarked
              ? 'bg-indigo-950/60 text-indigo-400 border-indigo-500/40'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
          title="Bookmark Resource"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
