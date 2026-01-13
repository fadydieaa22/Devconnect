const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// current user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// update profile
router.put("/profile", auth, upload.single("avatar"), async (req, res) => {
  const { name, username, bio } = req.body;

  if (username) {
    const existing = await User.findOne({
      username: username.toLowerCase().trim(),
    });
    if (existing && existing._id.toString() !== req.userId) {
      return res.status(400).json({ message: "Username already taken" });
    }
  }

  const updateData = {
    name,
    username: username ? username.toLowerCase().trim() : username,
    bio,
  };

  if (req.file) {
    updateData.avatar = `/uploads/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.userId, updateData, {
    new: true,
  }).select("-password");

  res.json(user);
});
// search users
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || "";

    if (query.trim().length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
      ],
    })
      .select("name username avatar bio")
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// list public users
router.get("/", async (req, res) => {
  const users = await User.find().select("name username avatar bio");
  res.json(users);
});
// public user by username (moved to bottom to avoid route shadowing)

// Send follow request
router.post("/:userId/follow", auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    if (!userToFollow)
      return res.status(404).json({ message: "User not found" });

    if (req.userId === req.params.userId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const currentUser = await User.findById(req.userId);

    // Use string comparisons to avoid ObjectId vs string mismatches
    const followingIds = (currentUser.following || []).map((id) =>
      id.toString()
    );
    if (followingIds.includes(req.params.userId)) {
      console.warn(
        `[follow] user ${req.userId} already following ${req.params.userId}`
      );
      return res.status(400).json({ message: "Already following this user" });
    }

    // Check if request already sent
    const requestIds = (userToFollow.followRequests || []).map((id) =>
      id.toString()
    );
    if (requestIds.includes(req.userId)) {
      console.warn(
        `[follow] follow request from ${req.userId} to ${req.params.userId} already exists`
      );
      return res.status(400).json({ message: "Follow request already sent" });
    }

    // Add to follow requests
    userToFollow.followRequests.push(req.userId);
    await userToFollow.save();

    // Create notification (non-blocking)
    const Notification = require("../models/Notification");
    try {
      await Notification.create({
        recipient: userToFollow._id,
        sender: req.userId,
        type: "follow_request",
        message: "sent you a follow request",
      });
    } catch (err) {
      console.warn(
        "[notification] failed to create follow_request notification:",
        err.message
      );
    }

    res.json({ message: "Follow request sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// unfollow a user
router.post("/:userId/unfollow", auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    if (!userToUnfollow)
      return res.status(404).json({ message: "User not found" });

    const currentUser = await User.findById(req.userId);

    const followingIds = (currentUser.following || []).map((id) =>
      id.toString()
    );
    if (!followingIds.includes(req.params.userId)) {
      console.warn(
        `[unfollow] user ${req.userId} attempted to unfollow ${req.params.userId} but was not following`
      );
      return res.status(400).json({ message: "Not following this user" });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.userId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept follow request
router.post("/follow-request/:requesterId/accept", auth, async (req, res) => {
  try {
    const requester = await User.findById(req.params.requesterId);
    if (!requester) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.userId);

    // Check if request exists (compare strings to be safe)
    const reqIds = (currentUser.followRequests || []).map((id) =>
      id.toString()
    );
    if (!reqIds.includes(req.params.requesterId)) {
      console.warn(
        `[follow-request] user ${req.userId} attempted to accept non-existent request from ${req.params.requesterId}`
      );
      return res
        .status(400)
        .json({ message: "No follow request from this user" });
    }

    // Remove from requests
    currentUser.followRequests = currentUser.followRequests.filter(
      (id) => id.toString() !== req.params.requesterId
    );

    // Add to followers/following
    currentUser.followers.push(req.params.requesterId);
    requester.following.push(req.userId);

    await currentUser.save();
    await requester.save();

    // Create notification (non-blocking)
    const Notification = require("../models/Notification");
    try {
      await Notification.create({
        recipient: requester._id,
        sender: req.userId,
        type: "follow_accepted",
        message: "accepted your follow request",
      });
    } catch (err) {
      console.warn(
        "[notification] failed to create follow_accepted notification:",
        err.message
      );
    }

    res.json({ message: "Follow request accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject follow request
router.post("/follow-request/:requesterId/reject", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

    // Check if request exists (compare strings to be safe)
    const reqIds = (currentUser.followRequests || []).map((id) =>
      id.toString()
    );
    if (!reqIds.includes(req.params.requesterId)) {
      console.warn(
        `[follow-request] user ${req.userId} attempted to reject non-existent request from ${req.params.requesterId}`
      );
      return res
        .status(400)
        .json({ message: "No follow request from this user" });
    }

    // Remove from requests
    currentUser.followRequests = currentUser.followRequests.filter(
      (id) => id.toString() !== req.params.requesterId
    );

    await currentUser.save();

    res.json({ message: "Follow request rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get follow requests
router.get("/follow-requests", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).populate(
      "followRequests",
      "name username avatar bio"
    );

    res.json(currentUser.followRequests || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// public user by username
router.get("/:username", async (req, res) => {
  const user = await User.findOne({
    username: req.params.username,
  })
    .select("-password")
    .populate("followers", "name username avatar")
    .populate("following", "name username avatar");

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

module.exports = router;
