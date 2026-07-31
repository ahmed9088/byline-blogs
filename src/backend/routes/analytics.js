import express from 'express';
import { logVisit, getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';

const router = express.Router();

router.post('/visit', logVisit);
router.get('/dashboard', protect, checkRole('Admin', 'Super Admin'), getDashboardAnalytics);

export default router;
