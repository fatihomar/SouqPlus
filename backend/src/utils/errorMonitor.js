import logger from './logger.js';

let errorCount = 0;
let lastAlertTime = 0;
export const ERROR_THRESHOLD = 20; // 20 errors
export const TIME_WINDOW_MS = 60 * 1000; // 1 minute
export const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown before next alert

// Reset error count every minute
setInterval(() => {
  errorCount = 0;
}, TIME_WINDOW_MS);

export const monitorError = (error, req) => {
  errorCount++;
  
  if (errorCount >= ERROR_THRESHOLD) {
    const now = Date.now();
    if (now - lastAlertTime > COOLDOWN_MS) {
      lastAlertTime = now;
      logger.error('HIGH ERROR RATE: Too many errors occurred recently. Please check the system!', {
        totalErrors: errorCount,
        alertType: 'HIGH_ERROR_RATE'
      });
      // In the future, this is where you'd trigger Discord/Telegram webhook
    }
  }
};

