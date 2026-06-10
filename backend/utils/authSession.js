import RefreshToken from '../models/RefreshToken.js';
import { signAccessToken, generateRefreshToken, hashToken } from './tokens.js';
import { setAuthCookies } from './cookies.js';

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

export const issueAuthSession = async (res, userId) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_MS),
  });

  setAuthCookies(res, accessToken, refreshToken);
  return accessToken;
};

export const rotateRefreshSession = async (res, oldRefreshToken) => {
  const tokenHash = hashToken(oldRefreshToken);
  const stored = await RefreshToken.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!stored) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  await RefreshToken.deleteOne({ _id: stored._id });
  await issueAuthSession(res, stored.user);
  return stored.user;
};

export const revokeRefreshToken = async (refreshToken) => {
  if (!refreshToken) return;
  await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
};

export const revokeAllUserTokens = async (userId) => {
  await RefreshToken.deleteMany({ user: userId });
};
