import express from 'express';
import {
  getPosts,
  getPostBySlug,
  checkSlug,
  createPost,
  updatePost,
  deletePost,
  likePost,
  bookmarkPost
} from '../controllers/postController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { validate, schemas } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/slug/:slug', optionalProtect, getPostBySlug);
router.get('/:slug', optionalProtect, getPostBySlug);
router.get('/check-slug', protect, checkRole('Author', 'Admin', 'Super Admin'), checkSlug);

router.post('/', protect, checkRole('Author', 'Admin', 'Super Admin', 'Registered User'), validate(schemas.createPost), createPost);
router.put('/:id', protect, checkRole('Author', 'Admin', 'Super Admin', 'Registered User'), validate(schemas.createPost), updatePost);
router.delete('/:id', protect, checkRole('Author', 'Admin', 'Super Admin', 'Registered User'), deletePost);

router.post('/:id/like', likePost);
router.post('/:id/bookmark', protect, bookmarkPost);

export default router;
