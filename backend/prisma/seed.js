require('dotenv').config();
const prisma = require('../src/config/prisma');
const bcrypt = require('bcrypt');

async function main() {
  console.log('🌱 البدأ بإنشاء البيانات الأساسية (Seeding)...');

  const adminEmail = 'fatihomar@gmail.com';
  
  // التحقق مما إذا كان المدير موجوداً بالفعل
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('FatihAdmin123', 10);
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'فاتح',
        passwordHash: passwordHash,
        role: 'ADMIN',
        isVerified: true,
      }
    });
    console.log(`✅ تم إنشاء حساب المدير بنجاح: ${adminEmail}`);
  } else {
    console.log(`⚠️ حساب المدير موجود مسبقاً: ${adminEmail}`);
  }

  console.log('✅ اكتملت عملية إنشاء البيانات.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
