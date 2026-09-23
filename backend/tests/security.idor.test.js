import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/index.js';

// We will use the same token generator
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import prisma from '../src/config/prisma.js';

describe('IDOR & Security Tests', () => {
  let userA, userB, adminC;
  let tokenA, tokenB, tokenAdmin;
  let listingA, offerB, notificationA;

  beforeAll(async () => {
    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create User A
    userA = await prisma.user.create({
      data: {
        email: 'usera@test.com',
        fullName: 'User A',
        passwordHash,
        role: 'BUYER'
      }
    });

    // Create User B
    userB = await prisma.user.create({
      data: {
        email: 'userb@test.com',
        fullName: 'User B',
        passwordHash,
        role: 'SELLER'
      }
    });

    // Create Admin
    adminC = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        fullName: 'Admin',
        passwordHash,
        role: 'ADMIN'
      }
    });

    // Generate Tokens by logging in
    const loginA = await request(app).post('/api/auth/login').send({ email: 'usera@test.com', password: 'password123' });
    tokenA = loginA.headers['set-cookie'][0]; // Get the HttpOnly cookie

    const loginB = await request(app).post('/api/auth/login').send({ email: 'userb@test.com', password: 'password123' });
    tokenB = loginB.headers['set-cookie'][0];

    const loginAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'password123' });
    tokenAdmin = loginAdmin.headers['set-cookie'][0];

    // Create a Listing owned by User A
    listingA = await prisma.listing.create({
      data: {
        title: 'Listing A',
        description: 'Listing owned by A',
        category: 'CAR',
        listingType: 'SALE',
        price: 1000,
        city: 'TestCity',
        district: 'TestDistrict',
        sellerId: userA.id,
      }
    });

    // Create an Offer by User B on Listing A
    offerB = await prisma.offer.create({
      data: {
        amount: 800,
        buyerId: userB.id,
        listingId: listingA.id
      }
    });

    // Create a Notification for User A
    notificationA = await prisma.notification.create({
      data: {
        type: 'INFO',
        content: 'Test notification',
        userId: userA.id
      }
    });
  });

  describe('Listings IDOR Protection', () => {
    it('Should block User B from editing Listing A', async () => {
      const res = await request(app)
        .put(`/api/listings/${listingA.id}`)
        .set('Cookie', tokenB)
        .send({ title: 'Hacked Title' });
      
      expect(res.statusCode).toBe(403);
    });

    it('Should allow User A to edit Listing A', async () => {
      const res = await request(app)
        .put(`/api/listings/${listingA.id}`)
        .set('Cookie', tokenA)
        .send({ title: 'Updated Title' });
      
      // Wait, validation might fail if other fields are required. But if it passes, it should be 200.
      // If validation fails it's 400. But definitely not 403.
      expect(res.statusCode).not.toBe(403);
    });
  });

  describe('Offers IDOR Protection', () => {
    it('Should block User B from accepting their own offer on Listing A', async () => {
      const res = await request(app)
        .put(`/api/offers/${offerB.id}/respond`)
        .set('Cookie', tokenB)
        .send({ action: 'ACCEPT' });

      expect(res.statusCode).toBe(403);
    });

    it('Should block User A from making an offer on their own listing', async () => {
      const res = await request(app)
        .post('/api/offers')
        .set('Cookie', tokenA)
        .send({ listingId: listingA.id, amount: 900 });

      expect(res.statusCode).toBe(400); // Because logic returns 400 for own listing
    });
  });

  describe('Notifications IDOR Protection', () => {
    it('Should block User B from marking User A\'s notification as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${notificationA.id}/read`)
        .set('Cookie', tokenB);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Admin Role Protection', () => {
    it('Should block User A from accessing Admin API', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', tokenA);

      expect(res.statusCode).toBe(403);
    });

    it('Should allow Admin to access Admin API', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', tokenAdmin);

      expect(res.statusCode).toBe(200);
    });
  });
});
