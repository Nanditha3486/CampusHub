import { Event } from '../models/Event.js';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export const getEvents = async (req, res) => {
  try {
    const { domain, mode, search } = req.query;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      let query = {};
      if (domain && domain !== 'All') query.domain = domain;
      if (mode && mode !== 'All') query.mode = mode;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { organizer: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const events = await Event.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: events.length, events });
    } else {
      let filtered = [...memoryStore.events];
      if (domain && domain !== 'All') filtered = filtered.filter((e) => e.domain === domain);
      if (mode && mode !== 'All') filtered = filtered.filter((e) => e.mode === mode);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.organizer.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
        );
      }
      return res.json({ success: true, count: filtered.length, events: filtered });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { name, organizer, domain, date, mode, description, registrationUrl, locationUrl, tags } = req.body;
    const userId = req.user._id || req.user.id;

    if (!name || !organizer || !date || !registrationUrl) {
      return res.status(400).json({ success: false, message: 'Please fill in all required event fields' });
    }

    const { isMongoConnected } = getDBStatus();
    const parsedTags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [];

    if (isMongoConnected) {
      const event = await Event.create({
        name,
        organizer,
        domain: domain || 'General',
        date,
        mode: mode || 'Online',
        description,
        registrationUrl,
        locationUrl: locationUrl || '',
        tags: parsedTags,
        createdBy: userId,
      });

      return res.status(201).json({ success: true, event });
    } else {
      const newEventId = 'event_' + memoryStore.generateId();
      const newEvent = {
        _id: newEventId,
        id: newEventId,
        name,
        organizer,
        domain: domain || 'General',
        date,
        mode: mode || 'Online',
        description,
        registrationUrl,
        locationUrl: locationUrl || '',
        tags: parsedTags,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };

      memoryStore.events.unshift(newEvent);
      return res.status(201).json({ success: true, event: newEvent });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      await Event.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Event deleted' });
    } else {
      const index = memoryStore.events.findIndex((e) => e._id === id || e.id === id);
      if (index > -1) memoryStore.events.splice(index, 1);
      return res.json({ success: true, message: 'Event deleted' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
