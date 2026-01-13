const express = require("express");
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// get user notifications
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate("sender", "name username avatar")
      .populate("project", "title")
      .populate("post", "title content")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// mark notification as read
router.put("/:notificationId/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// mark all as read
router.put("/mark/all-as-read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete notification
router.delete("/:notificationId", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Notification.findByIdAndDelete(req.params.notificationId);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
