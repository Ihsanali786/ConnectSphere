import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });

export const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
