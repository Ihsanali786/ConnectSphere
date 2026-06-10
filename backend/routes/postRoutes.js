import express from 'express';
import {
  createPost, getFeed, likePost, deletePost, editPost,
  savePost, getExplorePosts, getTrendingHashtags,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { postContentRules, mongoIdParam, paginationRules } from '../middleware/validators.js';

const router = express.Router();

router.get('/feed', protect, paginationRules, validate, getFeed);
router.get('/explore', protect, paginationRules, validate, getExplorePosts);
router.get('/trending', protect, getTrendingHashtags);
router.post('/create', protect, uploadSingle, postContentRules, validate, createPost);
router.put('/:id/like', protect, mongoIdParam('id'), validate, likePost);
router.put('/:id/save', protect, mongoIdParam('id'), validate, savePost);
router.put('/:id/edit', protect, mongoIdParam('id'), postContentRules, validate, editPost);
router.delete('/:id', protect, mongoIdParam('id'), validate, deletePost);

export default router;
