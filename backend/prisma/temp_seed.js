import 'dotenv/config';
import prisma from '../src/config/prisma.js';
import bcrypt from 'bcrypt';

async function main() {
  const hash = await bcrypt.hash('FatihAdmin123', 10);
  await prisma.user.upsert({
    where: { email: 'fatihomar@gmail.com' },
    update: { passwordHash: hash, role: 'ADMIN', isVerified: true },
    create: { email: 'fatihomar@gmail.com', fullName: 'Fatih', passwordHash: hash, role: 'ADMIN', isVerified: true }
  });
  console.log('Admin user ready!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
