import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/prisma.js';
import jwt from 'jsonwebtoken';

const generateToken = (user) => jwt.sign({ id: user.id, role: user.role, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET || 'test_secret');

describe('AI and Favorites MVC Refactor Tests', () => {
  let userToken, userId;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { email: 'mvc_test@test.com', passwordHash: 'hash', role: 'BUYER', fullName: 'MVC User' }
    });
    userId = user.id;
    userToken = generateToken(user);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  describe('AI Routes Validation', () => {
    it('should fail AI generation without title', async () => {
      const res = await request(app)
        .post('/api/ai/generate-description')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ category: 'CAR' });
        
      expect(res.status).toBe(400); // Validation should catch missing title
    });
  });

  describe('Favorites Routes Validation', () => {
    it('should fail favorite toggle with invalid UUID', async () => {
      const res = await request(app)
        .post('/api/favorites/toggle')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ listingId: 'invalid-id' });
        
      expect(res.status).toBe(400); // Validation should catch invalid UUID
    });
  });
});
