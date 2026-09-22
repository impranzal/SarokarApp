const Grievance = require('../models/Grievance');
const Consultation = require('../models/Consultation');
const { logAction } = require('../utils/auditLog');

// POST /api/grievances (any authenticated user, typically a citizen)
async function submitGrievance(req, res, next) {
  try {
    const { subject, category, description, relatedConsultation } = req.body;

    let department = 'General Administration';
    if (relatedConsultation) {
      const consultation = await Consultation.findById(relatedConsultation);
      if (!consultation) return res.status(404).json({ message: 'Related consultation not found.' });
      department = consultation.department;
    }

    const grievance = await Grievance.create({
      user: req.user._id,
      subject,
      category,
      description,
      relatedConsultation: relatedConsultation || null,
      department,
    });

    res.status(201).json({ grievance });
  } catch (err) {
    next(err);
  }
}

// GET /api/grievances - citizens see their own; officers see their
// department's (plus general/unassigned); admins see everything.
async function listGrievances(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (req.user.role === 'citizen') {
      filter.user = req.user._id;
    } else if (req.user.role === 'officer') {
      filter.$or = [{ department: req.user.department }, { department: 'General Administration' }];
    }
    // admin: no additional filter, sees everything

    const grievances = await Grievance.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('relatedConsultation', 'title')
      .limit(300);

    res.json({ grievances });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/grievances/:id/respond (officer/admin)
async function respondToGrievance(req, res, next) {
  try {
    const { status, responseText } = req.body;
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ message: 'Grievance not found.' });

    if (
      req.user.role === 'officer' &&
      grievance.department !== req.user.department &&
      grievance.department !== 'General Administration'
    ) {
      return res.status(403).json({ message: 'This grievance belongs to a different department.' });
    }

    if (status) grievance.status = status;
    if (responseText !== undefined) {
      grievance.response = { text: responseText, respondedBy: req.user._id, respondedAt: new Date() };
    }
    await grievance.save();

    await logAction({
      actor: req.user._id,
      action: 'grievance.respond',
      targetType: 'Grievance',
      targetId: grievance._id,
      meta: { status },
    });

    res.json({ grievance });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitGrievance, listGrievances, respondToGrievance };
