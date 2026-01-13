const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const Comment = require("../models/Comment");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const router = express.Router();

/**
 * Comments
 */
// add comment
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({ message: "Comment content required" });
    }
    const comment = await Comment.create({
      project: project._id,
      user: req.userId,
      content: req.body.content.trim(),
    });
    const populated = await comment.populate("user", "name username avatar");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// get comments for a project
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ project: req.params.id })
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete comment
router.delete("/comments/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.user.toString() !== req.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Like/unlike a project
 */
router.post("/:id/like", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const userId = req.userId;
    const idx = (project.likes || []).findIndex((l) => l.toString() === userId);

    let liked = false;
    if (idx === -1) {
      project.likes = project.likes || [];
      project.likes.push(userId);
      liked = true;
    } else {
      project.likes.splice(idx, 1);
      liked = false;
    }

    await project.save();
    res.json({ likesCount: project.likes.length, liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * =========================
 * Get projects by username (PUBLIC)
 * =========================
 */
router.get("/user/:username", async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = await Project.find({ user: user._id }).sort({
      createdAt: -1,
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * =========================
 * Get projects by userId (GET /projects/user/:userId)
 * =========================
 */
router.get("/user/:userId/projects", async (req, res) => {
  try {
    const projects = await Project.find({ user: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * =========================
 * Create project (supports image upload and links)
 * =========================
 */
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    // normalize techStack if sent as JSON string or comma-separated
    let techStack = req.body.techStack;
    if (typeof techStack === "string") {
      try {
        techStack = JSON.parse(techStack);
      } catch (_) {
        techStack = techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const projectData = {
      title: req.body.title,
      description: req.body.description,
      techStack: Array.isArray(techStack) ? techStack : [],
      liveUrl: req.body.liveUrl,
      githubUrl: req.body.githubUrl,
      user: req.userId,
    };

    if (req.file) {
      const filePath = req.file.path;
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "devconnect/projects",
        });
        projectData.image = result.secure_url;
        projectData.imagePublicId = result.public_id;
        fs.unlink(filePath, () => {});
      } catch (err) {
        console.warn("Cloudinary upload failed, using local file", err.message);
        projectData.image = `/uploads/${req.file.filename}`;
      }
    }

    const project = await Project.create(projectData);

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * =========================
 * Get my projects
 * =========================
 */
router.get("/me", auth, async (req, res) => {
  const projects = await Project.find({ user: req.userId });
  res.json(projects);
});

/**
 * =========================
 * Delete project
 * =========================
 */
router.delete("/:id", auth, async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project || project.user.toString() !== req.userId) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // remove image from cloudinary if present
  if (project.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(project.imagePublicId);
    } catch (err) {
      console.error("Failed to remove image from cloudinary:", err.message);
    }
  }

  await project.deleteOne();
  res.json({ message: "Project deleted" });
});

/**
 * =========================
 * Get project by id (PUBLIC)
 * =========================
 */
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "user",
      "name username avatar"
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * =========================
 * Update project (owner only)
 * =========================
 */
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.user.toString() !== req.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // normalize techStack
    let techStack = req.body.techStack;
    if (typeof techStack === "string") {
      try {
        techStack = JSON.parse(techStack);
      } catch (_) {
        techStack = techStack
          ? techStack
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      }
    }

    project.title = req.body.title ?? project.title;
    project.description = req.body.description ?? project.description;
    project.techStack = Array.isArray(techStack)
      ? techStack
      : project.techStack;
    project.liveUrl = req.body.liveUrl ?? project.liveUrl;
    project.githubUrl = req.body.githubUrl ?? project.githubUrl;

    if (req.file) {
      // remove previous image from cloudinary
      if (project.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(project.imagePublicId);
        } catch (err) {
          console.error("Failed to remove old image:", err.message);
        }
      }
      const filePath = req.file.path;
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "devconnect/projects",
        });
        project.image = result.secure_url;
        project.imagePublicId = result.public_id;
        fs.unlink(filePath, () => {});
      } catch (err) {
        console.warn("Cloudinary upload failed, using local file", err.message);
        project.image = `/uploads/${req.file.filename}`;
      }
    }

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * =========================
 * Search projects
 * =========================
 */
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || "";

    if (query.trim().length < 2) {
      return res.json([]);
    }

    const projects = await Project.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { techStack: { $in: [new RegExp(query, "i")] } },
      ],
    })
      .populate("user", "name username avatar")
      .limit(10);

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * =========================
 * Get all projects (PUBLIC)
 * =========================
 */
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
