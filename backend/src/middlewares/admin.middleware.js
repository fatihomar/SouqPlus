const adminGuard = (req, res, next) => {
  // يفترض أن authGuard قد قام بعمله مسبقاً وحقن req.user
  if (!req.user) {
    const error = new Error('غير مصرح لك بالدخول، يرجى تسجيل الدخول');
    error.statusCode = 401;
    return next(error);
  }

  if (req.user.role !== 'ADMIN') {
    const error = new Error('ممنوع الوصول. هذه الواجهة مخصصة للمدراء فقط.');
    error.statusCode = 403; // Forbidden
    return next(error);
  }

  next(); // السماح بالمرور
};

export default adminGuard;
