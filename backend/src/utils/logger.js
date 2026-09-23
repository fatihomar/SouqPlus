import winston from 'winston';

// 1. Data Sanitization
const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'authorization', 'secret', 'key'];

const sanitizeData = (data) => {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  
  const cleanData = { ...data };
  
  for (const key in cleanData) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      cleanData[key] = '***[REDACTED]***';
    } else if (typeof cleanData[key] === 'object' && cleanData[key] !== null) {
      cleanData[key] = sanitizeData(cleanData[key]);
    }
  }
  
  return cleanData;
};

// Custom Winston Format
const customFormat = winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
  const sanitizedMeta = sanitizeData(meta);
  let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  if (requestId) {
    log += ` [ReqID: ${requestId}]`;
  }
  if (Object.keys(sanitizedMeta).length > 0) {
    log += ` | Meta: ${JSON.stringify(sanitizedMeta)}`;
  }
  return log;
});

// Create the logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        customFormat
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
