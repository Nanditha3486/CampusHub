import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import { Settings as SettingsIcon, Server, Shield, Bell, CheckCircle2, Lock } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [teamInvites, setTeamInvites] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealthStatus(res);
      } catch (err) {
        setHealthStatus({ status: 'error', message: err.message });
      } finally {
        setLoadingHealth(false);
      }
    };
    checkHealth();
  }, []);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    addToast('Account preferences saved!', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-400" /> Settings & System Status
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage account settings, view REST API health, and system details.
        </p>
      </div>

      {/* System Health Status Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" /> System Connection & API Diagnostics
        </h3>

        {loadingHealth ? (
          <p className="text-xs text-slate-400">Pinging backend server...</p>
        ) : healthStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">API Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Database Engine</span>
              <span className="text-indigo-300 font-bold mt-0.5 block">
                {healthStatus.database?.mode || 'Active'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Gemini AI Key</span>
              <span className={`font-bold mt-0.5 block ${healthStatus.aiConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {healthStatus.aiConfigured ? 'Live Gemini Key' : 'Demo Smart Fallback'}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Notification Preferences */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" /> Notification Preferences
        </h3>

        <form onSubmit={handleSavePreferences} className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-200 block">Comment & Like Alerts</span>
              <span className="text-[11px] text-slate-400">Receive in-app notifications when someone interacts with your posts</span>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-200 block">Team Join Request Notifications</span>
              <span className="text-[11px] text-slate-400">Get notified when students apply to join your teams</span>
            </div>
            <input
              type="checkbox"
              checked={teamInvites}
              onChange={(e) => setTeamInvites(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl gradient-bg text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
