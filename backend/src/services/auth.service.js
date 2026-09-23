import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { sendResetPasswordEmail } from '../utils/mailer.js';

class AuthService {
  async register(data) {
    // 1. التحقق من عدم وجود الإيميل مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const error = new Error('EMAIL_ALREADY_EXISTS');
      error.statusCode = 400;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    // 2. التحقق من الدور (Role) لمنع تسجيل حساب كـ ADMIN من قبل المستخدمين
    let role = 'BUYER';
    if (data.role === 'SELLER') {
      role = 'SELLER';
    }

    // 3. تشفير كلمة المرور (Hashing) لحمايتها
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 4. حفظ المستخدم (نمرر الـ role الآمن)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: role,
      },
    });

    // 5. حذف الباسورد من الكائن قبل إرجاعه لأسباب أمنية
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data) {
    // 1. البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      const error = new Error('INVALID_CREDENTIALS');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // 1.5. التحقق من حالة الحظر
    if (user.isBanned) {
      const error = new Error('USER_BANNED');
      error.statusCode = 403;
      error.code = 'USER_BANNED';
      throw error;
    }

    // 2. مطابقة كلمة المرور المشفرة
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error('INVALID_CREDENTIALS');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // 3. توليد الـ Token متضمناً tokenVersion
    const payload = { id: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d', // صالح لمدة 7 أيام
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'إذا كان هذا البريد مسجلاً، ستصلك رسالة قريباً' }; 
    }

    // توليد كود حقيقي عشوائي وآمن
    const realCode = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // صالح لـ 15 دقائق

    const hashedCode = await bcrypt.hash(realCode, 10);

    // تحديث المستخدم في قاعدة البيانات
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: hashedCode,
        resetCodeExpiresAt: expiresAt,
      },
    });

    // إرسال الكود عبر البريد الإلكتروني
    try {
      await sendResetPasswordEmail(user.email, realCode);
    } catch (error) {
      console.error('Failed to send reset email:', error);
      // We don't throw an error here to prevent email enumeration, but in a real app we might handle it differently.
    }

    return { message: 'إذا كان هذا البريد مسجلاً، ستصلك رسالة قريباً' };
  }

  async resetPassword(email, code, newPassword) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const err = new Error('INVALID_RESET_CODE');
      err.statusCode = 400;
      err.code = 'INVALID_RESET_CODE';
      throw err;
    }

    // التحقق من صحة الكود وتاريخ الصلاحية
    if (!user.resetCode || !user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
      const err = new Error('INVALID_RESET_CODE');
      err.statusCode = 400;
      err.code = 'INVALID_RESET_CODE';
      throw err;
    }

    const isCodeValid = await bcrypt.compare(code, user.resetCode);
    if (!isCodeValid) {
      const err = new Error('INVALID_RESET_CODE');
      err.statusCode = 400;
      err.code = 'INVALID_RESET_CODE';
      throw err;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // تحديث كلمة المرور وإبطال الكود وزيادة tokenVersion لإلغاء جميع الجلسات القديمة
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash,
        resetCode: null,
        resetCodeExpiresAt: null,
        tokenVersion: { increment: 1 }
      },
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }
}

export default new AuthService();
