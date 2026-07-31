import AuditLog from '../models/AuditLog.js';

// @desc    Get audit log entries
// @route   GET /api/audit-log
// @access  Private/SuperAdmin
export const getAuditLog = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.action) {
      query.action = req.query.action;
    }

    if (req.query.user) {
      query.user = req.query.user;
    }

    // Date range filter
    if (req.query.from || req.query.to) {
      query.createdAt = {};
      if (req.query.from) query.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) query.createdAt.$lte = new Date(req.query.to);
    }

    const total = await AuditLog.countDocuments(query);
    const entries = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
