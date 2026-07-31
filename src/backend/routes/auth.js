import express from 'express';
import {
  register,
  login,
  getMe,
  updateMe,
  getBookmarks,
  getReadingHistory,
  getUsers,
  updateUserRole,
  deleteUser,
  getUserProfile,
  toggleFollow,
  getFollowerFeed,
  getNotifications,
  markNotificationsRead,
  searchUsers
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate, schemas } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', authLimiter, validate(schemas.registerUser), register);
router.post('/login', authLimiter, validate(schemas.loginUser), login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/bookmarks', protect, getBookmarks);
router.get('/reading-history', protect, getReadingHistory);

// Social endpoints
router.get('/feed', protect, getFollowerFeed);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.get('/search-users', searchUsers);
router.get('/users/:id/profile', getUserProfile);
router.post('/users/:id/follow', protect, toggleFollow);

// Admin-only user management
router.get('/users', protect, checkRole('Admin', 'Super Admin'), getUsers);
router.put('/users/:id/role', protect, checkRole('Super Admin'), updateUserRole);
router.delete('/users/:id', protect, checkRole('Admin', 'Super Admin'), deleteUser);

export default router;
