const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Consultation = require('../models/Consultation');

// GET /api/dashboard/:consultationId  (officer/admin)
async function getDashboard(req, res, next) {
  try {
    const consultationId = new mongoose.Types.ObjectId(req.params.consultationId);

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found.' });

    const [stanceBreakdown, volumeOverTime, topCategories, flaggedQueue, sentimentSpread] =
      await Promise.all([
        Feedback.aggregate([
          { $match: { consultation: consultationId } },
          { $group: { _id: '$stance', count: { $sum: 1 } } },
        ]),

        Feedback.aggregate([
          { $match: { consultation: consultationId } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        Feedback.aggregate([
          { $match: { consultation: consultationId } },
          { $unwind: '$autoCategories' },
          {
            $group: {
              _id: '$autoCategories.category',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),

        Feedback.find({ consultation: consultationId, isFlaggedDuplicate: true, isReviewed: false })
          .populate('user', 'name')
          .sort({ createdAt: -1 })
          .limit(50),

        Feedback.aggregate([
          { $match: { consultation: consultationId } },
          { $group: { _id: '$sentiment.label', count: { $sum: 1 } } },
        ]),
      ]);

    // Top keywords across all feedback, for the word-cloud/keyword panel.
    const keywordAgg = await Feedback.aggregate([
      { $match: { consultation: consultationId } },
      { $unwind: '$keywords' },
      { $group: { _id: '$keywords', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 25 },
    ]);

    // For each top category, pull a couple of representative comments so
    // the dashboard can expand "why" behind the numbers.
    const representativeByCategory = {};
    for (const cat of topCategories) {
      // eslint-disable-next-line no-await-in-loop
      const samples = await Feedback.find({
        consultation: consultationId,
        'autoCategories.category': cat._id,
      })
        .sort({ 'sentiment.confidence': -1 })
        .limit(3)
        .select('text stance sentiment')
        .lean();
      representativeByCategory[cat._id] = samples;
    }

    const totalFeedback = stanceBreakdown.reduce((sum, s) => sum + s.count, 0);

    res.json({
      consultation: {
        id: consultation._id,
        title: consultation.title,
        status: consultation.status,
        department: consultation.department,
        openDate: consultation.openDate,
        closeDate: consultation.closeDate,
      },
      totalFeedback,
      stanceBreakdown,
      volumeOverTime,
      topCategories,
      representativeByCategory,
      sentimentSpread,
      keywordCloud: keywordAgg,
      flaggedQueue,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
