import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  getMe,
  refresh,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  registerRules,
  loginRules,
  verifyEmailRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
} from '../middleware/validators.js';

const router = express.Router();

const authAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

router.post('/register', authAttemptLimiter, registerRules, validate, register);
router.post('/login', authAttemptLimiter, loginRules, validate, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/verify-email', authAttemptLimiter, verifyEmailRules, validate, verifyEmail);
router.post('/resend-verification', authAttemptLimiter, protect, resendVerification);
router.post('/forgot-password', authAttemptLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', authAttemptLimiter, resetPasswordRules, validate, resetPassword);
router.patch('/password', authAttemptLimiter, protect, changePasswordRules, validate, changePassword);

export default router;
