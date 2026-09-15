const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Verifies the JWT on the Authorization header and attaches req.user.
 */
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Account not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}

/**
 * Restricts a route to specific roles, e.g. authorize('admin', 'officer').
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

/**
 * Attaches req.user if a valid token is present, but never blocks the
 * request if it's missing/invalid. Used on public routes (e.g. browsing
 * consultations) whose response shape varies by role.
 */
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
    next();
  } catch (err) {
    next();
  }
}

module.exports = { protect, authorize, optionalAuth };
