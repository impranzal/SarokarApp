const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      required: true,
      enum: [
        'consultation.create',
        'consultation.publish',
        'consultation.close',
        'consultation.archive',
        'consultation.update',
        'consultation.response.post',
        'feedback.review',
        'user.role.update',
      ],
    },
    targetType: { type: String, enum: ['Consultation', 'Feedback', 'User'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
