const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
      .populate('participants', 'name username avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get or create conversation with another user
router.post('/conversations', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (recipientId === req.userId) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] }
    })
      .populate('participants', 'name username avatar')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.userId, recipientId],
        unreadCount: {
          [req.userId]: 0,
          [recipientId]: 0,
        }
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name username avatar');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { conversation: conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, attachments } = req.body;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const recipientId = conversation.participants.find(
      id => id.toString() !== req.userId
    );

    const message = await Message.create({
      conversation: conversationId,
      sender: req.userId,
      recipient: recipientId,
      content,
      attachments: attachments || [],
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    
    const currentUnread = conversation.unreadCount.get(recipientId.toString()) || 0;
    conversation.unreadCount.set(recipientId.toString(), currentUnread + 1);
    
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name username avatar');

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`user:${recipientId}`).emit('message:receive', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.patch('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        recipient: req.userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Reset unread count
    conversation.unreadCount.set(req.userId, 0);
    await conversation.save();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a message
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.userId,
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
