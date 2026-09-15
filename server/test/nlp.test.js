const test = require('node:test');
const assert = require('node:assert/strict');
const { categorize, analyzeSentiment, detectDuplicate } = require('../utils/nlp');

test('categorizes economic feedback', () => {
  assert.equal(categorize('The tax and subsidy cost will hurt small businesses.')[0].category, 'economic-impact');
});
test('detects sentiment polarity', () => {
  assert.equal(analyzeSentiment('This policy is excellent and fair').label, 'positive');
  assert.equal(analyzeSentiment('This is harmful and unfair').label, 'negative');
});
test('flags near duplicate comments', () => {
  assert.equal(detectDuplicate('The policy increases the tax burden', ['This policy increases the tax burden']).isDuplicate, true);
});
