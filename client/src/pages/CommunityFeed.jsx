import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import { MessageSquareText, Plus, Search, Filter, Loader2, Sparkles } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { Modal } from '../components/Modal';

export const CommunityFeed = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Discussion');
  const [postTags, setPostTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['All', 'Project', 'Discussion', 'Question', 'Opportunity'];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = '/posts';
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.success) {
        setPosts(res.posts || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      addToast('Title and content are required', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/posts', {
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
        tags: postTags,
      });
      if (res.success) {
        addToast('Post published to Community Feed!', 'success');
        setPosts((prev) => [res.post, ...prev]);
        setShowCreateModal(false);
        setPostTitle('');
        setPostContent('');
        setPostTags('');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await api.delete(`/posts/${postId}`);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
        addToast('Post deleted', 'info');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquareText className="w-6 h-6 text-indigo-400" /> Community Feed
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Share ideas, ask technical questions, discuss hackathons, and connect with peers.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              addToast('Please login to create a post', 'info');
              return;
            }
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 rounded-xl gradient-bg text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Post
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter posts by keyword or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Posts Stream */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <MessageSquareText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No posts match your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Be the first student to publish a post under this category!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              onDeletePost={handleDeletePost}
            />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Community Post"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              value={postCategory}
              onChange={(e) => setPostCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Discussion">Discussion</option>
              <option value="Project">Project Showcase</option>
              <option value="Question">Technical Question</option>
              <option value="Opportunity">Opportunity / Hackathon</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Post Title</label>
            <input
              type="text"
              required
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="What are you building or asking?"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Post Content</label>
            <textarea
              rows={5}
              required
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Describe your project, question, or discussion point in detail..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={postTags}
              onChange={(e) => setPostTags(e.target.value)}
              placeholder="React, Node, Gemini, OpenSource"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl gradient-bg text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              Publish Post
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
