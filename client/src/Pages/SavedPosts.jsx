import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBookmark, FiFolder, FiTrash2 } from 'react-icons/fi';
import api from '../api/axios';
import PageTransition from '../Components/ui/PageTransition';
import PostCard from '../Components/posts/PostCard';
import { Card, Button, Badge } from '../Components/ui';
import { LoadingPage } from '../Components/ui/LoadingSpinner';
import EmptyState from '../Components/ui/EmptyState';
import { useAuthStore } from '../store/useStore';

const SavedPosts = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadBookmarks();
    loadCollections();
  }, [selectedCollection]);

  const loadBookmarks = async () => {
    try {
      const params = { itemType: 'post' };
      if (selectedCollection !== 'all') {
        params.collection = selectedCollection;
      }

      const { data } = await api.get('/bookmarks', { params });
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const { data } = await api.get('/bookmarks/collections');
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await api.delete(`/bookmarks/${bookmarkId}`);
      setBookmarks(bookmarks.filter(b => b._id !== bookmarkId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Loading saved posts..." />;
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold heading-gradient mb-2 flex items-center gap-3">
              <FiBookmark className="text-[#10b981]" />
              Saved Posts
            </h1>
            <p className="text-secondary">
              Access your bookmarked posts and articles
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Collections */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <FiFolder size={18} />
                  Collections
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCollection('all')}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center justify-between ${
                      selectedCollection === 'all'
                        ? 'bg-gradient-to-r from-[#10b981] to-[#34d399] text-white'
                        : 'bg-[var(--surface-hover)] text-secondary hover:text-primary'
                    }`}
                  >
                    <span className="font-medium">All Saved</span>
                    <Badge variant={selectedCollection === 'all' ? 'default' : 'default'}>
                      {bookmarks.length}
                    </Badge>
                  </button>

                  {collections.map((collection) => (
                    <button
                      key={collection.name}
                      onClick={() => setSelectedCollection(collection.name)}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center justify-between ${
                        selectedCollection === collection.name
                          ? 'bg-gradient-to-r from-[#10b981] to-[#34d399] text-white'
                          : 'bg-[var(--surface-hover)] text-secondary hover:text-primary'
                      }`}
                    >
                      <span className="font-medium capitalize">{collection.name}</span>
                      <Badge variant={selectedCollection === collection.name ? 'default' : 'default'}>
                        {collection.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Main Content - Saved Posts */}
            <div className="lg:col-span-3">
              {bookmarks.length === 0 ? (
                <EmptyState
                  icon="🔖"
                  title="No saved posts"
                  description={
                    selectedCollection === 'all'
                      ? "You haven't saved any posts yet. Start bookmarking posts to see them here!"
                      : `No posts in the "${selectedCollection}" collection`
                  }
                />
              ) : (
                <div className="space-y-6">
                  {bookmarks.map((bookmark, index) => (
                    <motion.div
                      key={bookmark._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Saved Indicator */}
                      <div className="absolute top-4 right-4 z-10">
                        <motion.div
                          className="bg-[#10b981] text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                        >
                          <FiBookmark size={14} fill="currentColor" />
                          <span className="text-xs font-medium">Saved</span>
                        </motion.div>
                      </div>

                      {/* Post Card */}
                      {bookmark.itemId && (
                        <PostCard
                          post={bookmark.itemId}
                          currentUser={user}
                          onPostDeleted={() => handleRemoveBookmark(bookmark._id)}
                        />
                      )}

                      {/* Bookmark Notes */}
                      {bookmark.notes && (
                        <Card className="mt-2 p-4 bg-[#10b981]/10 border-[#10b981]/30">
                          <p className="text-sm text-secondary">
                            <span className="font-semibold text-[#10b981]">Note:</span> {bookmark.notes}
                          </p>
                        </Card>
                      )}

                      {/* Quick Actions */}
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiTrash2 />}
                          onClick={() => handleRemoveBookmark(bookmark._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SavedPosts;
