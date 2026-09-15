const mongoose = require('mongoose');

const clauseSchema = new mongoose.Schema(
  {
    clauseId: { type: String, required: true }, // e.g. "3.2" or "clause-1"
    title: { type: String, trim: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const consultationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    titleNepali: { type: String, trim: true, default: '' },
    description: { type: String, required: true },
    fullDraftText: { type: String, default: '' },
    clauses: { type: [clauseSchema], default: [] },
    department: { type: String, required: true, trim: true },
    targetAudience: { type: String, default: 'General Public' },

    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'archived'],
      default: 'draft',
    },
    openDate: { type: Date, required: true },
    closeDate: { type: Date, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // filled in by an officer once the consultation is closed -> Transparency Layer
    governmentResponse: {
      summaryText: { type: String, default: '' },
      actionTaken: { type: String, default: '' },
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      postedAt: { type: Date },
    },
  },
  { timestamps: true }
);

consultationSchema.index({ status: 1, department: 1 });
consultationSchema.index({ title: 'text', description: 'text' });

consultationSchema.virtual('isOpenNow').get(function isOpenNow() {
  const now = new Date();
  return this.status === 'open' && this.openDate <= now && this.closeDate >= now;
});

consultationSchema.set('toJSON', { virtuals: true });
consultationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Consultation', consultationSchema);
