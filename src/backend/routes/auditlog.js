import express from 'express';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { getAuditLog } from '../controllers/auditController.js';

const router = express.Router();

router.get('/', protect, checkRole('Super Admin'), getAuditLog);

export default router;
