const jwt = require('jsonwebtoken');

const connectedUsers = new Map(); // userId -> socketId

const setupSocket = (io) => {
  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    
    // Notify user is online
    socket.broadcast.emit('user:online', { userId: socket.userId });

    // Join user's personal room for targeted messages
    socket.join(`user:${socket.userId}`);

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      socket.to(`user:${data.recipientId}`).emit('typing:start', {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`user:${data.recipientId}`).emit('typing:stop', {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    // Handle private messages
    socket.on('message:send', (data) => {
      const recipientSocketId = connectedUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message:receive', data);
      }
    });

    // Handle notifications
    socket.on('notification:send', (data) => {
      const recipientSocketId = connectedUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('notification:new', data);
      }
    });

    // Handle message read receipts
    socket.on('message:read', (data) => {
      const senderSocketId = connectedUsers.get(data.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message:read', {
          conversationId: data.conversationId,
          messageId: data.messageId,
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
      
      // Notify user is offline
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });
  });
};

// Helper function to emit to specific user
const emitToUser = (io, userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

// Check if user is online
const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

// Get all online users
const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};

module.exports = {
  setupSocket,
  emitToUser,
  isUserOnline,
  getOnlineUsers,
};
