import { useState } from "react";
import { motion } from "framer-motion";
import { FiTrendingUp, FiUsers, FiClock } from "react-icons/fi";
import PageTransition from "../Components/ui/PageTransition";
import PostFeed from "../Components/posts/PostFeed";
import { useAuthStore } from "../store/useStore";

export default function Feed() {
  const [feedType, setFeedType] = useState("following");
  const user = useAuthStore((state) => state.user);

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold heading-gradient mb-2">
              Your Feed
            </h1>
            <p className="text-secondary">
              Stay updated with posts from developers you follow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <PostFeed feedType={feedType} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Filter Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-surface p-6 rounded-xl"
              >
                <h3 className="font-semibold text-primary mb-4">Feed Options</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setFeedType("following")}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                      feedType === "following"
                        ? "bg-gradient-to-r from-[#10b981] to-[#34d399] text-white"
                        : "bg-[var(--surface-hover)] text-secondary hover:text-primary"
                    }`}
                  >
                    <FiUsers size={18} />
                    <span className="font-medium">Following</span>
                  </button>

                  <button
                    onClick={() => setFeedType("all")}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                      feedType === "all"
                        ? "bg-gradient-to-r from-[#10b981] to-[#34d399] text-white"
                        : "bg-[var(--surface-hover)] text-secondary hover:text-primary"
                    }`}
                  >
                    <FiTrendingUp size={18} />
                    <span className="font-medium">Trending</span>
                  </button>

                  <button
                    onClick={() => setFeedType("recent")}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                      feedType === "recent"
                        ? "bg-gradient-to-r from-[#10b981] to-[#34d399] text-white"
                        : "bg-[var(--surface-hover)] text-secondary hover:text-primary"
                    }`}
                  >
                    <FiClock size={18} />
                    <span className="font-medium">Recent</span>
                  </button>
                </div>
              </motion.div>

              {/* Trending Topics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-surface p-6 rounded-xl"
              >
                <h3 className="font-semibold text-primary mb-4">Trending Topics</h3>
                <div className="space-y-3">
                  {["#react", "#nodejs", "#typescript", "#webdev", "#javascript"].map((tag, index) => (
                    <motion.button
                      key={tag}
                      className="w-full px-4 py-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-left text-secondary hover:text-primary transition-colors"
                      whileHover={{ x: 4 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <span className="font-medium">{tag}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-surface p-6 rounded-xl"
              >
                <h3 className="font-semibold text-primary mb-4">Who to Follow</h3>
                <p className="text-sm text-secondary">
                  Discover developers and projects in the community
                </p>
                <button className="mt-4 w-full px-4 py-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-secondary hover:text-primary transition-colors font-medium">
                  Explore
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
