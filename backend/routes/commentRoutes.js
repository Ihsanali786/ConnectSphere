import express from 'express';
import { addComment, deleteComment, likeComment, addReply } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { commentRules, mongoIdParam } from '../middleware/validators.js';

const router = express.Router();

router.post('/:postId', protect, mongoIdParam('postId'), commentRules, validate, addComment);
router.delete('/:id', protect, mongoIdParam('id'), validate, deleteComment);
router.put('/:id/like', protect, mongoIdParam('id'), validate, likeComment);
router.post('/:id/reply', protect, mongoIdParam('id'), commentRules, validate, addReply);

export default router;
