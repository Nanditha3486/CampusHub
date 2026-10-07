import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import { Users, Plus, Search, Filter, Loader2, UserCheck, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { TeamCard } from '../components/TeamCard';
import { Modal } from '../components/Modal';

export const TeamFinder = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // My Pending / Managed requests state
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'my-teams'
  const [selectedTeamForRequests, setSelectedTeamForRequests] = useState(null);
  const [teamRequests, setTeamRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [respondingId, setRespondingId] = useState(null);

  // Create Team Form state
  const [teamName, setTeamName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Web Development');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [openRoles, setOpenRoles] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      let url = '/teams';
      const params = new URLSearchParams();
      if (selectedDomain && selectedDomain !== 'All') params.append('domain', selectedDomain);
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.success) {
        setTeams(res.teams || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [selectedDomain, searchQuery]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !tagline.trim() || !description.trim()) {
      addToast('Please fill in team name, tagline, and description', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/teams', {
        name: teamName.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        domain,
        requiredSkills: requiredSkills.trim(),
        openRoles: openRoles.trim(),
      });
      if (res.success) {
        addToast('Project team created!', 'success');
        setTeams((prev) => [res.team, ...prev]);
        setShowCreateModal(false);
        setTeamName('');
        setTagline('');
        setDescription('');
        setRequiredSkills('');
        setOpenRoles('');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRequestsModal = async (team) => {
    setSelectedTeamForRequests(team);
    setLoadingRequests(true);
    try {
      const res = await api.get(`/teams/${team._id || team.id}/requests`);
      if (res.success) {
        setTeamRequests(res.requests || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    setRespondingId(requestId);
    try {
      const res = await api.put(`/teams/requests/${requestId}`, { status });
      if (res.success) {
        addToast(`Application ${status}!`, 'success');
        setTeamRequests((prev) =>
          prev.map((r) => ((r._id || r.id) === requestId ? { ...r, status } : r))
        );
        fetchTeams();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setRespondingId(null);
    }
  };

  const myTeams = teams.filter((t) => {
    const uid = user?._id || user?.id;
    if (!uid) return false;
    const leaderId = t.leader?._id || t.leader?.id || t.leader;
    return leaderId === uid || (t.members || []).some((m) => (m._id || m.id || m) === uid);
  });

  const displayedTeams = activeTab === 'my-teams' ? myTeams : teams;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" /> Team Finder & Collaboration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build your dream hackathon team or apply to open student projects.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl gradient-bg text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Team
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Explore Teams ({teams.length})
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('my-teams')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'my-teams'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                My Teams ({myTeams.length})
              </button>
            )}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or skills (React, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : displayedTeams.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {activeTab === 'my-teams' ? 'You have not created or joined any teams yet' : 'No active teams found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'my-teams'
              ? 'Create your own hackathon team or explore open teams looking for contributors!'
              : 'Be the first to create a team and start recruiting student developers!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedTeams.map((team) => (
            <TeamCard
              key={team._id || team.id}
              team={team}
              onRequestSent={fetchTeams}
              onManageRequests={openRequestsModal}
            />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Team Name</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. NeuroCraft AI"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Building AI assistants for accessibility"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="Web Development">Web Development</option>
              <option value="AI/ML">AI / Machine Learning</option>
              <option value="Mobile App">Mobile App</option>
              <option value="CyberSecurity">CyberSecurity</option>
              <option value="Blockchain/Web3">Blockchain / Web3</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Required Skills (Comma-separated)</label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="React, Tailwind CSS, PyTorch, Figma"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Open Roles (Comma-separated)</label>
            <input
              type="text"
              value={openRoles}
              onChange={(e) => setOpenRoles(e.target.value)}
              placeholder="Frontend Developer, Backend Engineer, UI/UX Designer"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project goals, hackathon target, and what your team will accomplish..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
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
              Create Team Card
            </button>
          </div>
        </form>
      </Modal>

      {/* Applications Management Modal */}
      <Modal
        isOpen={Boolean(selectedTeamForRequests)}
        onClose={() => setSelectedTeamForRequests(null)}
        title={`Applications: ${selectedTeamForRequests?.name || 'Team'}`}
      >
        {loadingRequests ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : teamRequests.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No applications received yet for this team.
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {teamRequests.map((req) => {
              const applicant = req.applicant || {};
              return (
                <div
                  key={req._id || req.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={applicant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={applicant.name || 'Applicant'}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-white text-xs">{applicant.name || 'Student'}</h4>
                        <p className="text-[10px] text-slate-400">{applicant.department || 'Student'} • {applicant.college || 'Campus'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {req.roleApplied || 'Contributor'}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    "{req.pitch}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      req.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : req.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {req.status}
                    </span>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={respondingId === (req._id || req.id)}
                          onClick={() => handleRespondRequest(req._id || req.id, 'accepted')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          disabled={respondingId === (req._id || req.id)}
                          onClick={() => handleRespondRequest(req._id || req.id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};
