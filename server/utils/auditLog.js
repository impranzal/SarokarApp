const AuditLog = require('../models/AuditLog');

/**
 * Fire-and-forget audit log write. Never throws into the request path -
 * a failed audit write should not break the actual operation, but we do
 * log it server-side so it's not silently lost.
 */
async function logAction({ actor, action, targetType, targetId, meta = {} }) {
  try {
    await AuditLog.create({ actor, action, targetType, targetId, meta });
  } catch (err) {
    console.error('[audit-log] failed to write entry:', err.message);
  }
}

module.exports = { logAction };
