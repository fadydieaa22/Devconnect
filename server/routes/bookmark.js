const express = require('express');
const Bookmark = require('../models/Bookmark');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get all bookmarks for current user
router.get('/', auth, async (req, res) => {
  try {
    const { collection, itemType } = req.query;
    const query = { user: req.userId };

    if (collection) query.collection = collection;
    if (itemType) query.itemType = itemType;

    const bookmarks = await Bookmark.find(query)
      .populate('itemId')
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookmark collections
router.get('/collections', auth, async (req, res) => {
  try {
    const collections = await Bookmark.distinct('collection', { user: req.userId });
    
    const collectionsWithCount = await Promise.all(
      collections.map(async (collection) => {
        const count = await Bookmark.countDocuments({
          user: req.userId,
          collection,
        });
        return { name: collection, count };
      })
    );

    res.json(collectionsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add bookmark
router.post('/', auth, async (req, res) => {
  try {
    const { itemType, itemId, collection, notes } = req.body;

    // Map itemType to model name
    const modelMap = {
      project: 'Project',
      post: 'Post',
      user: 'User',
    };

    const bookmark = await Bookmark.create({
      user: req.userId,
      itemType,
      itemId,
      itemModel: modelMap[itemType],
      collection: collection || 'general',
      notes,
    });

    const populatedBookmark = await Bookmark.findById(bookmark._id)
      .populate('itemId');

    res.status(201).json(populatedBookmark);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item already bookmarked' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update bookmark
router.patch('/:id', auth, async (req, res) => {
  try {
    const { collection, notes } = req.body;

    const bookmark = await Bookmark.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    if (collection) bookmark.collection = collection;
    if (notes !== undefined) bookmark.notes = notes;

    await bookmark.save();

    const updatedBookmark = await Bookmark.findById(bookmark._id)
      .populate('itemId');

    res.json(updatedBookmark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove bookmark
router.delete('/:id', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    await bookmark.deleteOne();
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if item is bookmarked
router.get('/check/:itemType/:itemId', auth, async (req, res) => {
  try {
    const { itemType, itemId } = req.params;

    const bookmark = await Bookmark.findOne({
      user: req.userId,
      itemType,
      itemId,
    });

    res.json({ isBookmarked: !!bookmark, bookmark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
