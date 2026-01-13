const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Project = require("../models/Project");
const Post = require("../models/Post");
const Endorsement = require("../models/Endorsement");

const router = express.Router();

// Get user analytics
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = "7d" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get projects analytics
    const projects = await Project.find({
      user: userId,
      createdAt: { $gte: startDate },
    });

    const projectViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);
    const projectLikes = projects.reduce(
      (sum, p) => sum + (p.likes?.length || 0),
      0
    );

    // Get posts analytics
    const posts = await Post.find({
      author: userId,
      createdAt: { $gte: startDate },
    });

    const postViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const postLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
    const postComments = posts.reduce(
      (sum, p) => sum + (p.comments?.length || 0),
      0
    );

    // Get endorsements
    const endorsements = await Endorsement.find({ to: userId }).populate(
      "from",
      "name username avatar"
    );

    // Group endorsements by skill
    const endorsementsBySkill = endorsements.reduce((acc, e) => {
      if (!acc[e.skill]) {
        acc[e.skill] = 0;
      }
      acc[e.skill]++;
      return acc;
    }, {});

    const skillEndorsements = Object.entries(endorsementsBySkill)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate growth (compare with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setTime(
      startDate.getTime() - (now.getTime() - startDate.getTime())
    );

    const previousProjects = await Project.find({
      user: userId,
      createdAt: { $gte: previousStartDate, $lt: startDate },
    });

    const previousProjectLikes = previousProjects.reduce(
      (sum, p) => sum + (p.likes?.length || 0),
      0
    );

    const likesGrowth =
      previousProjectLikes > 0
        ? ((projectLikes + postLikes - previousProjectLikes) /
            previousProjectLikes) *
          100
        : 0;

    // Get follower count and growth
    const followerCount = user.followers?.length || 0;

    // Top projects by views
    const topProjects = await Project.find({ user: userId })
      .sort({ views: -1 })
      .limit(5)
      .select("title views likes");

    // Top posts by views
    const topPosts = await Post.find({ author: userId })
      .sort({ views: -1 })
      .limit(5)
      .select("title content views likes");

    // Engagement by type
    const engagementByType = [
      { name: "Projects", value: projectLikes },
      { name: "Posts", value: postLikes },
      { name: "Comments", value: postComments },
    ];

    // Views over time (daily for last 7 days)
    const viewsOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayProjects = await Project.find({
        user: userId,
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      const dayPosts = await Post.find({
        author: userId,
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      const dayViews =
        dayProjects.reduce((sum, p) => sum + (p.views || 0), 0) +
        dayPosts.reduce((sum, p) => sum + (p.views || 0), 0);

      viewsOverTime.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        views: dayViews,
      });
    }

    const analytics = {
      overview: {
        profileViews: projectViews + postViews,
        profileViewsChange: 0, // Would need historical data
        totalLikes: projectLikes + postLikes,
        totalLikesChange: likesGrowth,
        totalComments: postComments,
        totalCommentsChange: 0, // Would need historical data
        followers: followerCount,
        followersChange: 0, // Would need historical data
      },
      viewsOverTime,
      engagementByType,
      topProjects: topProjects.map((p) => ({
        title: p.title,
        views: p.views || 0,
        likes: p.likes?.length || 0,
      })),
      topPosts: topPosts.map((p) => ({
        title: p.title || p.content.substring(0, 50),
        views: p.views || 0,
        likes: p.likes?.length || 0,
      })),
      skillEndorsements,
    };

    res.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get current user analytics
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { timeRange = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate = new Date(0);
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get projects analytics
    const projects = await Project.find({
      user: userId,
      createdAt: { $gte: startDate },
    });

    const projectViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);
    const projectLikes = projects.reduce((sum, p) => sum + (p.likes?.length || 0), 0);

    // Get posts analytics
    const posts = await Post.find({
      author: userId,
      createdAt: { $gte: startDate },
    });

    const postViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const postLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
    const postComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

    // Get endorsements
    const endorsements = await Endorsement.find({ to: userId })
      .populate('from', 'name username avatar');

    // Group endorsements by skill
    const endorsementsBySkill = endorsements.reduce((acc, e) => {
      if (!acc[e.skill]) {
        acc[e.skill] = 0;
      }
      acc[e.skill]++;
      return acc;
    }, {});

    const skillEndorsements = Object.entries(endorsementsBySkill)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate growth
    const previousStartDate = new Date(startDate);
    previousStartDate.setTime(startDate.getTime() - (now.getTime() - startDate.getTime()));

    const previousProjects = await Project.find({
      user: userId,
      createdAt: { $gte: previousStartDate, $lt: startDate },
    });

    const previousProjectLikes = previousProjects.reduce(
      (sum, p) => sum + (p.likes?.length || 0),
      0
    );

    const likesGrowth = previousProjectLikes > 0
      ? ((projectLikes + postLikes - previousProjectLikes) / previousProjectLikes) * 100
      : 0;

    const followerCount = user.followers?.length || 0;

    // Top projects by views
    const topProjects = await Project.find({ user: userId })
      .sort({ views: -1 })
      .limit(5)
      .select('title views likes');

    // Top posts by views
    const topPosts = await Post.find({ author: userId })
      .sort({ views: -1 })
      .limit(5)
      .select('title content views likes');

    // Engagement by type
    const engagementByType = [
      { name: 'Projects', value: projectLikes },
      { name: 'Posts', value: postLikes },
      { name: 'Comments', value: postComments },
    ];

    // Views over time
    const viewsOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayProjects = await Project.find({
        user: userId,
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      const dayPosts = await Post.find({
        author: userId,
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      const dayViews = 
        dayProjects.reduce((sum, p) => sum + (p.views || 0), 0) +
        dayPosts.reduce((sum, p) => sum + (p.views || 0), 0);

      viewsOverTime.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        views: dayViews,
      });
    }

    const analytics = {
      overview: {
        profileViews: projectViews + postViews,
        profileViewsChange: 0,
        totalLikes: projectLikes + postLikes,
        totalLikesChange: likesGrowth,
        totalComments: postComments,
        totalCommentsChange: 0,
        followers: followerCount,
        followersChange: 0,
      },
      viewsOverTime,
      engagementByType,
      topProjects: topProjects.map(p => ({
        title: p.title,
        views: p.views || 0,
        likes: p.likes?.length || 0,
      })),
      topPosts: topPosts.map(p => ({
        title: p.title || p.content.substring(0, 50),
        views: p.views || 0,
        likes: p.likes?.length || 0,
      })),
      skillEndorsements,
    };

    res.json(analytics);
  } catch (error) {
    console.error("Analytics /me error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
