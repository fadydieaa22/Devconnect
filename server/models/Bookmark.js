const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemType: {
      type: String,
      enum: ['project', 'post', 'user'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemModel',
    },
    itemModel: {
      type: String,
      required: true,
      enum: ['Project', 'Post', 'User'],
    },
    collection: {
      type: String,
      default: 'general',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate bookmarks
bookmarkSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, collection: 1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
