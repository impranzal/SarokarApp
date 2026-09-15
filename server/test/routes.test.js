const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

test('health endpoint reports API readiness shape', async () => {
  const response = await request(app).get('/api/health');
  assert.match(response.body.status, /ok|degraded/);
  assert.equal(response.body.service, 'sarokar-api');
});
test('consultation mutation requires authentication', async () => {
  const response = await request(app).post('/api/consultations').send({});
  assert.equal(response.status, 401);
});
test('feedback mutation requires authentication', async () => {
  const response = await request(app).post('/api/feedback').send({});
  assert.equal(response.status, 401);
});
test('invalid login payload is rejected before database access', async () => {
  const response = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: '' });
  assert.equal(response.status, 400);
});
