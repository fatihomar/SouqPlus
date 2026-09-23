import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import errorMiddleware from './middlewares/error.middleware.js';
import requestIdMiddleware from './middlewares/requestId.middleware.js';

const app = express();

// 1. Request ID (يجب أن يكون أول شيء لتتبع باقي المسارات)
app.use(requestIdMiddleware);

// HTTP Access Logging (Morgan) - Safe (No body logging)
import morgan from 'morgan';
morgan.token('id', (req) => req.id);
app.use(morgan(':id :method :url :status :response-time ms - :res[content-length]'));

// 3. CORS
// نأخذ قائمة النطاقات المسموحة من المتغيرات البيئية أو نسمح بالمحلي فقط
const allowedOrigins = process.env.FRONTEND_ORIGINS 
  ? process.env.FRONTEND_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Global Rate Limiter (200 requests per 15 minutes per IP)
import rateLimit from 'express-rate-limit';
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased to 1000 to prevent issues during dev/testing
  message: { success: false, error: 'تم تجاوز الحد العام المسموح للطلبات، يرجى الانتظار.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 2. Security Headers (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xContentTypeOptions: true,
  frameguard: { action: 'deny' }, // Clickjacking protection
  strictTransportSecurity: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// 4. Body Parsers (limits set per route type)
// Allow larger payloads for specific routes that need it
app.use(['/api/listings', '/api/v1/listings', '/api/ai', '/api/v1/ai'], express.json({ limit: '10mb' }));
app.use(['/api/listings', '/api/v1/listings'], express.urlencoded({ extended: true, limit: '2mb' }));

// Default strict limits for everything else (Login, Messages, Offers, etc)
app.use(express.json({ limit: '50kb' })); 
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// 5. CSRF Protection
const csrfProtection = csurf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax')
  } 
});

if (process.env.NODE_ENV !== 'test') {
  app.use(csrfProtection);
}

// مسار لإرسال توكن CSRF للواجهة الأمامية
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Health Check Route (للتأكد من عمل السيرفر)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Souq++ Backend is running perfectly!'
  });
});

// API Routes
import authRoutes from './routes/auth.routes.js';
import listingRoutes from './routes/listing.routes.js';
import uploadRoutes from './routes/upload.routes.js'; // استيراد مسار رفع الصور
import messagesRoutes from './routes/messages.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import offersRoutes from './routes/offers.routes.js';
import aiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';
import myListingsStatsRoutes from './routes/myListingsStats.routes.js';

app.use(['/api/auth', '/api/v1/auth'], authRoutes);
app.use(['/api/listings', '/api/v1/listings'], listingRoutes);
app.use(['/api/my-listings', '/api/v1/my-listings'], myListingsStatsRoutes);
app.use(['/api/upload', '/api/v1/upload'], uploadRoutes);
app.use(['/api/messages', '/api/v1/messages'], messagesRoutes);
app.use(['/api/favorites', '/api/v1/favorites'], favoritesRoutes);
app.use(['/api/notifications', '/api/v1/notifications'], notificationsRoutes);
app.use(['/api/offers', '/api/v1/offers'], offersRoutes);
app.use(['/api/ai', '/api/v1/ai'], aiRoutes);
app.use(['/api/admin', '/api/v1/admin'], adminRoutes);

// Basic 404 Route (لمعالجة الروابط غير الموجودة)
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global Error Handler (لالتقاط الأخطاء برمجياً)
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

const isMainModule = process.argv[1] === new URL(import.meta.url).pathname || process.argv[1] === import.meta.filename || import.meta.url === `file://${process.argv[1]}`;
if (isMainModule || process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
  });
}

export default app;
