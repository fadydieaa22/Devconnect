import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiShare2, 
  FiBookmark,
  FiMoreVertical,
  FiTrash2,
  FiEdit,
  FiEye
} from 'react-icons/fi';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { Card } from '../ui';
import Dropdown, { DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { formatRelativeTime, formatNumber } from '../../utils/helpers';
import { getImageUrl } from '../../utils/imageUtils';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post, currentUser, onPostUpdated, onPostDeleted }) => {
  const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if current user is the author - handle both string and object ID formats
  const isAuthor = currentUser && post.author && (
    currentUser._id === post.author._id ||
    currentUser._id === post.author ||
    currentUser.id === post.author._id ||
    String(currentUser._id) === String(post.author._id)
  );

  // Debug logging - remove after testing
  console.log('PostCard isAuthor check:', {
    isAuthor,
    currentUserId: currentUser?._id,
    postAuthorId: post.author?._id,
    currentUser: currentUser,
    postAuthor: post.author
  });

  // Check if post is bookmarked
  useEffect(() => {
    const checkBookmark = async () => {
      if (!currentUser) return;
      try {
        const { data } = await api.get(`/bookmarks/check/post/${post._id}`);
        setIsBookmarked(data.isBookmarked);
      } catch (error) {
        console.error('Failed to check bookmark:', error);
      }
    };
    checkBookmark();
  }, [post._id, currentUser]);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setIsLiked(data.isLiked);
      setLikeCount(data.likes);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, {
        content: commentText,
      });
      setComments([...comments, data]);
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post deleted');
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        // Remove bookmark - need to find bookmark ID first
        const { data } = await api.get(`/bookmarks?itemType=post`);
        const bookmark = data.find(b => b.itemId._id === post._id);
        if (bookmark) {
          await api.delete(`/bookmarks/${bookmark._id}`);
          setIsBookmarked(false);
          toast.success('Bookmark removed');
        }
      } else {
        // Add bookmark
        await api.post('/bookmarks', {
          itemType: 'post',
          itemId: post._id,
        });
        setIsBookmarked(true);
        toast.success('Post bookmarked');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to bookmark');
    }
  };

  const handleShare = async () => {
    try {
      // Create a shared post (repost functionality)
      const shareContent = `Shared from @${post.author.username}: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`;
      
      await api.post(`/posts/${post._id}/share`);
      
      toast.success('Post shared to your profile!');
      
      // Optional: Also copy link to clipboard
      const postUrl = `${window.location.origin}/profile/${post.author.username}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share post');
    }
  };

  return (
    <Card className="p-6 relative">
      {/* Bookmark Indicator */}
      {isBookmarked && (
        <motion.div
          className="absolute top-4 right-16 bg-[#10b981] text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' }}
        >
          <FiBookmark size={12} fill="currentColor" />
          <span className="text-xs font-medium">Saved</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3">
          <Avatar user={post.author} size="md" />
          <div>
            <p className="font-semibold text-primary hover:text-[#10b981] transition-colors">
              {post.author.name}
            </p>
            <p className="text-sm text-secondary">
              @{post.author.username} • {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </Link>

        <Dropdown
          trigger={
            <button className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-secondary">
              <FiMoreVertical size={20} />
            </button>
          }
        >
          <DropdownItem 
            icon={<FiBookmark fill={isBookmarked ? 'currentColor' : 'none'} />} 
            onClick={handleBookmark}
          >
            {isBookmarked ? '✓ Saved' : 'Save Post'}
          </DropdownItem>
          <DropdownItem icon={<FiShare2 />} onClick={handleShare}>
            Share to Profile
          </DropdownItem>
          {isAuthor && (
            <>
              <DropdownDivider />
              <DropdownItem icon={<FiEdit />}>
                Edit Post
              </DropdownItem>
              <DropdownItem icon={<FiTrash2 />} onClick={handleDelete} danger>
                Delete Post
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>

      {/* Type Badge */}
      {post.type !== 'post' && (
        <Badge 
          variant={post.type === 'article' ? 'primary' : 'warning'} 
          className="mb-3"
        >
          {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
        </Badge>
      )}

      {/* Title (for articles) */}
      {post.title && (
        <h3 className="text-xl font-bold text-primary mb-2">
          {post.title}
        </h3>
      )}

      {/* Content */}
      <div className="text-primary mb-4 whitespace-pre-wrap">
        {post.content.length > 500 && !showComments ? (
          <>
            {post.content.substring(0, 500)}...
            <button 
              onClick={() => setShowComments(true)}
              className="text-[#10b981] hover:underline ml-2"
            >
              Read more
            </button>
          </>
        ) : (
          post.content
        )}
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 mb-4 ${
          post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 2 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {post.images.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="relative aspect-video rounded-lg overflow-hidden bg-[var(--surface-hover)]"
            >
              <img
                src={getImageUrl(image.url)}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load image:', image.url);
                  e.target.style.display = 'none';
                }}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="default" size="sm">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-secondary mb-4 pb-4 border-b border-[var(--border)]">
        <span className="flex items-center gap-1">
          <FiHeart size={16} />
          {formatNumber(likeCount)} likes
        </span>
        <span className="flex items-center gap-1">
          <FiMessageCircle size={16} />
          {formatNumber(comments.length)} comments
        </span>
        <span className="flex items-center gap-1">
          <FiEye size={16} />
          {formatNumber(post.views || 0)} views
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={handleLike}
          className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            isLiked
              ? 'bg-red-500/10 text-red-500'
              : 'bg-[var(--surface-hover)] text-secondary hover:text-primary'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <FiHeart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="font-medium">Like</span>
        </motion.button>

        <motion.button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 px-4 rounded-lg bg-[var(--surface-hover)] text-secondary hover:text-primary flex items-center justify-center gap-2 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <FiMessageCircle size={18} />
          <span className="font-medium">Comment</span>
        </motion.button>

        <motion.button
          onClick={handleShare}
          className="flex-1 py-2 px-4 rounded-lg bg-[var(--surface-hover)] text-secondary hover:text-primary flex items-center justify-center gap-2 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <FiShare2 size={18} />
          <span className="font-medium">Share</span>
        </motion.button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-[var(--border)]"
        >
          {/* Comment Form */}
          {currentUser && (
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex gap-2">
                <Avatar user={currentUser} size="sm" />
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-medium disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <Avatar user={comment.user} size="sm" />
                <div className="flex-1">
                  <div className="bg-[var(--surface-hover)] rounded-lg p-3">
                    <Link 
                      to={`/profile/${comment.user.username}`}
                      className="font-semibold text-primary hover:text-[#10b981]"
                    >
                      {comment.user.name}
                    </Link>
                    <p className="text-sm text-secondary mt-1">{comment.content}</p>
                  </div>
                  <p className="text-xs text-secondary mt-1 ml-3">
                    {formatRelativeTime(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default PostCard;
