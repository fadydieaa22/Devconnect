import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiUserPlus, 
  FiAward, 
  FiFileText,
  FiX,
  FiCheck
} from 'react-icons/fi';
import api from '../api/axios';
import { useSocket } from '../hooks/useSocket';
import { useNotificationStore } from '../store/useStore';
import { formatRelativeTime } from '../utils/helpers';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();
  const { setNotifications: setStoreNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!socket.isConnected()) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setStoreNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark/all-as-read');
      markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FiHeart className="text-red-500" />;
      case 'comment':
        return <FiMessageCircle className="text-blue-500" />;
      case 'follow':
        return <FiUserPlus className="text-green-500" />;
      case 'endorsement':
        return <FiAward className="text-yellow-500" />;
      case 'post':
        return <FiFileText className="text-purple-500" />;
      default:
        return <FiMessageCircle className="text-gray-500" />;
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.project) return `/project/${notification.project._id}`;
    if (notification.post) return `/posts/${notification.post._id}`;
    if (notification.sender) return `/profile/${notification.sender.username}`;
    return '#';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-[var(--surface)] shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-xl font-bold heading-gradient">Notifications</h2>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.isRead) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    leftIcon={<FiCheck />}
                  >
                    Mark all read
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  icon="🔔"
                  title="No notifications"
                  description="You're all caught up!"
                />
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-[var(--surface-hover)] transition-colors ${
                        !notification.isRead ? 'bg-[var(--surface-hover)]/50' : ''
                      }`}
                    >
                      <Link
                        to={getNotificationLink(notification)}
                        onClick={() => {
                          if (!notification.isRead) {
                            handleMarkAsRead(notification._id);
                          }
                          onClose();
                        }}
                        className="flex gap-3"
                      >
                        <Avatar user={notification.sender} size="sm" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-semibold text-primary">
                                  {notification.sender?.name}
                                </span>{' '}
                                <span className="text-secondary">
                                  {notification.message}
                                </span>
                              </p>
                              
                              {(notification.project || notification.post) && (
                                <p className="text-xs text-secondary mt-1 truncate">
                                  {notification.project?.title || notification.post?.title}
                                </p>
                              )}
                              
                              <p className="text-xs text-secondary mt-1">
                                {formatRelativeTime(notification.createdAt)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getNotificationIcon(notification.type)}
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(notification._id);
                        }}
                        className="ml-auto mt-2 text-xs text-secondary hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
