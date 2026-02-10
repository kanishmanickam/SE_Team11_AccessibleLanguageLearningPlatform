// Unit tests for progress-related APIs (EPIC-6)
// Uses Jest, Supertest, mock JWT, and in-memory MongoDB

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongod;
let token;

// Mock user and JWT
const userId = new mongoose.Types.ObjectId();
const mockUser = { _id: userId, email: 'test@example.com' };
const secret = 'testsecret';

describe('EPIC-6 Progress API', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    process.env.JWT_SECRET = secret;
    app = require('../../backend/server');
    token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('POST /api/progress/complete', () => {
    it('saves lesson progress and returns 200', async () => {
      const res = await request(app)
        .post('/api/progress/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ lessonId: 'lesson1' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });

    it('returns 400 on missing lessonId', async () => {
      const res = await request(app)
        .post('/api/progress/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.statusCode).toBe(400);
    });

    it('returns 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/progress/complete')
        .send({ lessonId: 'lesson1' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/progress/summary', () => {
    it('returns progress summary with correct fields', async () => {
      // Complete a lesson first
      await request(app)
        .post('/api/progress/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ lessonId: 'lesson2' });
      const res = await request(app)
        .get('/api/progress/summary')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalLessons');
      expect(res.body).toHaveProperty('completedLessons');
      expect(res.body).toHaveProperty('remainingLessons');
      expect(res.body).toHaveProperty('percentage');
    });

    it('handles empty lesson list safely', async () => {
      // Simulate empty lessons (mock or clear DB as needed)
      // ...implementation depends on model structure
      // For now, just check it doesn't crash
      const res = await request(app)
        .get('/api/progress/summary')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalLessons');
    });
  });

  describe('Error handling', () => {
    it('returns 500 on database failure', async () => {
      // Simulate DB failure by closing connection
      await mongoose.connection.close();
      const res = await request(app)
        .get('/api/progress/summary')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
      // Reconnect for other tests
      await mongoose.connect(process.env.MONGO_URI);
    });

    it('never crashes server on error', async () => {
      // Simulate error and ensure server responds
      await mongoose.connection.close();
      const res = await request(app)
        .post('/api/progress/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ lessonId: 'lesson3' });
      expect([500, 401, 400]).toContain(res.statusCode);
      await mongoose.connect(process.env.MONGO_URI);
    });
  });
});
