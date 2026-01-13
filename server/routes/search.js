const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Post = require('../models/Post');

const router = express.Router();

// Global search endpoint
router.get('/', async (req, res) => {
  try {
    const { 
      q, 
      type = 'all', 
      tags, 
      skills, 
      dateFrom, 
      dateTo,
      limit = 20 
    } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        users: [],
        projects: [],
        posts: [],
        total: 0,
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const results = {};

    // Build date filter
    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // Search Users
    if (type === 'all' || type === 'users') {
      const userQuery = {
        $or: [
          { name: searchRegex },
          { username: searchRegex },
          { bio: searchRegex },
        ],
      };

      if (skills) {
        const skillsArray = skills.split(',').map(s => new RegExp(s.trim(), 'i'));
        userQuery.skills = { $in: skillsArray };
      }

      results.users = await User.find(userQuery)
        .select('name username avatar bio skills followers')
        .limit(parseInt(limit))
        .lean();
    }

    // Search Projects
    if (type === 'all' || type === 'projects') {
      const projectQuery = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { technologies: searchRegex },
        ],
      };

      if (tags) {
        const tagsArray = tags.split(',').map(t => new RegExp(t.trim(), 'i'));
        projectQuery.technologies = { $in: tagsArray };
      }

      if (hasDateFilter) {
        projectQuery.createdAt = dateFilter;
      }

      results.projects = await Project.find(projectQuery)
        .populate('user', 'name username avatar')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .lean();
    }

    // Search Posts
    if (type === 'all' || type === 'posts') {
      const postQuery = {
        isPublished: true,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
        ],
      };

      if (tags) {
        const tagsArray = tags.split(',').map(t => t.trim().toLowerCase());
        postQuery.tags = { $in: tagsArray };
      }

      if (hasDateFilter) {
        postQuery.createdAt = dateFilter;
      }

      results.posts = await Post.find(postQuery)
        .populate('author', 'name username avatar')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .lean();
    }

    // Calculate total results
    const total = 
      (results.users?.length || 0) + 
      (results.projects?.length || 0) + 
      (results.posts?.length || 0);

    res.json({
      users: results.users || [],
      projects: results.projects || [],
      posts: results.posts || [],
      total,
      query: q,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Autocomplete suggestions
router.get('/suggest', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchRegex = new RegExp(`^${q}`, 'i');
    const suggestions = [];

    // User suggestions
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { username: searchRegex },
        ],
      })
        .select('name username avatar')
        .limit(5)
        .lean();

      suggestions.push(...users.map(u => ({
        type: 'user',
        text: u.name,
        subtitle: `@${u.username}`,
        data: u,
      })));
    }

    // Tag suggestions (from projects and posts)
    if (type === 'all' || type === 'tags') {
      const projects = await Project.find({
        technologies: searchRegex,
      }).distinct('technologies');

      const posts = await Post.find({
        tags: searchRegex,
      }).distinct('tags');

      const allTags = [...new Set([...projects, ...posts])];
      
      suggestions.push(...allTags.slice(0, 5).map(tag => ({
        type: 'tag',
        text: tag,
        subtitle: 'Tag',
      })));
    }

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Trending searches
router.get('/trending', async (req, res) => {
  try {
    // Get top tags from recent posts
    const recentPosts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }).select('tags');

    const tagCounts = {};
    recentPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const trending = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ trending });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
