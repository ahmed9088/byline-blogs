import User from '../models/User.js';
import Post from '../models/Post.js';
import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import { logAction } from '../utils/auditLogger.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper to safely extract an ID from a potentially populated field or plain ID
const extractId = (field) => {
  if (!field) return null;
  if (typeof field === 'string') return field;
  return field._id || field.id || field;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const userExists = await User.findOne({ email: cleanEmail }).catch(() => null);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const isFirstUser = (await User.countDocuments({}).catch(() => 1)) === 0;
    const role = isFirstUser || cleanEmail.includes('admin') ? 'Super Admin' : 'Registered User';
    const user = await User.create({ name, email: cleanEmail, password, role });

    if (user && (user._id || user.id)) {
      const userId = user._id || user.id;
      return res.status(201).json({
        success: true,
        token: generateToken(userId),
        user: {
          _id: userId,
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: user.isPremium || false,
          bio: user.bio || '',
          profileImage: user.profileImage || '',
          socialLinks: user.socialLinks || {},
          followers: user.followers || [],
          following: user.following || []
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Failed to create user account' });
    }
  } catch (error) {
    console.error('[Register Error]:', error?.message || error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Use select('+password') to include the password field (normally excluded)
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, isPremium: user.isPremium,
        bio: user.bio, profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        followers: user.followers || [], following: user.following || []
      }
    });
  } catch (error) { next(error); }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Supabase stores bookmarks, followers, following as JSONB arrays of IDs
    // We don't deep-populate them here — the frontend can fetch details separately
    res.json({
      success: true,
      user: {
        ...user,
        bookmarks: user.bookmarks || [],
        followers: user.followers || [],
        following: user.following || []
      }
    });
  } catch (error) { next(error); }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.bio !== undefined) updateData.bio = req.body.bio;
    if (req.body.profileImage !== undefined) updateData.profileImage = req.body.profileImage;
    if (req.body.isPremium !== undefined) updateData.isPremium = req.body.isPremium;
    if (req.body.socialLinks) {
      updateData.socialLinks = { ...(user.socialLinks || {}), ...req.body.socialLinks };
    }
    if (req.body.password) updateData.password = req.body.password;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData);
    res.json({
      success: true,
      user: {
        _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
        role: updatedUser.role, isPremium: updatedUser.isPremium,
        bio: updatedUser.bio, profileImage: updatedUser.profileImage,
        socialLinks: updatedUser.socialLinks,
        followers: updatedUser.followers || [], following: updatedUser.following || []
      }
    });
  } catch (error) { next(error); }
};

// @desc    Get user's bookmarked posts
// @route   GET /api/auth/bookmarks
// @access  Private
export const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const bookmarkIds = user.bookmarks || [];
    if (bookmarkIds.length === 0) {
      return res.json({ success: true, bookmarks: [] });
    }

    // Fetch bookmarked posts directly by IDs
    const posts = await Post.find({ _id: { $in: bookmarkIds } })
      .populate('author', 'name profileImage')
      .populate('category', 'name slug')
      .select('title slug summary featuredImage category author readingTime publishedAt viewsCount');

    res.json({ success: true, bookmarks: posts || [] });
  } catch (error) { next(error); }
};

// @desc    Get user's reading history
// @route   GET /api/auth/reading-history
// @access  Private
export const getReadingHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const history = user.readingHistory || [];
    if (history.length === 0) {
      return res.json({ success: true, history: [] });
    }

    // Extract post IDs and fetch them
    const postIds = history.map(entry => entry.post || entry.postId).filter(Boolean);
    if (postIds.length === 0) {
      return res.json({ success: true, history: [] });
    }

    const posts = await Post.find({ _id: { $in: postIds } })
      .populate('author', 'name profileImage')
      .populate('category', 'name slug')
      .select('title slug summary featuredImage category author readingTime publishedAt');

    // Rebuild history with post data
    const postsMap = {};
    (posts || []).forEach(p => { postsMap[p._id] = p; });

    const enrichedHistory = history
      .map(entry => ({
        post: postsMap[entry.post || entry.postId] || null,
        readAt: entry.readAt
      }))
      .filter(entry => entry.post)
      .sort((a, b) => new Date(b.readAt) - new Date(a.readAt))
      .slice(0, 50);

    res.json({ success: true, history: enrichedHistory });
  } catch (error) { next(error); }
};

// @desc    Get all users (Admin/Super Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) { next(error); }
};

