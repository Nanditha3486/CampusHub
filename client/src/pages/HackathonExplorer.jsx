import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import { Trophy, Plus, Search, Filter, Loader2, Calendar } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { Modal } from '../components/Modal';

export const HackathonExplorer = () => {
  const { user, isAdmin } = useAuth();
  const { addToast } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Event Form state
  const [eventName, setEventName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [domain, setDomain] = useState('AI/ML');
  const [date, setDate] = useState('');
  const [mode, setMode] = useState('Online');
  const [description, setDescription] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const domains = ['All', 'AI/ML', 'Web', 'Mobile', 'DevOps', 'CyberSecurity', 'General'];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = '/events';
      const params = new URLSearchParams();
      if (selectedDomain && selectedDomain !== 'All') params.append('domain', selectedDomain);
      if (selectedMode && selectedMode !== 'All') params.append('mode', selectedMode);
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDomain, selectedMode, searchQuery]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventName.trim() || !organizer.trim() || !registrationUrl.trim()) {
      addToast('Event name, organizer, and registration link are required', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/events', {
        name: eventName.trim(),
        organizer: organizer.trim(),
        domain,
        date: date || 'Upcoming 2026',
        mode,
        description: description.trim(),
        registrationUrl: registrationUrl.trim(),
        locationUrl: locationUrl.trim(),
      });
      if (res.success) {
        addToast('Hackathon event added to directory!', 'success');
        setEvents((prev) => [res.event, ...prev]);
        setShowAddModal(false);
        setEventName('');
        setOrganizer('');
        setDescription('');
        setRegistrationUrl('');
        setLocationUrl('');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event card?')) return;
    try {
      const res = await api.delete(`/events/${eventId}`);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => (e._id || e.id) !== eventId));
        addToast('Event deleted', 'info');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" /> Hackathon Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover upcoming student coding competitions, hackathons, and prize opportunities.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl gradient-bg text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Hackathon Event
          </button>
        )}
      </div>

      {/* Domain & Mode Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDomain === dom
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Modes</option>
              <option value="Online">Online Only</option>
              <option value="In-Person">In-Person</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No events found matching criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search domain or mode filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard key={evt._id || evt.id} event={evt} onDeleteEvent={handleDeleteEvent} />
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Hackathon / Coding Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event Name</label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Global AI Hackathon 2026"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organizer / Host</label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. GDG & Tech Club"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="AI/ML">AI/ML</option>
                <option value="Web">Web</option>
                <option value="Mobile">Mobile</option>
                <option value="DevOps">DevOps</option>
                <option value="CyberSecurity">CyberSecurity</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date String</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Oct 24 - Oct 26, 2026"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Registration URL</label>
            <input
              type="url"
              required
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              placeholder="https://devpost.com/hackathon-link"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Rules</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a summary of the hackathon theme, tracks, and total prize pool..."
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
              Add Event Card
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
