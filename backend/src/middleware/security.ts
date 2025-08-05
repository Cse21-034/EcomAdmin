import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

export function setupSecurity(app: Express) {
  // Helmet for various security headers with development-friendly CSP
  if (process.env.NODE_ENV === 'development') {
    app.use(helmet({
      contentSecurityPolicy: false, // Disable CSP in development for Vite
      crossOriginEmbedderPolicy: false,
    }));
  } else {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));
  }

  // CORS configuration for frontend deployment
  const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Allow localhost in development
      if (process.env.NODE_ENV === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('replit.dev')) {
          return callback(null, true);
        }
      }
      
      // Add your production frontend URLs here
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'https://your-frontend-domain.vercel.app',
        'https://your-frontend-domain.com',
        // Add more domains as needed
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };

  app.use(cors(corsOptions));

  // General rate limiting
  const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', generalRateLimit);
}