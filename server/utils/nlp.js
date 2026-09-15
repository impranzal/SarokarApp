/**
 * Lightweight, self-hosted NLP pipeline for Sarokar.
 *
 * Sentiment: AFINN-based lexicon scoring via the `sentiment` package.
 * Theme/keyword extraction: noun-phrase + keyword extraction via `compromise`,
 * matched against a per-category keyword dictionary so the pipeline can run
 * with zero external API calls or paid services - suitable for a student
 * project deployed without a budget.
 *
 * If ENABLE_LLM_SUMMARY=true and an LLM_API_KEY is configured, callers may
 * optionally layer a richer LLM-based summary on top of this (see
 * utils/llmSummary.js). Everything in this file must keep working with no
 * LLM at all - it is the required baseline, not a fallback.
 */

const Sentiment = require('sentiment');
const nlp = require('compromise');
const { CATEGORIES } = require('../models/Feedback');

const sentimentEngine = new Sentiment();

// Keyword dictionary used for auto-categorization. Kept intentionally simple
// (a mapping from category -> trigger words/phrases) so it's transparent,
// auditable, and defensible in a viva - not a black box.
const CATEGORY_KEYWORDS = {
  'economic-impact': [
    'cost', 'price', 'tax', 'budget', 'subsidy', 'economy', 'economic', 'revenue',
    'expensive', 'afford', 'income', 'inflation', 'fee', 'market', 'business', 'trade',
  ],
  'implementation-feasibility': [
    'implement', 'feasible', 'timeline', 'resource', 'capacity', 'infrastructure',
    'enforce', 'practical', 'rollout', 'deadline', 'staff', 'training', 'logistics',
  ],
  'rights-concern': [
    'right', 'freedom', 'privacy', 'discriminat', 'equality', 'liberty', 'consent',
    'minority', 'constitution', 'fundamental', 'protection', 'justice',
  ],
  'drafting-clarity': [
    'unclear', 'ambiguous', 'confusing', 'vague', 'define', 'clarify', 'wording',
    'language', 'clause', 'contradict', 'inconsistent', 'draft',
  ],
  'environmental-impact': [
    'environment', 'pollution', 'climate', 'emission', 'forest', 'wildlife',
    'sustainable', 'waste', 'water', 'air quality', 'ecology', 'green',
  ],
  'administrative-burden': [
    'paperwork', 'bureaucra', 'permit', 'license', 'procedure', 'red tape',
    'form', 'approval', 'documentation', 'process', 'delay', 'office',
  ],
};

function normalize(text) {
  return text.toLowerCase();
}

/**
 * Returns up to 3 ranked categories for a piece of feedback text, each with
 * a 0-1 relevance score, based on keyword-hit density per category.
 */
function categorize(text) {
  const normalized = normalize(text);
  const scores = Object.entries(CATEGORY_KEYWORDS).map(([category, words]) => {
    const hits = words.filter((w) => normalized.includes(w)).length;
    return { category, score: hits };
  });

  const totalHits = scores.reduce((sum, s) => sum + s.score, 0);
  const ranked = scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => ({ category: s.category, score: totalHits ? +(s.score / totalHits).toFixed(2) : 0 }));

  if (ranked.length === 0) {
    return [{ category: 'other', score: 1 }];
  }
  return ranked;
}

/**
 * AFINN-style sentiment scoring, normalized into a label + confidence.
 */
function analyzeSentiment(text) {
  const result = sentimentEngine.analyze(text);
  // Normalize the raw AFINN score by comment length so long comments don't
  // automatically read as more extreme than short ones.
  const wordCount = Math.max(text.split(/\s+/).length, 1);
  const normalizedScore = result.score / Math.sqrt(wordCount);

  let label = 'neutral';
  if (normalizedScore > 0.3) label = 'positive';
  else if (normalizedScore < -0.3) label = 'negative';

  const confidence = Math.min(Math.abs(normalizedScore) / 2, 1);

  return {
    label,
    score: result.score,
    confidence: +confidence.toFixed(2),
  };
}

/**
 * Extracts top noun-phrase keywords for the dashboard's keyword panel /
 * word cloud.
 */
function extractKeywords(text, limit = 8) {
  const doc = nlp(text);
  const nounPhrases = doc.nouns().out('array');
  const cleaned = nounPhrases
    .map((phrase) => phrase.toLowerCase().trim())
    .filter((phrase) => phrase.length > 2 && !STOPWORDS.has(phrase));

  // de-dupe while preserving order
  const seen = new Set();
  const unique = cleaned.filter((phrase) => {
    if (seen.has(phrase)) return false;
    seen.add(phrase);
    return true;
  });

  return unique.slice(0, limit);
}

const STOPWORDS = new Set([
  'this', 'that', 'these', 'those', 'thing', 'things', 'it', 'they', 'them',
  'policy', 'government', 'people',
]);

/**
 * Very cheap similarity check for near-duplicate/spam detection: Jaccard
 * similarity over normalized word sets. Good enough for a student-scale
 * dataset without pulling in a heavier TF-IDF/cosine-similarity library;
 * swap for a proper TF-IDF cosine comparison if the corpus grows large.
 */
function jaccardSimilarity(a, b) {
  const setA = new Set(normalize(a).match(/[a-z]+/g) || []);
  const setB = new Set(normalize(b).match(/[a-z]+/g) || []);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  setA.forEach((w) => {
    if (setB.has(w)) intersection += 1;
  });
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

/**
 * Given a new feedback text and a list of existing feedback texts for the
 * same consultation, returns { isDuplicate, bestScore }.
 */
function detectDuplicate(newText, existingTexts, threshold = 0.75) {
  let bestScore = 0;
  for (const existing of existingTexts) {
    const score = jaccardSimilarity(newText, existing);
    if (score > bestScore) bestScore = score;
    if (bestScore >= threshold) break;
  }
  return { isDuplicate: bestScore >= threshold, bestScore: +bestScore.toFixed(2) };
}

/**
 * Runs the full pipeline for a single piece of feedback text.
 */
function analyzeFeedbackText(text) {
  return {
    autoCategories: categorize(text),
    sentiment: analyzeSentiment(text),
    keywords: extractKeywords(text),
  };
}

module.exports = {
  CATEGORIES,
  categorize,
  analyzeSentiment,
  extractKeywords,
  jaccardSimilarity,
  detectDuplicate,
  analyzeFeedbackText,
};
