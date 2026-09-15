const Feedback = require('../models/Feedback');
const Consultation = require('../models/Consultation');
const PDFDocument = require('pdfkit');

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

// GET /api/dashboard/:consultationId/export.csv
// Produces the "exportable summary report" for offline briefing, per the
// spec's policymaker dashboard requirement.
async function exportCsv(req, res, next) {
  try {
    const consultation = await Consultation.findById(req.params.consultationId);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found.' });

    const feedback = await Feedback.find({ consultation: consultation._id })
      .populate('user', 'name isVerifiedCitizen')
      .sort({ createdAt: 1 })
      .lean();

    const header = [
      'submittedAt', 'citizen', 'verifiedCitizen', 'clauseId', 'stance',
      'manualCategory', 'autoCategories', 'sentimentLabel', 'sentimentConfidence',
      'flaggedDuplicate', 'text',
    ];

    const rows = feedback.map((f) => [
      f.createdAt.toISOString(),
      f.user?.name || 'Unknown',
      f.user?.isVerifiedCitizen ? 'yes' : 'no',
      f.clauseId || 'overall',
      f.stance,
      f.manualCategory || '',
      (f.autoCategories || []).map((c) => c.category).join('; '),
      f.sentiment?.label || '',
      f.sentiment?.confidence ?? '',
      f.isFlaggedDuplicate ? 'yes' : 'no',
      f.text,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(csvEscape).join(','))
      .join('\n');

    const filename = `sarokar-${consultation.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-report.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { exportCsv };

// GET /api/dashboard/:consultationId/export.pdf
async function exportPdf(req, res, next) {
  try {
    const consultation = await Consultation.findById(req.params.consultationId);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found.' });
    const [feedback, stanceBreakdown] = await Promise.all([
      Feedback.find({ consultation: consultation._id }).populate('user', 'name').sort({ createdAt: 1 }).lean(),
      Feedback.aggregate([
        { $match: { consultation: consultation._id } },
        { $group: { _id: '$stance', count: { $sum: 1 } } },
      ]),
    ]);

    const filename = `sarokar-${consultation.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-report.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const doc = new PDFDocument({ margin: 48 });
    doc.pipe(res);
    doc.fontSize(20).fillColor('#1E4258').text('Sarokar — Consultation Summary');
    doc.moveDown(0.5).fontSize(14).fillColor('#222').text(consultation.title);
    doc.fontSize(10).fillColor('#666').text(`${consultation.department} · ${consultation.status} · ${feedback.length} submissions`);
    doc.moveDown().fontSize(12).fillColor('#222').text('Stance breakdown');
    stanceBreakdown.forEach((item) => doc.text(`${item._id}: ${item.count}`));
    doc.moveDown().text('Feedback submissions');
    feedback.forEach((item, index) => {
      if (doc.y > 700) doc.addPage();
      doc.moveDown(0.4).fontSize(10).fillColor('#1E4258').text(`${index + 1}. ${item.stance} · ${item.user?.name || 'Unknown'}`);
      doc.fontSize(9).fillColor('#333').text(item.text, { width: 500 });
    });
    doc.end();
  } catch (err) {
    next(err);
  }
}

module.exports.exportPdf = exportPdf;
