import express from 'express';
import {
  getCommentsForPost,
  createComment,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  likeComment
} from '../controllers/commentController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { validate, schemas } from '../middleware/validate.js';

const router = express.Router();

router.get('/post/:postId', getCommentsForPost);
router.post('/', optionalProtect, validate(schemas.createComment), createComment);
router.post('/:id/like', protect, likeComment);

// Admin moderation routes
router.get('/', protect, checkRole('Admin', 'Super Admin'), getAllComments);
router.put('/:id/status', protect, checkRole('Admin', 'Super Admin'), updateCommentStatus);
router.delete('/:id', protect, checkRole('Admin', 'Super Admin'), deleteComment);

export default router;
