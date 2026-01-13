import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiPaperclip, FiMoreVertical } from 'react-icons/fi';
import { formatRelativeTime } from '../../utils/helpers';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

const MessageThread = ({ 
  conversation, 
  messages, 
  currentUserId, 
  onSendMessage,
  isLoading 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(newMessage);
    setNewMessage('');
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon="💬"
          title="Select a conversation"
          description="Choose a conversation from the list to start messaging"
        />
      </div>
    );
  }

  const otherUser = conversation.participants.find(p => p._id !== currentUserId);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar user={otherUser} size="md" showOnline />
            <div>
              <h3 className="font-semibold text-primary">{otherUser?.name}</h3>
              <p className="text-sm text-secondary">@{otherUser?.username}</p>
            </div>
          </div>
          
          <button className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-secondary">
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon="👋"
            title="Start the conversation"
            description="Send a message to get started"
          />
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwn = message.sender._id === currentUserId;
              const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;

              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {showAvatar ? (
                    <Avatar user={message.sender} size="sm" />
                  ) : (
                    <div className="w-10" />
                  )}
                  
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {showAvatar && (
                      <span className="text-xs text-secondary mb-1 px-2">
                        {message.sender.name}
                      </span>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-[#10b981] to-[#34d399] text-white'
                          : 'bg-[var(--surface-hover)] text-primary'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                    
                    <span className="text-xs text-secondary mt-1 px-2">
                      {formatRelativeTime(message.createdAt)}
                      {isOwn && message.isRead && ' • Read'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-secondary transition-colors"
          >
            <FiPaperclip size={20} />
          </button>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-primary placeholder-secondary resize-none focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            leftIcon={<FiSend />}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
