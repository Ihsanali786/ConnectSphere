import express from 'express';
import {
  getNotifications,
  markAllRead,
  getUnreadCount,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

import { validate } from '../middleware/validateMiddleware.js';
import { paginationRules } from '../middleware/validators.js';

const router = express.Router();

router.get('/', protect, paginationRules, validate, getNotifications);
router.put('/mark-read', protect, markAllRead);
router.get('/unread-count', protect, getUnreadCount);

export default router;
