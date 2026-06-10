import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

export const getTokenFromHandshake = (handshake) => {
  if (handshake.auth?.token) return handshake.auth.token;

  if (handshake.headers?.cookie) {
    const cookies = cookie.parse(handshake.headers.cookie);
    if (cookies.accessToken) return cookies.accessToken;
  }

  return null;
};
