import rateLimit from 'express-rate-limit';

// تحديد الهوية بناءً على IP مع البريد الإلكتروني لمنع قفل مستخدمين آخرين على نفس الشبكة
export const authKeyGenerator = (req, res) => {
  return req.body?.email ? `${req.ip}_${req.body.email}` : req.ip;
};

// تقييد محاولات تسجيل الدخول (5 محاولات لكل 15 دقيقة)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { success: false, error: 'تجاوزت الحد المسموح من محاولات الدخول، يرجى المحاولة بعد 15 دقيقة' },
  keyGenerator: authKeyGenerator,
  standardHeaders: true, 
  legacyHeaders: false, 
});

// تقييد محاولات التسجيل (3 محاولات لكل ساعة) لتجنب الـ Spam
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: { success: false, error: 'لقد قمت بمحاولات تسجيل كثيرة، يرجى المحاولة بعد ساعة' },
  keyGenerator: authKeyGenerator,
  standardHeaders: true, 
  legacyHeaders: false, 
});

// تقييد محاولات طلب استعادة كلمة المرور (3 محاولات لكل 15 دقيقة)
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3, 
  message: { success: false, error: 'تجاوزت الحد المسموح، يرجى المحاولة بعد قليل' },
  keyGenerator: authKeyGenerator,
  standardHeaders: true, 
  legacyHeaders: false, 
});

// تقييد طلبات الذكاء الاصطناعي الثقيلة (10 محاولات كل 30 دقيقة للمستخدم)
export const aiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'تجاوزت الحد المسموح من استخدام الذكاء الاصطناعي. يرجى المحاولة لاحقاً.' },
  keyGenerator: (req, res) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin General Rate Limiter (100 requests per minute)
export const adminGeneralLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: 'تم تجاوز الحد المسموح للإدارة. يرجى الانتظار.' },
  keyGenerator: (req, res) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin Sensitive Rate Limiter (20 requests per minute for ban/delete actions)
export const adminSensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'تم تجاوز الحد المسموح للعمليات الحساسة. يرجى الانتظار.' },
  keyGenerator: (req, res) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

