import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import { User, Edit3, Github, Globe, GraduationCap, Sparkles, Bookmark, MessageSquareText } from 'lucide-react';
import { Modal } from '../components/Modal';
import { PostCard } from '../components/PostCard';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotification();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('my-posts'); // 'my-posts' or 'saved'
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Edit Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsStr, setSkillsStr] = useState((user?.skills || []).join(', '));
  const [interestsStr, setInterestsStr] = useState((user?.interests || []).join(', '));
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      setLoadingPosts(true);
      try {
        const res = await api.get('/posts');
        if (res.success) {
          const uid = user._id || user.id;
          const myPosts = (res.posts || []).filter(
            (p) => (p.author?._id || p.author?.id || p.author) === uid
          );
          setUserPosts(myPosts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const interests = interestsStr.split(',').map((i) => i.trim()).filter(Boolean);

      await updateProfile({
        name,
        college,
        department,
        bio,
        skills,
        interests,
        githubUrl,
        portfolioUrl,
        avatar,
      });
      setShowEditModal(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
            />
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <span>{user?.name}</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-500/20 text-indigo-300 capitalize border border-indigo-500/30">
                  {user?.role}
                </span>
              </h1>
              <p className="text-xs text-indigo-300 font-medium">{user?.department}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                {user?.college}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4 text-indigo-400" /> Edit Profile
          </button>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          {user?.bio || 'No bio added yet.'}
        </p>

        {/* Skills & Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {user?.skills && user.skills.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Skills & Tech Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Portfolio & Accounts
            </span>
            <div className="flex items-center gap-4 text-xs">
              {user?.githubUrl ? (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
                >
                  <Github className="w-4 h-4 text-indigo-400" /> GitHub
                </a>
              ) : (
                <span className="text-slate-500">No GitHub linked</span>
              )}

              {user?.portfolioUrl ? (
                <a
                  href={user.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-indigo-400 flex items-center gap-1 font-medium"
                >
                  <Globe className="w-4 h-4 text-purple-400" /> Portfolio
                </a>
              ) : (
                <span className="text-slate-500">No portfolio linked</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Activity Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('my-posts')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'my-posts'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquareText className="w-4 h-4" /> My Posts ({userPosts.length})
          </button>
        </div>

        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
              You haven't posted in the community feed yet.
            </div>
          ) : (
            userPosts.map((post) => <PostCard key={post._id || post.id} post={post} />)
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Student Profile"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Major</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Skills (Comma-separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="React, Node.js, Python, Tailwind"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Portfolio URL</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://mywebsite.dev"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl gradient-bg text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
