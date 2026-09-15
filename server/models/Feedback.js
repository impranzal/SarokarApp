const mongoose = require('mongoose');

const CATEGORIES = [
  'economic-impact',
  'implementation-feasibility',
  'rights-concern',
  'drafting-clarity',
  'environmental-impact',
  'administrative-burden',
  'other',
];

const feedbackSchema = new mongoose.Schema(
  {
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: true,
    },
    clauseId: { type: String, default: null }, // null = feedback on policy as a whole
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    stance: {
      type: String,
      enum: ['support', 'oppose', 'neutral'],
      required: true,
    },

    // citizen's manual tag (fallback/correction for the auto-categorizer)
    manualCategory: {
      type: String,
      enum: CATEGORIES,
      default: null,
    },
    // auto-assigned categories, ranked, from the keyword/theme extractor
    autoCategories: [
      {
        category: { type: String, enum: CATEGORIES },
        score: Number,
      },
    ],

    text: { type: String, required: true, maxlength: 2000, trim: true },
    evidenceLink: { type: String, default: null },

    sentiment: {
      label: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
      score: { type: Number, default: 0 }, // raw lexicon score
      confidence: { type: Number, default: 0 }, // 0-1 normalized
    },

    keywords: [{ type: String }],

    isFlaggedDuplicate: { type: Boolean, default: false },
    duplicateOfScore: { type: Number, default: 0 }, // similarity score vs closest match
    isReviewed: { type: Boolean, default: false },

    ipHash: { type: String, default: null }, // for lightweight abuse detection, never store raw IP
  },
  { timestamps: true }
);

// One submission per citizen per consultation+clause combination
feedbackSchema.index({ consultation: 1, clauseId: 1, user: 1 }, { unique: true });
feedbackSchema.index({ consultation: 1, createdAt: 1 });
feedbackSchema.index({ consultation: 1, isFlaggedDuplicate: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
module.exports.CATEGORIES = CATEGORIES;
