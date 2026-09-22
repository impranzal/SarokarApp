const ContactMessage = require('../models/ContactMessage');

// POST /api/contact (public, no auth required)
async function submitContactMessage(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    const contactMessage = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ message: 'Your message has been received. We will get back to you soon.', id: contactMessage._id });
  } catch (err) {
    next(err);
  }
}

// GET /api/contact (admin only)
async function listContactMessages(req, res, next) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitContactMessage, listContactMessages };
