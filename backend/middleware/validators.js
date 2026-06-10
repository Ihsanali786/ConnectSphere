import { body, param, query } from 'express-validator';

export const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username may only contain letters, numbers, and underscores'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('fullName').optional().trim().isLength({ max: 100 }).withMessage('Full name too long'),
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const searchRules = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search query must be 2–50 characters'),
];

export const postContentRules = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Post content cannot exceed 2000 characters'),
];

export const commentRules = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

export const mongoIdParam = (name) =>
  param(name).isMongoId().withMessage(`Invalid ${name}`);

export const profileUpdateRules = [
  body('fullName').optional().trim().isLength({ max: 100 }),
  body('bio').optional().trim().isLength({ max: 200 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('website').optional().trim().isLength({ max: 200 }),
];

export const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1–50'),
];

export const verifyEmailRules = [
  body('token').trim().notEmpty().withMessage('Verification token is required'),
];

export const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordRules = [
  body('token').trim().notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];
