import AuditLog from '../models/AuditLog.js';

/**
 * Log an admin action to the audit trail.
 * @param {Object} req - Express request object (for user and IP)
 * @param {string} action - Action enum value (e.g. 'CREATE_POST')
 * @param {string} target - Human-readable target description
 * @param {string} targetModel - Model name (e.g. 'Post', 'User')
 * @param {string} targetId - MongoDB ObjectId of the target document
 * @param {string} details - Optional additional details
 */
export const logAction = async (req, action, target = '', targetModel = '', targetId = null, details = '') => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

    await AuditLog.create({
      user: req.user?._id || req.user?.id,
      action,
      target,
      targetModel,
      targetId,
      details,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : ''
    });
  } catch (error) {
    // Audit logging should never crash the main request
    console.error('[AuditLogger] Failed to write audit entry:', error.message);
  }
};
