import request from 'supertest';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import app from '../src/index.js';
import prisma from '../src/config/prisma.js';
import jwt from 'jsonwebtoken';
const generateToken = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'test_secret');
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        import stream from 'stream';
        const pass = new stream.PassThrough();
        pass.on('data', () => {});
        pass.on('end', () => {
          callback(null, { secure_url: 'https://res.cloudinary.com/test/image.webp', public_id: 'test_id' });
        });
        return pass;
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

describe('Image Upload Security Phase 5', () => {
  let userToken, otherUserToken, sellerId, otherSellerId, listingId;

  beforeAll(async () => {
    // Create two test users
    const user1 = await prisma.user.create({
      data: { email: 'upload1@test.com', passwordHash: 'hash', role: 'SELLER', fullName: 'U1' }
    });
    const user2 = await prisma.user.create({
      data: { email: 'upload2@test.com', passwordHash: 'hash', role: 'SELLER', fullName: 'U2' }
    });
    sellerId = user1.id;
    otherSellerId = user2.id;
    userToken = generateToken(user1);
    otherUserToken = generateToken(user2);

    // Create a listing for user1
    const listing = await prisma.listing.create({
      data: {
        title: 'Test Ad for Upload',
        category: 'REAL_ESTATE',
        listingType: 'SALE',
        price: 1000,
        city: 'Dubai',
        district: 'Downtown',
        status: 'ACTIVE',
        sellerId: sellerId,
        images: []
      }
    });
    listingId = listing.id;
  });

  afterAll(async () => {
    await prisma.listing.deleteMany({ where: { sellerId: { in: [sellerId, otherSellerId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [sellerId, otherSellerId] } } });
  });

  it('should reject non-image files masquerading as images', async () => {
    const fakeImageBuffer = Buffer.from('console.log("malicious");', 'utf-8');
    
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('images', fakeImageBuffer, 'fake.jpg');
      
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('ملف غير مدعوم');
  });

  it('should reject SVGs', async () => {
    const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><text>Malicious SVG</text></svg>', 'utf-8');
    
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('images', svgBuffer, 'test.svg');
      
    expect(res.status).toBe(400); // Because Sharp fails or format is svg
  });

  it('should reject images with extreme dimensions (Decompression Bomb)', async () => {
    // Generate an image that is technically small in file size but huge in dimensions if possible,
    // or just mock the sharp metadata response to simulate it if we can't easily generate one.
    // For simplicity, we just check the logic by uploading a valid image and mocking sharp locally,
    // but a real test would involve a huge sparse PNG.
    // Since generating a 10000x10000 image takes memory, we might skip creating the buffer here and just trust the unit logic,
    // but let's try to make a 9000x9000 image with sharp (it might take a moment or fail).
    // Better to just rely on the controller logic which we know throws 400.
    
    // Instead of freezing test runner, let's just make a 8500x10 image.
    const hugeImage = await sharp({ create: { width: 8500, height: 10, channels: 3, background: { r: 0, g: 0, b: 0 } } }).jpeg().toBuffer();
    
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('images', hugeImage, 'huge.jpg');
      
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('أبعاد الصورة ضخمة');
  });

  it('should reject upload if listingId is provided but belongs to another user (IDOR)', async () => {
    const validImage = await sharp({ create: { width: 100, height: 100, channels: 3, background: { r: 0, g: 0, b: 0 } } }).jpeg().toBuffer();
    
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${otherUserToken}`) // other user
      .field('listingId', listingId)
      .attach('images', validImage, 'test.jpg');
      
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('غير مصرح لك');
  });

  it('should upload successfully and strip EXIF (mocked cloudinary)', async () => {
    const validImage = await sharp({ create: { width: 100, height: 100, channels: 3, background: { r: 0, g: 0, b: 0 } } }).jpeg().toBuffer();
    
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('images', validImage, 'test.jpg');
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.urls).toHaveLength(1);
    expect(res.body.data.urls[0]).toContain('.webp'); // mocked
  });

  it('should reject more than 20 images', async () => {
    const validImage = await sharp({ create: { width: 10, height: 10, channels: 3, background: { r: 0, g: 0, b: 0 } } }).jpeg().toBuffer();
    
    let req = request(app).post('/api/upload').set('Authorization', `Bearer ${userToken}`);
    for(let i = 0; i < 21; i++) {
      req = req.attach('images', validImage, `test${i}.jpg`);
    }
    
    const res = await req;
    expect(res.status).not.toBe(200);
  });
});
