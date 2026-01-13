import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { formatRelativeTime } from '../../utils/helpers';
import Avatar from '../ui/Avatar';
import Input from '../ui/Input';
import { useState } from 'react';

const MessageList = ({ conversations, activeConversation, onSelectConversation, currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find(p => p._id !== currentUserId);
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <h2 className="text-xl font-bold heading-gradient mb-4">Messages</h2>
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<FiSearch />}
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-secondary">
            <p className="text-4xl mb-2">💬</p>
            <p>No conversations yet</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = conversation.participants.find(p => p._id !== currentUserId);
            const isActive = activeConversation?._id === conversation._id;
            const unreadCount = conversation.unreadCount?.get?.(currentUserId) || 0;

            return (
              <motion.div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 cursor-pointer transition-colors border-b border-[var(--border)] ${
                  isActive ? 'bg-[var(--surface-hover)]' : 'hover:bg-[var(--surface-hover)]'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <Avatar user={otherUser} size="md" showOnline />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-primary truncate">
                        {otherUser?.name}
                      </h3>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-secondary ml-2 flex-shrink-0">
                          {formatRelativeTime(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-secondary truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      
                      {unreadCount > 0 && (
                        <motion.span
                          className="ml-2 px-2 py-0.5 bg-[#10b981] text-white text-xs rounded-full flex-shrink-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {unreadCount}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessageList;
