import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node seedAdmin.js <user-email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  if (user.role === 'ADMIN') {
    console.log(`User ${email} is already an ADMIN.`);
    process.exit(0);
  }

  // Update user role to ADMIN and increment tokenVersion to invalidate existing sessions
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      role: 'ADMIN',
      tokenVersion: { increment: 1 }
    }
  });

  // Log the action in AuditLog
  await prisma.auditLog.create({
    data: {
      action: 'ROLE_CHANGE',
      details: 'User role changed to ADMIN via CLI seed script',
      targetUserId: updatedUser.id,
      actorId: null // System/CLI action
    }
  });

  console.log(`Successfully made ${email} an ADMIN.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
