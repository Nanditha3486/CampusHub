import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export const getPosts = async (req, res) => {
  try {
    const { category, search, tag } = req.query;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      let query = {};
      if (category && category !== 'All') query.category = category;
      if (tag) query.tags = tag;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ];
      }

      const posts = await Post.find(query)
        .populate('author', 'name college department avatar bio')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: posts.length, posts });
    } else {
      let filtered = [...memoryStore.posts];

      if (category && category !== 'All') {
        filtered = filtered.filter((p) => p.category === category);
      }
      if (tag) {
        filtered = filtered.filter((p) => p.tags && p.tags.includes(tag));
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, count: filtered.length, posts: filtered });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const post = await Post.findById(id).populate('author', 'name college department avatar bio');
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      return res.json({ success: true, post });
    } else {
      const post = memoryStore.posts.find((p) => p._id === id || p.id === id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      return res.json({ success: true, post });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.user._id || req.user.id;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const parsedTags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [];
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const post = await Post.create({
        author: userId,
        title,
        content,
        category: category || 'Discussion',
        tags: parsedTags,
      });

      const populatedPost = await Post.findById(post._id).populate('author', 'name college department avatar bio');
      return res.status(201).json({ success: true, post: populatedPost });
    } else {
      const newPostId = 'post_' + memoryStore.generateId();
      const newPost = {
        _id: newPostId,
        id: newPostId,
        author: req.user,
        title,
        content,
        category: category || 'Discussion',
        tags: parsedTags,
        likes: [],
        commentCount: 0,
        savedBy: [],
        createdAt: new Date().toISOString(),
      };

      memoryStore.posts.unshift(newPost);
      return res.status(201).json({ success: true, post: newPost });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      if (post.author.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
      }

      await Post.findByIdAndDelete(id);
      await Comment.deleteMany({ post: id });
      return res.json({ success: true, message: 'Post removed successfully' });
    } else {
      const postIndex = memoryStore.posts.findIndex((p) => p._id === id || p.id === id);
      if (postIndex === -1) return res.status(404).json({ success: false, message: 'Post not found' });

      const post = memoryStore.posts[postIndex];
      const authorId = post.author._id || post.author.id || post.author;
      if (authorId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
      }

      memoryStore.posts.splice(postIndex, 1);
      memoryStore.comments = memoryStore.comments.filter((c) => c.post !== id);
      return res.json({ success: true, message: 'Post removed successfully' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      const isLiked = post.likes.includes(userId);
      if (isLiked) {
        post.likes = post.likes.filter((uid) => uid.toString() !== userId.toString());
      } else {
        post.likes.push(userId);
        // Create notification for post author if not self
        if (post.author.toString() !== userId.toString()) {
          await Notification.create({
            recipient: post.author,
            sender: userId,
            type: 'like',
            title: 'New Like on Your Post',
            message: `${req.user.name} liked your post "${post.title.slice(0, 30)}..."`,
            link: `/community`,
          });
        }
      }

      await post.save();
      return res.json({ success: true, likes: post.likes, isLiked: !isLiked });
    } else {
      const post = memoryStore.posts.find((p) => p._id === id || p.id === id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      if (!post.likes) post.likes = [];
      const index = post.likes.indexOf(userId);
      let isLiked = false;

      if (index > -1) {
        post.likes.splice(index, 1);
        isLiked = false;
      } else {
        post.likes.push(userId);
        isLiked = true;

        const authorId = post.author._id || post.author.id || post.author;
        if (authorId !== userId) {
          memoryStore.notifications.unshift({
            _id: 'notif_' + memoryStore.generateId(),
            id: 'notif_' + memoryStore.generateId(),
            recipient: authorId,
            sender: req.user,
            type: 'like',
            title: 'New Like on Your Post',
            message: `${req.user.name} liked your post "${post.title.slice(0, 30)}..."`,
            link: '/community',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }

      return res.json({ success: true, likes: post.likes, isLiked });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const comments = await Comment.find({ post: id })
        .populate('author', 'name college department avatar')
        .sort({ createdAt: 1 });
      return res.json({ success: true, comments });
    } else {
      const comments = memoryStore.comments.filter((c) => c.post === id);
      return res.json({ success: true, comments });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id || req.user.id;

    if (!content) return res.status(400).json({ success: false, message: 'Comment content is required' });

    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      const comment = await Comment.create({
        post: id,
        author: userId,
        content,
      });

      post.commentCount = (post.commentCount || 0) + 1;
      await post.save();

      const populatedComment = await Comment.findById(comment._id).populate('author', 'name college department avatar');

      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: 'comment',
          title: 'New Comment on Your Post',
          message: `${req.user.name} commented: "${content.slice(0, 40)}..."`,
          link: `/community`,
        });
      }

      return res.status(201).json({ success: true, comment: populatedComment });
    } else {
      const post = memoryStore.posts.find((p) => p._id === id || p.id === id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      const commentId = 'comment_' + memoryStore.generateId();
      const newComment = {
        _id: commentId,
        id: commentId,
        post: id,
        author: req.user,
        content,
        createdAt: new Date().toISOString(),
      };

      memoryStore.comments.push(newComment);
      post.commentCount = (post.commentCount || 0) + 1;

      const authorId = post.author._id || post.author.id || post.author;
      if (authorId !== userId) {
        memoryStore.notifications.unshift({
          _id: 'notif_' + memoryStore.generateId(),
          id: 'notif_' + memoryStore.generateId(),
          recipient: authorId,
          sender: req.user,
          type: 'comment',
          title: 'New Comment on Your Post',
          message: `${req.user.name} commented: "${content.slice(0, 40)}..."`,
          link: '/community',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      return res.status(201).json({ success: true, comment: newComment });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
