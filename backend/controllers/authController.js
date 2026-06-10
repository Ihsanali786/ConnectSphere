import User from '../models/User.js';
import { issueAuthSession, rotateRefreshSession, revokeRefreshToken, revokeAllUserTokens } from '../utils/authSession.js';
import { clearAuthCookies } from '../utils/cookies.js';
import { generateSecureToken, hashToken } from '../utils/tokens.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { getUserBookmarkIds } from '../utils/socialGraph.js';
const sanitizeUser = async (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  profilePicture: user.profilePicture,
  bio: user.bio,
  coverPhoto: user.coverPhoto,
  location: user.location,
  website: user.website,
  bookmarks: await getUserBookmarkIds(user._id),
  isVerified: user.isVerified,
  isEmailVerified: user.isEmailVerified,
  isOnline: user.isOnline,
  lastSeen: user.lastSeen,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const sendVerification = async (user) => {
  const rawToken = generateSecureToken();
  user.emailVerificationToken = hashToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  await sendVerificationEmail(user, rawToken);
};

export const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with that email or username' });
    }

    const user = await User.create({ username, email, password, fullName });
    await sendVerification(user);
    await issueAuthSession(res, user._id);

    res.status(201).json({ user: await sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.isOnline = true;
    await user.save();

    await issueAuthSession(res, user._id);
    res.json({ user: await sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    await rotateRefreshSession(res, refreshToken);
    res.json({ message: 'Token refreshed' });
  } catch (error) {
    clearAuthCookies(res);
    res.status(error.status || 401).json({ message: error.message || 'Invalid refresh token' });
  }
};

export const logout = async (req, res) => {
  try {
    await revokeRefreshToken(req.cookies?.refreshToken);
    await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
    clearAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(await sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully', user: await sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    await sendVerification(user);
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const rawToken = generateSecureToken();
      user.resetPasswordToken = hashToken(rawToken);
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      await sendPasswordResetEmail(user, rawToken);
    }

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await revokeAllUserTokens(user._id);
    await issueAuthSession(res, user._id);

    res.json({ message: 'Password reset successful', user: await sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await revokeAllUserTokens(user._id);
    await issueAuthSession(res, user._id);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
