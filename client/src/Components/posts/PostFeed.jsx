import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { Button } from "../ui";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";
import { useAuthStore } from "../../store/useStore";
import api from "../../api/axios";

const PostFeed = ({ userId, feedType = "all" }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const user = useAuthStore((state) => state.user);
  const observerTarget = useRef(null);

  // Load posts
  const loadPosts = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (pageNum === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        const endpoint = feedType === "following" ? "/posts/feed" : "/posts";
        const params = { page: pageNum, limit: 10 };
        if (userId) params.userId = userId;

        const { data } = await api.get(endpoint, { params });

        if (append) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }

        setHasMore(data.currentPage < data.totalPages);
        setPage(pageNum);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [feedType, userId]
  );

  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadPosts(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, page, loadPosts]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      {user && !userId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-surface p-4 rounded-xl">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface)] border border-[var(--border)] text-left text-secondary hover:text-primary transition-colors flex items-center gap-3"
            >
              <FiPlus size={20} />
              <span>Share your thoughts...</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs (optional) */}
      {!userId && (
        <div className="flex gap-2">
          <Button
            variant={feedType === "all" ? "primary" : "secondary"}
            size="sm"
          >
            All Posts
          </Button>
          <Button
            variant={feedType === "following" ? "primary" : "secondary"}
            size="sm"
          >
            Following
          </Button>
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No posts yet"
          description={
            userId
              ? "This user hasn't posted anything yet"
              : "Be the first to share something with the community!"
          }
          actionLabel={!userId ? "Create Post" : undefined}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard
                  post={post}
                  currentUser={user}
                  onPostDeleted={handlePostDeleted}
                />
              </motion.div>
            ))}
          </div>

          {/* Loading indicator for infinite scroll */}
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-8">
              {isLoadingMore && <LoadingSpinner />}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-secondary py-8">
              You've reached the end! 🎉
            </p>
          )}
        </>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        user={user}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default PostFeed;
