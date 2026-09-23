import authService from '../services/auth.service.js';
import prisma from '../config/prisma.js';

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'تم تسجيل الحساب بنجاح',
        data: user,
      });
    } catch (error) {
      next(error); // إرسال الخطأ إلى Error Middleware
    }
  }

  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);
      
      const isProduction = process.env.NODE_ENV === 'production';
      
      // تعيين الكوكي
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProduction,
        sameSite: process.env.COOKIE_SAME_SITE || 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: { user }, // بدون التوكن
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // زيادة tokenVersion لإلغاء جميع الجلسات القديمة إذا كان المستخدم مسجلاً للدخول
      if (req.user) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { tokenVersion: { increment: 1 } },
        });
      }

      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_SAME_SITE || 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'تم تسجيل الخروج وإبطال الجلسة بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, code, newPassword } = req.body;
      const result = await authService.resetPassword(email, code, newPassword);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
