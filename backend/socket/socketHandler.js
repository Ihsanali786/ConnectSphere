import jwt from 'jsonwebtoken';
import { getTokenFromHandshake } from '../middleware/authMiddleware.js';

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.use((socket, next) => {
    const token = getTokenFromHandshake(socket.handshake);
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    socket.join(userId);

    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    socket.on('joinPost', (postId) => {
      if (postId) socket.join(`post:${postId}`);
    });

    socket.on('leavePost', (postId) => {
      if (postId) socket.leave(`post:${postId}`);
    });

    socket.on('typing', ({ postId, username }) => {
      if (postId) {
        socket.to(`post:${postId}`).emit('userTyping', { postId, username });
      }
    });

    socket.on('stopTyping', ({ postId }) => {
      if (postId) {
        socket.to(`post:${postId}`).emit('userStopTyping', { postId });
      }
    });

    socket.on('disconnect', () => {
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
      }
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};
