const User = require("../models/User");
const Project = require("../models/Project");
const Post = require("../models/Post");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const Endorsement = require("../models/Endorsement");
const Bookmark = require("../models/Bookmark");

/**
 * Add database indexes for better query performance
 */
async function addDatabaseIndexes() {
  console.log("🔧 Adding database indexes...");

  try {
    // Helper to create index safely
    const createIndexSafely = async (collection, keys, options = {}) => {
      try {
        await collection.createIndex(keys, options);
      } catch (error) {
        if (error.code !== 85 && !error.message.includes("already exists")) {
          throw error; // Re-throw if not an "already exists" error
        }
        // Ignore if index already exists
      }
    };

    // User indexes
    await createIndexSafely(User.collection, { skills: 1 });
    await createIndexSafely(User.collection, { followers: 1 });
    await createIndexSafely(User.collection, { following: 1 });
    console.log("✅ User indexes created");

    // Project indexes
    await createIndexSafely(Project.collection, { user: 1, createdAt: -1 });
    await createIndexSafely(Project.collection, { technologies: 1 });
    await createIndexSafely(Project.collection, { createdAt: -1 });
    await createIndexSafely(Project.collection, { views: -1 });
    await createIndexSafely(Project.collection, { likes: 1 });
    console.log("✅ Project indexes created");

    // Post indexes
    await createIndexSafely(Post.collection, { isPublished: 1, createdAt: -1 });
    console.log("✅ Post indexes created");

    // Message indexes
    await createIndexSafely(Message.collection, {
      conversation: 1,
      createdAt: -1,
    });
    await createIndexSafely(Message.collection, { sender: 1, recipient: 1 });
    await createIndexSafely(Message.collection, { recipient: 1, isRead: 1 });
    console.log("✅ Message indexes created");

    // Conversation indexes
    console.log("✅ Conversation indexes created");

    // Notification indexes
    await createIndexSafely(Notification.collection, {
      recipient: 1,
      createdAt: -1,
    });
    await createIndexSafely(Notification.collection, {
      recipient: 1,
      isRead: 1,
    });
    await createIndexSafely(Notification.collection, { createdAt: -1 });
    console.log("✅ Notification indexes created");

    // Endorsement indexes
    await createIndexSafely(Endorsement.collection, { to: 1, createdAt: -1 });
    console.log("✅ Endorsement indexes created");

    // Bookmark indexes
    await createIndexSafely(Bookmark.collection, { user: 1, createdAt: -1 });
    console.log("✅ Bookmark indexes created");

    console.log("🎉 All database indexes created successfully!");
  } catch (error) {
    console.error("❌ Error creating indexes:", error.message);
  }
}

/**
 * View existing indexes
 */
async function viewIndexes() {
  console.log("\n📊 Current Database Indexes:\n");

  const models = [
    { name: "User", model: User },
    { name: "Project", model: Project },
    { name: "Post", model: Post },
    { name: "Message", model: Message },
    { name: "Conversation", model: Conversation },
    { name: "Notification", model: Notification },
    { name: "Endorsement", model: Endorsement },
    { name: "Bookmark", model: Bookmark },
  ];

  for (const { name, model } of models) {
    try {
      const indexes = await model.collection.getIndexes();
      console.log(`\n${name}:`);
      Object.keys(indexes).forEach((indexName) => {
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
