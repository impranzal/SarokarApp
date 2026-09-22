/**
 * Seeds the database with demo accounts, 2-3 sample policies, and 50+
 * varied feedback entries so the dashboard looks meaningful on first run.
 *
 * Usage: npm run seed   (from server/, with .env configured)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Consultation = require('../models/Consultation');
const Feedback = require('../models/Feedback');
const Grievance = require('../models/Grievance');
const { analyzeFeedbackText, detectDuplicate } = require('../utils/nlp');

const SAMPLE_COMMENTS = [
  { stance: 'support', text: 'This policy will genuinely help small businesses reduce their tax burden and grow. The implementation timeline seems realistic given current infrastructure.' },
  { stance: 'oppose', text: 'The cost of compliance is far too high for small traders. This will hurt the local economy and push prices up for ordinary citizens.' },
  { stance: 'neutral', text: 'I am not sure this policy changes much in practice. The wording in clause 3 is quite ambiguous and needs clarification before I can support it.' },
  { stance: 'support', text: 'Finally a step toward transparency. Citizen participation like this consultation itself is a good sign of data-driven governance.' },
  { stance: 'oppose', text: 'There are serious rights concerns here. The draft does not protect privacy adequately and could lead to discrimination in enforcement.' },
  { stance: 'oppose', text: 'The bureaucratic paperwork required will create massive administrative burden for local offices that are already understaffed.' },
  { stance: 'support', text: 'The environmental impact assessment is thorough and I appreciate the focus on reducing pollution and protecting forest areas.' },
  { stance: 'neutral', text: 'Feasibility is questionable given the current budget. Without more resources this will be very hard to implement on schedule.' },
  { stance: 'support', text: 'This is a well drafted clause that clearly defines responsibilities. The language is clear and leaves little room for confusion.' },
  { stance: 'oppose', text: 'Expensive, unclear, and rushed. The government should delay this and consult more with affected businesses before enforcing it.' },
  { stance: 'support', text: 'Great initiative for e-governance. This kind of structured feedback process builds public trust in policymaking.' },
  { stance: 'neutral', text: 'Mixed feelings. Some clauses are excellent for economic growth, others feel vague and need better drafting.' },
  { stance: 'oppose', text: 'This risks discrimination against minority communities and does not adequately protect fundamental rights.' },
  { stance: 'support', text: 'The subsidy structure proposed here is fair and will genuinely reduce cost for low income households.' },
  { stance: 'neutral', text: 'The timeline for rollout is unclear. Please clarify the implementation schedule and training plan for staff.' },
];

const DEPARTMENTS = ['Ministry of Finance', 'Ministry of Environment', 'Ministry of Home Affairs'];

async function run() {
  await connectDB();
  console.log('[seed] Connected. Clearing existing demo data...');

  await Promise.all([User.deleteMany({}), Consultation.deleteMany({}), Feedback.deleteMany({}), Grievance.deleteMany({})]);

  const admin = await User.create({
    name: 'Sarokar Admin', email: 'admin@sarokar.gov.np', password: 'Password123!', role: 'admin',
  });
  const officerFinance = await User.create({
    name: 'Rita Sharma', email: 'officer.finance@sarokar.gov.np', password: 'Password123!',
    role: 'officer', department: DEPARTMENTS[0],
  });
  const officerEnv = await User.create({
    name: 'Bikash Thapa', email: 'officer.environment@sarokar.gov.np', password: 'Password123!',
    role: 'officer', department: DEPARTMENTS[1],
  });

  const citizens = [];
  for (let i = 1; i <= 20; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const citizen = await User.create({
      name: `Citizen ${i}`,
      email: `citizen${i}@example.com`,
      password: 'Password123!',
      role: 'citizen',
      isVerifiedCitizen: i % 3 !== 0,
    });
    citizens.push(citizen);
  }

  console.log('[seed] Created users. Creating consultations...');

  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  const daysFromNow = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const c1 = await Consultation.create({
    title: 'Draft Small Business Tax Relief Ordinance 2083',
    titleNepali: 'साना व्यवसाय कर राहत अध्यादेश मस्यौदा २०८३',
    description: 'A proposed ordinance to reduce tax burden on small and medium enterprises and simplify filing procedures.',
    fullDraftText: 'This ordinance proposes a tiered tax relief structure for businesses with annual revenue under NPR 5,000,000...',
    clauses: [
      { clauseId: '1', title: 'Eligibility', text: 'Businesses with annual revenue under NPR 5,000,000 qualify for relief.' },
      { clauseId: '2', title: 'Filing Simplification', text: 'Quarterly filing is replaced with a simplified annual return.' },
      { clauseId: '3', title: 'Compliance Timeline', text: 'Businesses must transition to the new system within 6 months.' },
    ],
    department: DEPARTMENTS[0],
    targetAudience: 'Small business owners, traders, accountants',
    status: 'open',
    openDate: daysAgo(14),
    closeDate: daysFromNow(7),
    createdBy: officerFinance._id,
  });

  const c2 = await Consultation.create({
    title: 'Draft Forest and Wetland Protection Amendment',
    titleNepali: 'वन तथा सिमसार संरक्षण संशोधन मस्यौदा',
    description: 'Amendment strengthening protections for forest and wetland areas near urban development zones.',
    fullDraftText: 'This amendment restricts construction within 500m of designated wetland areas...',
    clauses: [
      { clauseId: '1', title: 'Buffer Zones', text: 'Establishes a 500m no-construction buffer around wetlands.' },
      { clauseId: '2', title: 'Enforcement', text: 'Local authorities are empowered to issue stop-work orders.' },
    ],
    department: DEPARTMENTS[1],
    targetAudience: 'Developers, environmental groups, local residents',
    status: 'closed',
    openDate: daysAgo(45),
    closeDate: daysAgo(15),
    createdBy: officerEnv._id,
    governmentResponse: {
      summaryText: 'Based on public feedback, the buffer zone was reduced from 500m to 300m for areas already zoned residential before 2075, while keeping full protection for undeveloped wetlands.',
      actionTaken: 'Clause 1 amended; enforcement clause unchanged.',
      postedBy: officerEnv._id,
      postedAt: daysAgo(10),
    },
  });

  const c3 = await Consultation.create({
    title: 'Draft Digital Identity Verification Framework',
    description: 'Framework for citizen digital identity verification across government e-services.',
    department: DEPARTMENTS[2],
    targetAudience: 'General public',
    status: 'draft',
    openDate: daysFromNow(5),
    closeDate: daysFromNow(35),
    createdBy: admin._id,
  });

  console.log('[seed] Created 3 consultations. Generating feedback...');

  const openConsultations = [c1, c2];
  let created = 0;

  for (const consultation of openConsultations) {
    for (let i = 0; i < 28; i += 1) {
      const base = SAMPLE_COMMENTS[i % SAMPLE_COMMENTS.length];
      const citizen = citizens[i % citizens.length];
      const clause = consultation.clauses.length
        ? consultation.clauses[i % consultation.clauses.length].clauseId
        : null;

      // eslint-disable-next-line no-await-in-loop
      const existingTexts = await Feedback.find({ consultation: consultation._id }).select('text').lean();
      const analysis = analyzeFeedbackText(base.text);
      const { isDuplicate, bestScore } = detectDuplicate(base.text, existingTexts.map((f) => f.text));

      try {
        // eslint-disable-next-line no-await-in-loop
        await Feedback.create({
          consultation: consultation._id,
          clauseId: clause,
          user: citizen._id,
          stance: base.stance,
          autoCategories: analysis.autoCategories,
          text: base.text,
          sentiment: analysis.sentiment,
          keywords: analysis.keywords,
          isFlaggedDuplicate: isDuplicate,
          duplicateOfScore: bestScore,
          createdAt: daysAgo(Math.floor(Math.random() * 13)),
        });
        created += 1;
      } catch (err) {
        // duplicate unique-index hit (same citizen/clause) - skip, expected
        // to happen occasionally given the small demo pool.
      }
    }
  }

  console.log(`[seed] Created ${created} feedback entries.`);

  await Grievance.create([
    {
      user: citizens[3]._id,
      subject: 'Delayed response on tax relief eligibility query',
      category: 'delay',
      description: 'I submitted a query about the tax relief ordinance eligibility three weeks ago and have not heard back from the department.',
      relatedConsultation: c1._id,
      department: DEPARTMENTS[0],
      status: 'under-review',
    },
    {
      user: citizens[8]._id,
      subject: 'Consultation portal was unreachable during the comment window',
      category: 'technical-issue',
      description: 'The site returned errors for several hours on the last day of the forest and wetland amendment consultation, which may have prevented some citizens from submitting feedback in time.',
      relatedConsultation: c2._id,
      department: DEPARTMENTS[1],
      status: 'resolved',
      response: {
        text: 'We have extended the comment window by 48 hours to compensate for the outage and confirmed no submissions were lost.',
        respondedBy: officerEnv._id,
        respondedAt: daysAgo(9),
      },
    },
  ]);
  console.log('[seed] Created 2 demo grievances.');

  console.log('[seed] Done. Demo logins (password: Password123!):');
  console.log('  admin@sarokar.gov.np (admin)');
  console.log('  officer.finance@sarokar.gov.np (officer, Ministry of Finance)');
  console.log('  officer.environment@sarokar.gov.np (officer, Ministry of Environment)');
  console.log('  citizen1@example.com ... citizen20@example.com (citizen)');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
