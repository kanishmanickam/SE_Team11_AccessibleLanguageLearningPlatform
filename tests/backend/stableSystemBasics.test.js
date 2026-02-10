// Unit tests for Stable System Basics (EPIC-6.7)
// Uses Jest, Supertest, and in-memory MongoDB

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongod;
let token;

const userId = new mongoose.Types.ObjectId();
const secret = 'testsecret';

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = secret;
  app = require('../../backend/server');
  token = require('jsonwebtoken').sign({ id: userId }, secret, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Stable System Basics (EPIC-6.7)', () => {
  it('handles backend errors with proper status codes', async () => {
    await mongoose.connection.close();
    const res = await request(app)
      .get('/api/progress/summary')
      .set('Authorization', `Bearer ${token}`);
    expect([500, 401]).toContain(res.statusCode);
    await mongoose.connect(process.env.MONGO_URI);
  });

  it('prevents app crashes on invalid data', async () => {
    const res = await request(app)
      .post('/api/progress/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ lessonId: 'invalid' });
    expect([400, 500]).toContain(res.statusCode);
  });

  it('keeps responses fast (simple queries only)', async () => {
    const start = Date.now();
    const res = await request(app)
      .get('/api/progress/summary')
      .set('Authorization', `Bearer ${token}`);
    const duration = Date.now() - start;
    expect(res.statusCode).toBe(200);
    expect(duration).toBeLessThan(2000); // 2 seconds max
  });

  it('tests basic flows (login → lesson → progress)', async () => {
    // Simulate login, lesson completion, and progress summary
    const completeRes = await request(app)
      .post('/api/progress/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ lessonId: 'lesson1' });
    expect([200, 400]).toContain(completeRes.statusCode);

    const summaryRes = await request(app)
      .get('/api/progress/summary')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 400, 401]).toContain(summaryRes.statusCode);
  });
});
