import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { validate, schemas } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, checkRole('Author', 'Admin', 'Super Admin'), validate(schemas.createCategory), createCategory);
router.put('/:id', protect, checkRole('Admin', 'Super Admin'), validate(schemas.createCategory), updateCategory);
router.delete('/:id', protect, checkRole('Admin', 'Super Admin'), deleteCategory);

export default router;
