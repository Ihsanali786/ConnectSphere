import express from 'express';
import {
  getUserProfile,
  updateProfile,
  followUser,
  searchUsers,
  getSuggestedUsers,
  getBookmarks,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfileMedia } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  searchRules,
  profileUpdateRules,
  mongoIdParam,
  paginationRules,
} from '../middleware/validators.js';

const router = express.Router();

router.get('/search', protect, searchRules, validate, searchUsers);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/me/bookmarks', protect, paginationRules, validate, getBookmarks);
router.get('/:username', protect, paginationRules, validate, getUserProfile);
router.put('/profile/update', protect, uploadProfileMedia, profileUpdateRules, validate, updateProfile);
router.put('/follow/:id', protect, mongoIdParam('id'), validate, followUser);

export default router;
