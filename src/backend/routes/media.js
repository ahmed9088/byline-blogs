import express from 'express';
import { upload, uploadImage, getMediaAssets, deleteMediaAsset } from '../controllers/mediaController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';

const router = express.Router();

router.post('/upload', protect, checkRole('Author', 'Admin', 'Super Admin', 'Registered User'), upload.single('image'), uploadImage);
router.get('/', protect, checkRole('Author', 'Admin', 'Super Admin', 'Registered User'), getMediaAssets);
router.delete('/:filename', protect, checkRole('Author', 'Admin', 'Super Admin', 'Registered User'), deleteMediaAsset);

export default router;
