import express from 'express';
import {
  getTags,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/tagController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { validate, schemas } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getTags);
router.post('/', protect, checkRole('Author', 'Admin', 'Super Admin', 'Registered User'), validate(schemas.createTag), createTag);
router.put('/:id', protect, checkRole('Admin', 'Super Admin'), validate(schemas.createTag), updateTag);
router.delete('/:id', protect, checkRole('Admin', 'Super Admin'), deleteTag);

export default router;
