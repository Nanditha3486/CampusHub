import React, { useState } from 'react';
import { Users, UserPlus, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import { Modal } from './Modal';

export const TeamCard = ({ team, onRequestSent, onManageRequests }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [pitch, setPitch] = useState('');
  const [selectedRole, setSelectedRole] = useState(team.openRoles?.[0] || 'Contributor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leader = team.leader || {};
  const isLeader = user && (user._id || user.id) === (leader._id || leader.id);
  const isMember =
    user && (team.members || []).some((m) => (m._id || m.id || m) === (user._id || user.id));

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!pitch.trim()) {
      addToast('Please provide a pitch explaining your motivation/skills', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post(`/teams/${team._id || team.id}/request`, {
        pitch: pitch.trim(),
        roleApplied: selectedRole,
      });
      if (res.success) {
        addToast('Application submitted to team leader!', 'success');
        setShowApplyModal(false);
        setPitch('');
        if (onRequestSent) onRequestSent();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Domain & Status Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {team.domain || 'Web Development'}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {team.status || 'Open'}
          </span>
        </div>

        {/* Team Name & Tagline */}
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{team.name}</span>
          </h3>
          <p className="text-xs font-medium text-slate-300 mt-1">{team.tagline}</p>
        </div>

        {/* Leader info */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
          <img
            src={leader.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={leader.name || 'Leader'}
            className="w-7 h-7 rounded-lg object-cover border border-slate-700"
          />
          <div className="text-[11px]">
            <span className="text-slate-400">Led by </span>
            <span className="font-semibold text-slate-200">{leader.name || 'Student Leader'}</span>
          </div>
        </div>

        {/* Open Roles */}
        {team.openRoles && team.openRoles.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">Open Roles:</span>
            <div className="flex flex-wrap gap-1">
              {team.openRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Required Skills */}
        {team.requiredSkills && team.requiredSkills.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">Required Skills:</span>
            <div className="flex flex-wrap gap-1">
              {team.requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{team.description}</p>
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          {team.members?.length || 1} Member(s)
        </span>

        {isLeader ? (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-850 text-indigo-300 border border-slate-750 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> Leader
            </span>
            {onManageRequests && (
              <button
                type="button"
                onClick={() => onManageRequests(team)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors flex items-center gap-1"
              >
                Applicants
              </button>
            )}
          </div>
        ) : isMember ? (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Joined
          </span>
        ) : (
          <button
            onClick={() => {
              if (!user) {
                addToast('Please login to apply to join teams', 'info');
                return;
              }
              setShowApplyModal(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl gradient-bg text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition-opacity flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Join Team
          </button>
        )}
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply to join ${team.name}`}
      >
        <form onSubmit={handleSendRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Role Applied For</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {team.openRoles && team.openRoles.length > 0 ? (
                team.openRoles.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))
              ) : (
                <option value="Contributor">Contributor</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Pitch & Skills Summary
            </label>
            <textarea
              rows={4}
              required
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Introduce yourself, share relevant projects/links, and explain why you're a great fit for this team..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl gradient-bg text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              Submit Join Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
