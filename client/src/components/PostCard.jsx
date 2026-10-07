import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Flag,
  Send,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const PostCard = ({ post, onPostUpdated, onDeletePost }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(
    user ? (post.likes || []).includes(user._id || user.id) : false
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const author = post.author || {};
  const isOwner = user && (user._id || user.id) === (author._id || author.id);

  const handleToggleLike = async () => {
    if (!user) {
      addToast('Please login to like posts', 'info');
      return;
    }
    try {
      const res = await api.post(`/posts/${post._id || post.id}/like`);
      if (res.success) {
        setLikes(res.likes);
        setIsLiked(res.isLiked);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleComments = async () => {
    if (!showComments) {
      try {
        const res = await api.get(`/posts/${post._id || post.id}/comments`);
        if (res.success) {
          setComments(res.comments || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      addToast('Please login to comment', 'info');
      return;
    }
    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${post._id || post.id}/comments`, {
        content: newComment.trim(),
      });
      if (res.success) {
        setComments((prev) => [...prev, res.comment]);
        setCommentCount((prev) => prev + 1);
        setNewComment('');
        addToast('Comment added!', 'success');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Post link copied to clipboard!', 'info');
  };

  const handleReportPost = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      await api.post('/admin/report', {
        contentType: 'post',
        targetId: post._id || post.id,
        reason: reportReason.trim(),
      });
      addToast('Post reported to CampusHub moderators.', 'info');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Project':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Discussion':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Question':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Opportunity':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4">
      {/* Header: Author & Category */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
            alt={author.name || 'Student'}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
          />
          <div>
            <h4 className="text-sm font-semibold text-white leading-tight">
              {author.name || 'Student Member'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {author.college || 'Campus Member'} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${getCategoryBadgeClass(
              post.category
            )}`}
          >
            {post.category || 'Discussion'}
          </span>
          {isOwner && onDeletePost && (
            <button
              onClick={() => onDeletePost(post._id || post.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-slate-100 leading-snug">{post.title}</h3>
        <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{post.content}</p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800/80 text-indigo-300 border border-slate-700/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-slate-400 text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 hover:text-rose-400 transition-colors ${
              isLiked ? 'text-rose-500 font-semibold' : ''
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            <span>{likes.length}</span>
          </button>

          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{commentCount}</span>
          </button>

          <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Report post"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="pt-3 border-t border-slate-800/60 space-y-3">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center py-2">No comments yet. Be the first to reply!</p>
            ) : (
              comments.map((c) => (
                <div key={c._id || c.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/40 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{c.author?.name || 'Student'}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full space-y-4">
            <h4 className="font-bold text-sm text-white">Report Content to Moderators</h4>
            <p className="text-xs text-slate-400">
              Please state why this post violates community guidelines:
            </p>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="e.g. Spam, harassment, misleading information..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReportPost}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
