import authService from '../services/auth.service.js';
import prisma from '../config/prisma.js';
import { OAuth2Client } from 'google-auth-library';

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
        secure: true, // Always true for cross-origin
        sameSite: 'none', // Always 'none' for cross-origin
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
        secure: true,
        sameSite: 'none',
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

  async googleAuth(req, res, next) {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      // In production, Next.js rewrites '/api' to backend, so backend callback is same as frontend host.
      const redirectUri = isProduction ? process.env.GOOGLE_REDIRECT_URI : 'http://localhost:3000/api/auth/google/callback';
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        prompt: 'consent'
      });
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const { code } = req.query;
      const isProduction = process.env.NODE_ENV === 'production';
      const frontendUrl = isProduction ? 'https://plus-nine.vercel.app' : 'http://localhost:3000';

      if (!code) {
        return res.redirect(`${frontendUrl}/login?error=Google authentication cancelled`);
      }

      const redirectUri = isProduction ? process.env.GOOGLE_REDIRECT_URI : 'http://localhost:3000/api/auth/google/callback';
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );

      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const { user, token } = await authService.googleLogin(payload);

      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Always true for cross-origin
        sameSite: 'none', // Always 'none' for cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.redirect(`${frontendUrl}/home`);
    } catch (error) {
      console.error(error);
      const frontendUrl = process.env.NODE_ENV === 'production' ? 'https://plus-nine.vercel.app' : 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=Google login failed`);
    }
  }
}

export default new AuthController();
