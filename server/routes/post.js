const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// Get all posts (feed)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, tag } = req.query;
    const query = { isPublished: true };

    if (userId) query.author = userId;
    if (tag) query.tags = tag;

    const posts = await Post.find(query)
      .populate("author", "name username avatar")
      .populate("comments.user", "name username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get following feed (posts from users you follow)
router.get("/feed", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const User = require("../models/User");

    const currentUser = await User.findById(req.userId);
    const followingIds = currentUser.following || [];

    const posts = await Post.find({
      author: { $in: [...followingIds, req.userId] },
      isPublished: true,
    })
      .populate("author", "name username avatar")
      .populate("comments.user", "name username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({
      author: { $in: [...followingIds, req.userId] },
      isPublished: true,
    });

    res.json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name username avatar bio")
      .populate("comments.user", "name username avatar");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post("/", auth, upload.array("images", 5), async (req, res) => {
  try {
    const { content, title, type, tags } = req.body;

    // Handle images from request
    const images =
      req.files?.map((file) => ({
        url: `/uploads/${file.filename}`,
        publicId: file.filename,
      })) || [];

    const post = await Post.create({
      author: req.userId,
      content,
      title,
      type: type || "post",
      images,
      tags: tags ? JSON.parse(tags) : [],
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name username avatar"
    );

    // Emit real-time event
    const io = req.app.get("io");
    io.emit("post:new", populatedPost);

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update post
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.userId,
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    const { content, title, tags, isPublished } = req.body;

    if (content) post.content = content;
    if (title) post.title = title;
    if (tags) post.tags = tags;
    if (typeof isPublished !== "undefined") post.isPublished = isPublished;

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "author",
      "name username avatar"
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.userId,
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.userId);

      // Create notification (non-blocking)
      if (post.author.toString() !== req.userId) {
        const Notification = require("../models/Notification");
        try {
          await Notification.create({
            recipient: post.author,
            sender: req.userId,
            type: "like",
            message: "liked your post",
          });
        } catch (err) {
          console.warn(
            "[notification] failed to create like notification:",
            err.message
          );
        }

        // Emit real-time notification regardless of DB result
        const io = req.app.get("io");
        io.to(`user:${post.author}`).emit("notification:new", {
          type: "like",
          message: "Someone liked your post",
        });
      }
    }

    await post.save();
    res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.userId,
      content,
    });

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "comments.user",
      "name username avatar"
    );

    // Create notification (non-blocking)
    if (post.author.toString() !== req.userId) {
      const Notification = require("../models/Notification");
      try {
        await Notification.create({
          recipient: post.author,
          sender: req.userId,
          type: "comment",
          message: "commented on your post",
        });
      } catch (err) {
        console.warn(
          "[notification] failed to create comment notification:",
          err.message
        );
      }
    }

    res.status(201).json(updatedPost.comments[updatedPost.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete comment
router.delete("/:postId/comments/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is comment author or post author
    if (
      comment.user.toString() !== req.userId &&
      post.author.toString() !== req.userId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Share post (repost)
router.post("/:id/share", auth, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id).populate(
      "author",
      "name username avatar"
    );

    if (!originalPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if already in shares array
    const shareIndex = originalPost.shares.indexOf(req.userId);
    if (shareIndex === -1) {
      originalPost.shares.push(req.userId);
      await originalPost.save();
    }

    // Create a new post that references the original
    const shareContent = `Shared from @${originalPost.author.username}:\n\n${originalPost.content}`;

    const sharedPost = await Post.create({
      author: req.userId,
      content: shareContent,
      type: "post",
      images: originalPost.images, // Copy images
      tags: [...originalPost.tags, "shared"], // Add shared tag
    });

    const populatedPost = await Post.findById(sharedPost._id).populate(
      "author",
      "name username avatar"
    );

    // Create notification for original author (non-blocking)
    if (originalPost.author._id.toString() !== req.userId) {
      const Notification = require("../models/Notification");
      try {
        await Notification.create({
          recipient: originalPost.author._id,
          sender: req.userId,
          type: "share",
          message: "shared your post",
        });
      } catch (err) {
        console.warn(
          "[notification] failed to create share notification:",
          err.message
        );
      }
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
