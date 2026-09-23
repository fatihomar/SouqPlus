import logger from '../utils/logger.js';
import { monitorError } from '../utils/errorMonitor.js';

/**
 * Global Error Handler Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  const requestId = req.id || 'unknown';
  
  // 1. Internal Logging & Monitoring
  logger.error(err.message, {
    requestId,
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id || 'unauthenticated',
    errorName: err.name,
    stack: err.stack,
  });

  monitorError(err, req);

  // 2. Prepare Public Error Response
  let status = err.statusCode || 500;
  let errorCode = err.code || 'SERVER_ERROR';

  if (status === 500) {
    errorCode = 'SERVER_ERROR';
  } else {
    errorCode = err.code || 'BAD_REQUEST';
  }

  // Handle known Prisma Errors
  if (err.code === 'P2002') {
    status = 409;
    errorCode = 'CONFLICT';
  } else if (err.code === 'P2025') {
    status = 404;
    errorCode = 'NOT_FOUND';
  } else if (err.name === 'PrismaClientKnownRequestError') {
    status = 400;
    errorCode = 'DATABASE_ERROR';
  }

  // 3. Send Response
  res.status(status).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || errorCode
    },
    requestId
  });
};

export default errorMiddleware;
