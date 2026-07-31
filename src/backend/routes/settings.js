import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, checkRole('Admin', 'Super Admin'), updateSettings);

export default router;
