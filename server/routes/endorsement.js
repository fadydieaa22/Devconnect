const express = require('express');
const Endorsement = require('../models/Endorsement');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get endorsements for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const endorsements = await Endorsement.find({ to: req.params.userId })
      .populate('from', 'name username avatar')
      .sort({ createdAt: -1 });

    // Group by skill
    const groupedBySkill = endorsements.reduce((acc, endorsement) => {
      const skill = endorsement.skill;
      if (!acc[skill]) {
        acc[skill] = [];
      }
      acc[skill].push(endorsement);
      return acc;
    }, {});

    res.json({
      endorsements,
      grouped: groupedBySkill,
      total: endorsements.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get endorsements given by a user
router.get('/from/:userId', async (req, res) => {
  try {
    const endorsements = await Endorsement.find({ from: req.params.userId })
      .populate('to', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json(endorsements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create endorsement
router.post('/', auth, async (req, res) => {
  try {
    const { userId, skill, message } = req.body;

    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot endorse yourself' });
    }

    // Check if user exists and has this skill
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.skills.includes(skill)) {
      return res.status(400).json({ message: 'User does not have this skill' });
    }

    // Check if already endorsed
    const existing = await Endorsement.findOne({
      from: req.userId,
      to: userId,
      skill,
    });

    if (existing) {
      return res.status(400).json({ message: 'Already endorsed this skill' });
    }

    const endorsement = await Endorsement.create({
      from: req.userId,
      to: userId,
      skill,
      message,
    });

    const populatedEndorsement = await Endorsement.findById(endorsement._id)
      .populate('from', 'name username avatar');

    // Create notification (non-blocking)
    const Notification = require('../models/Notification');
    try {
      await Notification.create({
        recipient: userId,
        sender: req.userId,
        type: 'endorsement',
        message: `endorsed your skill: ${skill}`,
      });
    } catch (err) {
      console.warn('[notification] failed to create endorsement notification:', err.message);
    }

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('notification:new', {
      type: 'endorsement',
      message: `Someone endorsed your ${skill} skill`,
    });

    res.status(201).json(populatedEndorsement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove endorsement
router.delete('/:id', auth, async (req, res) => {
  try {
    const endorsement = await Endorsement.findOne({
      _id: req.params.id,
      from: req.userId,
    });

    if (!endorsement) {
      return res.status(404).json({ message: 'Endorsement not found or unauthorized' });
    }

    await endorsement.deleteOne();
    res.json({ message: 'Endorsement removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
