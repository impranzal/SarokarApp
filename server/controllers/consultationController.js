const Consultation = require('../models/Consultation');
const Feedback = require('../models/Feedback');
const { logAction } = require('../utils/auditLog');

// POST /api/consultations (officer/admin)
async function createConsultation(req, res, next) {
  try {
    const {
      title, titleNepali, description, fullDraftText, clauses,
      department, targetAudience, openDate, closeDate,
    } = req.body;

    if (!title || !description || !department || !openDate || !closeDate) {
      return res.status(400).json({
        message: 'Title, description, department, openDate and closeDate are required.',
      });
    }
    if (new Date(openDate) >= new Date(closeDate)) {
      return res.status(400).json({ message: 'closeDate must be after openDate.' });
    }

    // Officers may only create consultations for their own department.
    const dept = req.user.role === 'officer' ? req.user.department : department;

    const consultation = await Consultation.create({
      title,
      titleNepali,
      description,
      fullDraftText,
      clauses,
      department: dept,
      targetAudience,
      openDate,
      closeDate,
      createdBy: req.user._id,
      status: 'draft',
    });

    await logAction({
      actor: req.user._id,
      action: 'consultation.create',
      targetType: 'Consultation',
      targetId: consultation._id,
    });

    res.status(201).json({ consultation });
  } catch (err) {
    next(err);
  }
}

// GET /api/consultations - public browse, with filters
async function listConsultations(req, res, next) {
  try {
    const { status, department, search, mine } = req.query;
    const filter = {};

    // Citizens (and anonymous visitors) only ever see open or closed items,
    // never drafts. Officers/admins can see everything, optionally scoped
    // to "mine" (their own department or their own creations).
    const isStaff = req.user && ['officer', 'admin'].includes(req.user.role);

    if (status) filter.status = status;
    else if (!isStaff) filter.status = { $in: ['open', 'closed', 'archived'] };

    if (department) filter.department = department;
    if (search && search.trim()) {
      // Use a case-insensitive partial match so users can search by a
      // fragment of a title, including titles not yet represented in a
      // MongoDB text-search token.
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      filter.$or = [
        { title: searchRegex },
        { titleNepali: searchRegex },
        { description: searchRegex },
        { department: searchRegex },
        { fullDraftText: searchRegex },
        { 'clauses.title': searchRegex },
        { 'clauses.text': searchRegex },
      ];
    }

    if (mine === 'true' && req.user) {
      if (req.user.role === 'officer') filter.department = req.user.department;
      else filter.createdBy = req.user._id;
    }

    const consultations = await Consultation.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name department');

    res.json({ consultations });
  } catch (err) {
    next(err);
  }
}

// GET /api/consultations/:id
async function getConsultation(req, res, next) {
  try {
    const consultation = await Consultation.findById(req.params.id).populate(
      'createdBy',
      'name department'
    );
    if (!consultation) return res.status(404).json({ message: 'Consultation not found.' });

    const isStaff = req.user && ['officer', 'admin'].includes(req.user.role);
    if (consultation.status === 'draft' && !isStaff) {
      return res.status(404).json({ message: 'Consultation not found.' });
    }

    res.json({ consultation });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/consultations/:id (officer who owns it / admin)
async function updateConsultation(req, res, next) {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found.' });

    assertOwnership(req, consultation);

    const editable = [
      'title', 'titleNepali', 'description', 'fullDraftText',
      'clauses', 'targetAudience', 'openDate', 'closeDate',
    ];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) consultation[field] = req.body[field];
    });

    await consultation.save();
    await logAction({
      actor: req.user._id,
      action: 'consultation.update',
      targetType: 'Consultation',
      targetId: consultation._id,
    });

    res.json({ consultation });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/consultations/:id/status  { status: 'open' | 'closed' | 'archived' }
async function changeStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['open', 'closed', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status transition requested.' });
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found.' });
    assertOwnership(req, consultation);

    consultation.status = status;
    await consultation.save();

    await logAction({
      actor: req.user._id,
      action: status === 'open' ? 'consultation.publish'
        : status === 'closed' ? 'consultation.close' : 'consultation.archive',
      targetType: 'Consultation',
      targetId: consultation._id,
    });

    res.json({ consultation });
  } catch (err) {
    next(err);
  }
}

// POST /api/consultations/:id/response - Transparency Layer: officer posts
// what the government did in light of the public feedback.
async function postGovernmentResponse(req, res, next) {
  try {
    const { summaryText, actionTaken } = req.body;
    if (!summaryText) {
      return res.status(400).json({ message: 'summaryText is required.' });
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found.' });
    assertOwnership(req, consultation);

    if (consultation.status !== 'closed' && consultation.status !== 'archived') {
      return res.status(400).json({
        message: 'A government response can only be posted once the consultation is closed.',
      });
    }

    consultation.governmentResponse = {
      summaryText,
      actionTaken: actionTaken || '',
      postedBy: req.user._id,
      postedAt: new Date(),
    };
    await consultation.save();

    await logAction({
      actor: req.user._id,
      action: 'consultation.response.post',
      targetType: 'Consultation',
      targetId: consultation._id,
    });

    res.json({ consultation });
  } catch (err) {
    next(err);
  }
}

// GET /api/consultations/:id/transparency - public summary page data.
// Aggregates are computed here rather than trusting client-supplied numbers.
async function getTransparencyView(req, res, next) {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation || !['closed', 'archived'].includes(consultation.status)) {
      return res.status(404).json({ message: 'No public summary available for this consultation.' });
    }

    const stanceBreakdown = await Feedback.aggregate([
      { $match: { consultation: consultation._id } },
      { $group: { _id: '$stance', count: { $sum: 1 } } },
    ]);

    const totalFeedback = stanceBreakdown.reduce((sum, s) => sum + s.count, 0);

    res.json({
      consultation,
      stanceBreakdown,
      totalFeedback,
      governmentResponse: consultation.governmentResponse,
    });
  } catch (err) {
    next(err);
  }
}

function assertOwnership(req, consultation) {
  if (req.user.role === 'admin') return;
  if (req.user.role === 'officer' && consultation.department === req.user.department) return;
  const err = new Error('You do not have permission to modify this consultation.');
  err.statusCode = 403;
  throw err;
}

module.exports = {
  createConsultation,
  listConsultations,
  getConsultation,
  updateConsultation,
  changeStatus,
  postGovernmentResponse,
  getTransparencyView,
};
