const User = require('../models/User');
const Project = require('../models/Project');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const Endorsement = require('../models/Endorsement');
const Bookmark = require('../models/Bookmark');

/**
 * Add database indexes for better query performance
 */
async function addDatabaseIndexes() {
  console.log('🔧 Adding database indexes...');

  try {
    // User indexes
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ skills: 1 });
    await User.collection.createIndex({ followers: 1 });
    await User.collection.createIndex({ following: 1 });
    console.log('✅ User indexes created');

    // Project indexes
    await Project.collection.createIndex({ user: 1, createdAt: -1 });
    await Project.collection.createIndex({ technologies: 1 });
    await Project.collection.createIndex({ createdAt: -1 });
    await Project.collection.createIndex({ views: -1 });
    await Project.collection.createIndex({ 'likes': 1 });
    console.log('✅ Project indexes created');

    // Post indexes
    await Post.collection.createIndex({ author: 1, createdAt: -1 });
    await Post.collection.createIndex({ tags: 1 });
    await Post.collection.createIndex({ createdAt: -1 });
    await Post.collection.createIndex({ likes: 1 });
    await Post.collection.createIndex({ isPublished: 1, createdAt: -1 });
    console.log('✅ Post indexes created');

    // Message indexes
    await Message.collection.createIndex({ conversation: 1, createdAt: -1 });
    await Message.collection.createIndex({ sender: 1, recipient: 1 });
    await Message.collection.createIndex({ recipient: 1, isRead: 1 });
    console.log('✅ Message indexes created');

    // Conversation indexes
    await Conversation.collection.createIndex({ participants: 1 });
    await Conversation.collection.createIndex({ lastMessageAt: -1 });
    console.log('✅ Conversation indexes created');

    // Notification indexes
    await Notification.collection.createIndex({ recipient: 1, createdAt: -1 });
    await Notification.collection.createIndex({ recipient: 1, isRead: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });
    console.log('✅ Notification indexes created');

    // Endorsement indexes
    await Endorsement.collection.createIndex({ to: 1, skill: 1 });
    await Endorsement.collection.createIndex({ from: 1 });
    await Endorsement.collection.createIndex({ to: 1, createdAt: -1 });
    console.log('✅ Endorsement indexes created');

    // Bookmark indexes
    await Bookmark.collection.createIndex({ user: 1, itemType: 1, itemId: 1 }, { unique: true });
    await Bookmark.collection.createIndex({ user: 1, collection: 1 });
    await Bookmark.collection.createIndex({ user: 1, createdAt: -1 });
    console.log('✅ Bookmark indexes created');

    console.log('🎉 All database indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
}

/**
 * View existing indexes
 */
async function viewIndexes() {
  console.log('\n📊 Current Database Indexes:\n');

  const models = [
    { name: 'User', model: User },
    { name: 'Project', model: Project },
    { name: 'Post', model: Post },
    { name: 'Message', model: Message },
    { name: 'Conversation', model: Conversation },
    { name: 'Notification', model: Notification },
    { name: 'Endorsement', model: Endorsement },
    { name: 'Bookmark', model: Bookmark },
  ];

  for (const { name, model } of models) {
    try {
      const indexes = await model.collection.getIndexes();
      console.log(`\n${name}:`);
      Object.keys(indexes).forEach(indexName => {
        console.log(`  - ${indexName}`);
      });
    } catch (error) {
      console.log(`  ⚠️ Error getting ${name} indexes`);
    }
  }
}

module.exports = {
  addDatabaseIndexes,
  viewIndexes,
};
