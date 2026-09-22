const mongoose = require('mongoose');

const CATEGORIES = ['service-quality', 'corruption', 'delay', 'mismanagement', 'technical-issue', 'other'];
const STATUSES = ['submitted', 'under-review', 'resolved', 'closed'];

const grievanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, enum: CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },

    // A grievance may optionally reference the consultation it concerns
    // (e.g. "the comment window closed early"), or stand alone as a
    // general administrative complaint.
    relatedConsultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', default: null },
    department: { type: String, default: 'General Administration' },

    status: { type: String, enum: STATUSES, default: 'submitted' },
    response: {
      text: { type: String, default: '' },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      respondedAt: { type: Date },
    },
  },
  { timestamps: true }
);

grievanceSchema.index({ user: 1, createdAt: -1 });
grievanceSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Grievance', grievanceSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
