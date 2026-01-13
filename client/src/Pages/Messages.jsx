import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useSocket } from '../hooks/useSocket';
import { useAuthStore, useMessageStore } from '../store/useStore';
import MessageList from '../Components/messaging/MessageList';
import MessageThread from '../Components/messaging/MessageThread';
import PageTransition from '../Components/ui/PageTransition';
import { LoadingPage } from '../Components/ui/LoadingSpinner';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const socket = useSocket();

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        setConversations(data);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        const { data } = await api.get(
          `/messages/conversations/${activeConversation._id}/messages`
        );
        setMessages(data);

        // Mark as read
        await api.patch(`/messages/conversations/${activeConversation._id}/read`);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [activeConversation]);

  // Real-time message listener
  useEffect(() => {
    if (!socket.isConnected()) return;

    const handleNewMessage = (message) => {
      // Update messages if conversation is active
      if (activeConversation && message.conversation === activeConversation._id) {
        setMessages(prev => [...prev, message]);
      }

      // Update conversations list
      setConversations(prev => {
        const index = prev.findIndex(c => c._id === message.conversation);
        if (index > -1) {
          const updated = [...prev];
          updated[index].lastMessage = message;
          updated[index].lastMessageAt = message.createdAt;
          return updated;
        }
        return prev;
      });
    };

    socket.on('message:receive', handleNewMessage);

    return () => {
      socket.off('message:receive', handleNewMessage);
    };
  }, [socket, activeConversation]);

  const handleSendMessage = async (content) => {
    if (!activeConversation) return;

    try {
      const { data } = await api.post(
        `/messages/conversations/${activeConversation._id}/messages`,
        { content }
      );

      setMessages(prev => [...prev, data]);

      // Update conversation in list
      setConversations(prev => {
        const updated = [...prev];
        const index = updated.findIndex(c => c._id === activeConversation._id);
        if (index > -1) {
          updated[index].lastMessage = data;
          updated[index].lastMessageAt = data.createdAt;
          // Move to top
          updated.unshift(updated.splice(index, 1)[0]);
        }
        return updated;
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  if (isLoading) {
    return <LoadingPage message="Loading messages..." />;
  }

  return (
    <PageTransition>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <MessageList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            currentUserId={user?._id}
          />
        </div>

        {/* Main Chat Area */}
        <MessageThread
          conversation={activeConversation}
          messages={messages}
          currentUserId={user?._id}
          onSendMessage={handleSendMessage}
          isLoading={messagesLoading}
        />
      </div>
    </PageTransition>
  );
};

export default Messages;
