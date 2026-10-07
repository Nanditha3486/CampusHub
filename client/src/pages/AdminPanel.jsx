import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import { ShieldAlert, Users, MessageSquareText, Trophy, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const AdminPanel = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/reports'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (reportsRes.success) setReports(reportsRes.reports || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveReport = async (reportId, status) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}`, { status });
      if (res.success) {
        addToast(`Report marked as ${status}`, 'success');
        setReports((prev) =>
          prev.map((r) => ((r._id || r.id) === reportId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-amber-300 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" /> Platform Administration & Moderation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review reported student content, manage hackathons, and monitor platform activity.
        </p>
      </div>

      {/* Platform Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Total Students</div>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.users}</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Total Posts</div>
            <div className="text-2xl font-extrabold text-indigo-400 mt-1">{stats.posts}</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Hackathons</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{stats.events}</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Teams</div>
            <div className="text-2xl font-extrabold text-purple-400 mt-1">{stats.teams}</div>
          </div>
        </div>
      )}

      {/* Moderation Queue */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" /> Reported Content Queue ({reports.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No reported content pending review.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep._id || rep.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold uppercase text-[10px]">
                      {rep.contentType}
                    </span>
                    <span className="text-slate-400">ID: {rep.targetId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rep.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium">Reason: "{rep.reason}"</p>
                  <p className="text-slate-500 text-[10px]">
                    Reported on {new Date(rep.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveReport(rep._id || rep.id, 'resolved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep._id || rep.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