// @desc    Update user role (Super Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/SuperAdmin
export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'Super Admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify a Super Admin user' });
    }
    const oldRole = user.role;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
    await logAction(req, 'UPDATE_USER_ROLE', user.name, 'User', user._id, `Role changed from "${oldRole}" to "${req.body.role}"`);
    res.json({ success: true, message: 'User role updated successfully', user: updatedUser });
  } catch (error) { next(error); }
};

// @desc    Delete user (Admin/Super Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'Super Admin') return res.status(403).json({ success: false, message: 'Super Admin users cannot be deleted' });
    await logAction(req, 'DELETE_USER', user.name, 'User', user._id, `Deleted user ${user.email}`);
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) { next(error); }
};

// ─── SOCIAL FEATURES ─────────────────────────────────────────────────────────

// @desc    Get public user profile by ID
// @route   GET /api/auth/users/:id/profile
// @access  Public
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Fetch their recent published posts
    const posts = await Post.find({ author: req.params.id, status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(6)
      .populate('category', 'name slug')
      .select('title slug summary featuredImage readingTime publishedAt viewsCount');

    const followers = user.followers || [];
    const following = user.following || [];

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        bio: user.bio,
        profileImage: user.profileImage,
        role: user.role,
        socialLinks: user.socialLinks,
        followers,
        following,
        createdAt: user.createdAt
      },
      posts,
      followerCount: followers.length,
      followingCount: following.length
    });
  } catch (error) { next(error); }
};

// @desc    Follow or unfollow a user (toggle)
// @route   POST /api/auth/users/:id/follow
// @access  Private
export const toggleFollow = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user.id;

    if (targetId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const [target, currentUser] = await Promise.all([
      User.findById(targetId),
      User.findById(currentUserId)
    ]);

    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Use plain array operations instead of Mongoose .pull() / .addToSet()
    const targetFollowers = target.followers || [];
    const currentFollowing = currentUser.following || [];
    const isFollowing = targetFollowers.includes(currentUserId);

    let newTargetFollowers;
    let newCurrentFollowing;
    let newNotifications = target.notifications || [];

    if (isFollowing) {
      // Unfollow
      newTargetFollowers = targetFollowers.filter(id => id !== currentUserId);
      newCurrentFollowing = currentFollowing.filter(id => id !== targetId);
    } else {
      // Follow
      newTargetFollowers = [...targetFollowers, currentUserId];
      newCurrentFollowing = [...currentFollowing, targetId];

      // Add notification
      newNotifications = [...newNotifications, {
        type: 'follow',
        from: currentUserId,
        message: `${currentUser.name} started following you.`,
        link: `/author/${currentUserId}`,
        read: false,
        createdAt: new Date().toISOString()
      }];
    }

    await Promise.all([
      User.findByIdAndUpdate(targetId, { followers: newTargetFollowers, notifications: newNotifications }),
      User.findByIdAndUpdate(currentUserId, { following: newCurrentFollowing })
    ]);

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followerCount: newTargetFollowers.length
    });
  } catch (error) { next(error); }
};

// @desc    Get personalized feed — posts from followed authors
// @route   GET /api/auth/feed
// @access  Private
export const getFollowerFeed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const followingIds = user.following || [];

    if (followingIds.length === 0) {
      return res.json({ success: true, posts: [], message: 'Follow some authors to see your feed.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ author: { $in: followingIds }, status: 'published' })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name profileImage role')
        .populate('category', 'name slug')
        .select('title slug summary featuredImage readingTime publishedAt viewsCount likesCount author category'),
      Post.countDocuments({ author: { $in: followingIds }, status: 'published' })
    ]);

    res.json({
      success: true,
      posts,
      total,
      pages: Math.ceil(total / limit),
      page
    });
  } catch (error) { next(error); }
};

// @desc    Get notifications for current user
// @route   GET /api/auth/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Notifications are stored as a JSONB array on the user object
    const notifications = (user.notifications || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({ success: true, notifications, unreadCount });
  } catch (error) { next(error); }
};

// @desc    Mark all notifications as read
// @route   PUT /api/auth/notifications/read
// @access  Private
export const markNotificationsRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Mark all notifications as read by updating the JSONB array
    const notifications = (user.notifications || []).map(n => ({ ...n, read: true }));
    await User.findByIdAndUpdate(req.user.id, { notifications });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};

// @desc    Search users by name (for @mention autocomplete)
// @route   GET /api/auth/search?q=name
// @access  Public
export const searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (q.length < 2) return res.json({ success: true, users: [] });

    const users = await User.find({
      name: { $regex: q, $options: 'i' }
    })
      .select('name profileImage role')
      .limit(8);

    res.json({ success: true, users });
  } catch (error) { next(error); }
};
