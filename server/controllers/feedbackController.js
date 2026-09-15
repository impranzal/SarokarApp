const crypto = require('crypto');
const Feedback = require('../models/Feedback');
const Consultation = require('../models/Consultation');
const { analyzeFeedbackText, detectDuplicate } = require('../utils/nlp');

// POST /api/feedback  { consultationId, clauseId?, stance, manualCategory?, text, evidenceLink? }
async function submitFeedback(req, res, next) {
  try {
    const { consultationId, clauseId, stance, manualCategory, text, evidenceLink } = req.body;

    if (!consultationId || !stance || !text) {
      return res.status(400).json({ message: 'consultationId, stance and text are required.' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Feedback text must be 2000 characters or fewer.' });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found.' });

    const now = new Date();
    const isOpen = consultation.status === 'open'
      && consultation.openDate <= now
      && consultation.closeDate >= now;
    if (!isOpen) {
      return res.status(400).json({ message: 'This consultation is not currently open for feedback.' });
    }

    if (clauseId && !consultation.clauses.some((c) => c.clauseId === clauseId)) {
      return res.status(400).json({ message: 'Unknown clauseId for this consultation.' });
    }

    // Run the NLP pipeline: categorization, sentiment, keyword extraction.
    const analysis = analyzeFeedbackText(text);

    // Duplicate/spam detection against recent feedback on the same
    // consultation (student-project-scale: pull last 300 comments).
    const recent = await Feedback.find({ consultation: consultationId })
      .select('text')
      .limit(300)
      .lean();
    const { isDuplicate, bestScore } = detectDuplicate(text, recent.map((f) => f.text));

    const ipHash = crypto
      .createHash('sha256')
      .update((req.ip || '') + (process.env.JWT_SECRET || ''))
      .digest('hex');

    const feedback = await Feedback.create({
      consultation: consultationId,
      clauseId: clauseId || null,
      user: req.user._id,
      stance,
      manualCategory: manualCategory || null,
      autoCategories: analysis.autoCategories,
      text,
      evidenceLink: evidenceLink || null,
      sentiment: analysis.sentiment,
      keywords: analysis.keywords,
      isFlaggedDuplicate: isDuplicate,
      duplicateOfScore: bestScore,
      ipHash,
    });

    res.status(201).json({ feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'You have already submitted feedback for this item.',
      });
    }
    next(err);
  }
}

// GET /api/feedback?consultationId=&clauseId=&stance=&category=&flagged=
async function listFeedback(req, res, next) {
  try {
    const { consultationId, clauseId, stance, category, flagged, mine } = req.query;
    if (!consultationId) {
      return res.status(400).json({ message: 'consultationId query param is required.' });
    }

    const filter = { consultation: consultationId };
    if (clauseId) filter.clauseId = clauseId;
    if (stance) filter.stance = stance;
    if (flagged !== undefined) filter.isFlaggedDuplicate = flagged === 'true';
    if (category) {
      filter.$or = [
        { manualCategory: category },
        { 'autoCategories.category': category },
      ];
    }
    if (mine === 'true') filter.user = req.user._id;

    // Citizens only ever see their own feedback text in list view to keep
    // the raw-comment stream from being an easy scrape target; officers/
    // admins see everything for moderation and the dashboard drill-downs.
    const isStaff = ['officer', 'admin'].includes(req.user.role);
    if (!isStaff && mine !== 'true') {
      filter.user = req.user._id;
    }

    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name isVerifiedCitizen')
      .limit(500);

    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/feedback/:id/review (officer/admin) - clear or confirm a
// flagged duplicate/spam submission.
async function reviewFeedback(req, res, next) {
  try {
    const { isFlaggedDuplicate } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });

    if (isFlaggedDuplicate !== undefined) feedback.isFlaggedDuplicate = isFlaggedDuplicate;
    feedback.isReviewed = true;
    await feedback.save();

    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitFeedback, listFeedback, reviewFeedback };
