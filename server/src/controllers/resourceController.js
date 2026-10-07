import { Resource } from '../models/Resource.js';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export const getResources = async (req, res) => {
  try {
    const { category, domain, search } = req.query;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      let query = {};
      if (category && category !== 'All') query.category = category;
      if (domain && domain !== 'All') query.domain = domain;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const resources = await Resource.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: resources.length, resources });
    } else {
      let filtered = [...memoryStore.resources];
      if (category && category !== 'All') filtered = filtered.filter((r) => r.category === category);
      if (domain && domain !== 'All') filtered = filtered.filter((r) => r.domain === domain);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
      }
      return res.json({ success: true, count: filtered.length, resources: filtered });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const { title, category, domain, description, url } = req.body;
    const userId = req.user._id || req.user.id;

    if (!title || !domain || !description || !url) {
      return res.status(400).json({ success: false, message: 'Please fill in all required resource fields' });
    }

    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const resource = await Resource.create({
        title,
        category: category || 'Tutorial',
        domain,
        description,
        url,
        addedBy: userId,
      });

      return res.status(201).json({ success: true, resource });
    } else {
      const resId = 'res_' + memoryStore.generateId();
      const newRes = {
        _id: resId,
        id: resId,
        title,
        category: category || 'Tutorial',
        domain,
        description,
        url,
        upvotes: [],
        bookmarkedBy: [],
        addedBy: userId,
        createdAt: new Date().toISOString(),
      };

      memoryStore.resources.unshift(newRes);
      return res.status(201).json({ success: true, resource: newRes });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleUpvoteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const resource = await Resource.findById(id);
      if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

      const index = resource.upvotes.indexOf(userId);
      if (index > -1) {
        resource.upvotes.splice(index, 1);
      } else {
        resource.upvotes.push(userId);
      }

      await resource.save();
      return res.json({ success: true, upvotes: resource.upvotes });
    } else {
      const resource = memoryStore.resources.find((r) => r._id === id || r.id === id);
      if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

      if (!resource.upvotes) resource.upvotes = [];
      const index = resource.upvotes.indexOf(userId);
      if (index > -1) {
        resource.upvotes.splice(index, 1);
      } else {
        resource.upvotes.push(userId);
      }

      return res.json({ success: true, upvotes: resource.upvotes });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleBookmarkResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const resource = await Resource.findById(id);
      if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

      const index = resource.bookmarkedBy.indexOf(userId);
      if (index > -1) {
        resource.bookmarkedBy.splice(index, 1);
      } else {
        resource.bookmarkedBy.push(userId);
      }

      await resource.save();
      return res.json({ success: true, bookmarkedBy: resource.bookmarkedBy });
    } else {
      const resource = memoryStore.resources.find((r) => r._id === id || r.id === id);
      if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

      if (!resource.bookmarkedBy) resource.bookmarkedBy = [];
      const index = resource.bookmarkedBy.indexOf(userId);
      if (index > -1) {
        resource.bookmarkedBy.splice(index, 1);
      } else {
        resource.bookmarkedBy.push(userId);
      }

      return res.json({ success: true, bookmarkedBy: resource.bookmarkedBy });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
