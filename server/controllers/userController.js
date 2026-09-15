const User = require('../models/User');
const { logAction } = require('../utils/auditLog');

// GET /api/users (admin)
async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users: users.map((u) => u.toSafeObject()) });
  } catch (err) {
    next(err);
  }
}

// POST /api/users (admin) - provision an officer/admin account
async function createUser(req, res, next) {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required.' });
    }
    if (!['citizen', 'officer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    if (role === 'officer' && !department) {
      return res.status(400).json({ message: 'Department is required for officer accounts.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, role, department: department || null });

    await logAction({
      actor: req.user._id,
      action: 'user.role.update',
      targetType: 'User',
      targetId: user._id,
      meta: { createdRole: role },
    });

    res.status(201).json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id/role (admin)
async function updateUserRole(req, res, next) {
  try {
    const { role, department, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    await logAction({
      actor: req.user._id,
      action: 'user.role.update',
      targetType: 'User',
      targetId: user._id,
      meta: { role, department, isActive },
    });

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, createUser, updateUserRole };
