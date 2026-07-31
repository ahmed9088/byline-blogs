import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

// Helper to safely get a plain object from a result
const toPlainObject = (item) => {
  if (!item) return item;
  if (typeof item.toObject === 'function') return item.toObject();
  return { ...item };
};

// Helper to structure flat comment array into recursive/nested reply tree
const nestComments = (commentList) => {
  const commentMap = {};
  commentList.forEach((comment) => {
    commentMap[comment._id] = { ...toPlainObject(comment), replies: [] };
  });

  const nested = [];
  commentList.forEach((comment) => {
    const mapped = commentMap[comment._id];
    if (mapped.parentId) {
      const parent = commentMap[mapped.parentId];
      if (parent) {
        parent.replies.push(mapped);
      } else {
        // Parent comment might have been deleted/filtered out
        nested.push(mapped);
      }
    } else {
      nested.push(mapped);
    }
  });

  return nested;
};

// @desc    Get comments for a post (nested tree format)
// @route   GET /api/comments/post/:postId
// @access  Public
export const getCommentsForPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      status: 'approved'
    })
      .populate('user', 'name profileImage role')
      .sort({ createdAt: 1 });

    const nested = nestComments(comments || []);

    res.json({ success: true, comments: nested });
  } catch (error) {
    next(error);
  }
};

// @desc    Create comment on a post
// @route   POST /api/comments
// @access  Public (Guest or Registered)
export const createComment = async (req, res, next) => {
  try {
    const { postId, content, guestName, guestEmail, parentId, post, mentions } = req.body;

    const targetPostId = postId || post;
    const commentData = {
      post: targetPostId,
      content,
      parentId: parentId || null,
      mentions: mentions || []
    };

    // If logged in
    if (req.user) {
      commentData.user = req.user.id;
      // Auto-approve comments by admins/authors
      if (['Super Admin', 'Admin', 'Author'].includes(req.user.role)) {
        commentData.status = 'approved';
      }
    } else {
      // Guest comment checks
      if (!guestName || !guestEmail) {
        return res.status(400).json({
          success: false,
          message: 'Guest name and email are required for anonymous comments.'
        });
      }
      commentData.guestName = guestName;
      commentData.guestEmail = guestEmail;
    }

    const comment = await Comment.create(commentData);
    
    // Populate user if present
    const populated = await Comment.findById(comment._id)
      .populate('user', 'name profileImage role');

    // Handle notifications (only if comment is approved immediately)
    if (comment.status === 'approved' && req.user) {
      const postObj = await Post.findById(targetPostId);
      const postSlug = postObj ? postObj.slug : '';
      const link = `/post/${postSlug}#comment-${comment._id}`;

      // 1. Reply Notification
      if (parentId) {
        try {
          const parentComment = await Comment.findById(parentId);
          if (parentComment && parentComment.user && parentComment.user.toString() !== req.user.id) {
            const parentUserId = typeof parentComment.user === 'object' ? (parentComment.user._id || parentComment.user.id) : parentComment.user;
            const parentUser = await User.findById(parentUserId);
            if (parentUser) {
              const notifications = parentUser.notifications || [];
              notifications.push({
                type: 'comment_reply',
                from: req.user.id,
                message: `${req.user.name} replied to your comment.`,
                link,
                read: false,
                createdAt: new Date().toISOString()
              });
              await User.findByIdAndUpdate(parentUserId, { notifications });
            }
          }
        } catch (notifErr) {
          console.warn('[Comment] Reply notification failed:', notifErr.message);
        }
      }

      // 2. Mention Notifications
      if (mentions && mentions.length > 0) {
        const uniqueMentions = [...new Set(mentions)];
        for (const mentionId of uniqueMentions) {
          if (mentionId !== req.user.id) {
            try {
              const mentionedUser = await User.findById(mentionId);
              if (mentionedUser) {
                const notifications = mentionedUser.notifications || [];
                notifications.push({
                  type: 'mention',
                  from: req.user.id,
                  message: `${req.user.name} mentioned you in a comment.`,
                  link,
                  read: false,
                  createdAt: new Date().toISOString()
                });
                await User.findByIdAndUpdate(mentionId, { notifications });
              }
            } catch (notifErr) {
              console.warn('[Comment] Mention notification failed:', notifErr.message);
            }
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      comment: populated,
      message: comment.status === 'approved' 
        ? 'Comment posted.' 
        : 'Comment submitted. It will appear after approval.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like or unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const userId = req.user.id;
    const likes = comment.likes || [];
    const isLiked = likes.includes(userId);

    let newLikes;
    if (isLiked) {
      // Unlike: remove userId from likes array
      newLikes = likes.filter(id => id !== userId);
    } else {
      // Like: add userId to likes array
      newLikes = [...likes, userId];

      // Notify comment author if it's someone else and they are a registered user
      const commentUserId = typeof comment.user === 'object' ? (comment.user._id || comment.user.id) : comment.user;
      if (commentUserId && commentUserId.toString() !== userId) {
        try {
          const postObj = await Post.findById(typeof comment.post === 'object' ? (comment.post._id || comment.post.id) : comment.post);
          const postSlug = postObj ? postObj.slug : '';
          const link = `/post/${postSlug}#comment-${comment._id}`;

          const commentAuthor = await User.findById(commentUserId);
          if (commentAuthor) {
            const notifications = commentAuthor.notifications || [];
            notifications.push({
              type: 'comment_like',
              from: userId,
              message: `${req.user.name} liked your comment.`,
              link,
              read: false,
              createdAt: new Date().toISOString()
            });
            await User.findByIdAndUpdate(commentUserId, { notifications });
          }
        } catch (notifErr) {
          console.warn('[Comment] Like notification failed:', notifErr.message);
        }
      }
    }

    await Comment.findByIdAndUpdate(req.params.id, { likes: newLikes });

    res.json({ success: true, likesCount: newLikes.length, isLiked: !isLiked });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments (Admin/Moderator view)
// @route   GET /api/comments
// @access  Private/Admin
export const getAllComments = async (req, res, next) => {
  try {
    const statusFilter = req.query.status;
    const query = statusFilter ? { status: statusFilter } : {};

    const comments = await Comment.find(query)
      .populate('user', 'name email profileImage')
      .populate('post', 'title slug')
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment moderation status (approve/spam)
// @route   PUT /api/comments/:id/status
// @access  Private/Admin
export const updateCommentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'spam', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid comment status' });
    }

    const comment = await Comment.findByIdAndUpdate(req.params.id, { status });
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    res.json({ success: true, message: `Comment status updated to ${status}`, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Delete child replies first, then the comment itself
    await Comment.deleteMany({ parentId: req.params.id });
    await Comment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Comment and nested replies removed.' });
  } catch (error) {
    next(error);
  }
};
