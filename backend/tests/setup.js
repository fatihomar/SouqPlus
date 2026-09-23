import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Setup test database
beforeAll(async () => {
  // We use db push to quickly create/sync the schema for testing without creating migration histories
  execSync('npx prisma db push --accept-data-loss', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL
    },
    stdio: 'ignore'
  });

  import prisma from '../src/config/prisma.js';
  // Clean up database tables before all tests to prevent Unique constraint failures
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.carDetails.deleteMany();
  await prisma.propertyDetails.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  import prisma from '../src/config/prisma.js';
  
  // Clean up database tables after all tests
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.carDetails.deleteMany();
  await prisma.propertyDetails.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  
  await prisma.$disconnect();
});
