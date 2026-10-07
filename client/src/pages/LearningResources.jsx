import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import { BookOpen, Plus, Search, Filter, Loader2, Bookmark } from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { Modal } from '../components/Modal';

export const LearningResources = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tutorial');
  const [domain, setDomain] = useState('Web');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['All', 'Tutorial', 'Documentation', 'Video', 'Tool', 'Book'];

  const fetchResources = async () => {
    setLoading(true);
    try {
      let endpoint = '/resources';
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const res = await api.get(endpoint);
      if (res.success) {
        setResources(res.resources || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, searchQuery]);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !description.trim()) {
      addToast('Title, URL, and description are required', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/resources', {
        title: title.trim(),
        category,
        domain: domain.trim(),
        description: description.trim(),
        url: url.trim(),
      });
      if (res.success) {
        addToast('Learning resource added to hub!', 'success');
        setResources((prev) => [res.resource, ...prev]);
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        setUrl('');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" /> Learning Resources Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curated documentation, video courses, design tools, and tutorials submitted by students.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl gradient-bg text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Share Resource
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resources by title or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No resources found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Share a useful documentation link or tutorial with fellow student developers!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <ResourceCard key={res._id || res.id} resource={res} />
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Share Learning Resource"
      >
        <form onSubmit={handleCreateResource} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resource Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern React 19 Custom Hooks Masterclass"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="Tutorial">Tutorial</option>
                <option value="Documentation">Documentation</option>
                <option value="Video">Video Course</option>
                <option value="Tool">Developer Tool</option>
                <option value="Book">Book / PDF</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Web, AI/ML, Mobile, DevOps"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resource URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://react.dev/learn"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Brief Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this resource is helpful to student developers..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl gradient-bg text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              Share Resource
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
