import express from 'express';
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendNewsletter
} from '../controllers/newsletterController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin-only management
router.get('/subscribers', protect, checkRole('Admin', 'Super Admin'), getSubscribers);
router.post('/send', protect, checkRole('Admin', 'Super Admin'), sendNewsletter);

export default router;
