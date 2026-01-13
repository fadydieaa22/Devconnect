import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiImage, FiX, FiHash } from 'react-icons/fi';
import Modal from '../ui/Modal';
import { Button, Input, TextArea, Badge } from '../ui';
import Avatar from '../ui/Avatar';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CreatePostModal = ({ isOpen, onClose, user, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('post');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please write some content');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', type);
      if (title) formData.append('title', title);
      formData.append('tags', JSON.stringify(tags));
      
      images.forEach(image => {
        formData.append('images', image);
      });

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(type === 'article' ? 'Article published!' : 'Post created!');
      
      if (onPostCreated) {
        onPostCreated(data);
      }
      
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setTitle('');
    setType('post');
    setTags([]);
    setTagInput('');
    setImages([]);
    setImagePreviews([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Post" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar user={user} size="md" />
          <div>
            <p className="font-semibold text-primary">{user?.name}</p>
            <p className="text-sm text-secondary">@{user?.username}</p>
          </div>
        </div>

        {/* Post Type Selector */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === 'post' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setType('post')}
          >
            Post
          </Button>
          <Button
            type="button"
            variant={type === 'article' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setType('article')}
          >
            Article
          </Button>
          <Button
            type="button"
            variant={type === 'announcement' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setType('announcement')}
          >
            Announcement
          </Button>
        </div>

        {/* Title (for articles) */}
        {type === 'article' && (
          <Input
            label="Title"
            placeholder="Give your article a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required={type === 'article'}
          />
        )}

        {/* Content */}
        <TextArea
          label="Content"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={type === 'article' ? 10 : 6}
          helperText={`${content.length}/5000 characters`}
          maxLength={5000}
          required
        />

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {imagePreviews.map((preview, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Tags (up to 10)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <Badge
                key={tag}
                variant="primary"
                removable
                onRemove={() => removeTag(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add tags (press Enter or comma)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            leftIcon={<FiHash />}
            disabled={tags.length >= 10}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="post-images"
              disabled={images.length >= 5}
            />
            <label htmlFor="post-images">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<FiImage />}
                disabled={images.length >= 5}
                onClick={() => document.getElementById('post-images').click()}
              >
                Add Images ({images.length}/5)
              </Button>
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!content.trim()}
            >
              {type === 'article' ? 'Publish Article' : 'Post'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
