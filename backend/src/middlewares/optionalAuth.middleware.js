import jwt from 'jsonwebtoken';

/**
 * Optional authentication middleware:
 * If Authorization header with valid Bearer token is provided, sets req.user.
 * If not provided or invalid, continues without throwing error (guest mode).
 */
const optionalAuth = (req, res, next) => {
  try {
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // Treat as unauthenticated guest
    req.user = null;
  }
  next();
};

export default optionalAuth;
