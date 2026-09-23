import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const authGuard = async (req, res, next) => {
  try {
    // 1. استخراج الـ Token من الكوكيز بشكل أساسي، أو الهيدر كبديل
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      const error = new Error('UNAUTHORIZED');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    // 2. التحقق من صحة الـ Token وفك التشفير
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. التحقق من حالة المستخدم في قاعدة البيانات وهل هو محظور
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      const error = new Error('USER_NOT_FOUND');
      error.statusCode = 401;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    if (user.isBanned) {
      const error = new Error('USER_BANNED');
      error.statusCode = 403;
      error.code = 'USER_BANNED';
      throw error;
    }

    // التحقق من أن إصدار التوكن يطابق الموجود في قاعدة البيانات (لإبطال الجلسات القديمة)
    if (decoded.tokenVersion !== user.tokenVersion) {
      const error = new Error('SESSION_EXPIRED');
      error.statusCode = 401;
      error.code = 'SESSION_EXPIRED';
      throw error;
    }

    // 4. حقن بيانات المستخدم في الطلب
    req.user = user;

    next(); // السماح بالمرور
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.code = 'INVALID_TOKEN';
      error.message = 'INVALID_TOKEN';
    }
    next(error);
  }
};

export default authGuard;
