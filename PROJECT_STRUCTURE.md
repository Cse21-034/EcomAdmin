# Project Structure

The e-commerce platform has been completely separated into independent backend and frontend applications, ready for deployment on Render and Vercel respectively.

## Directory Structure

```
project-root/
├── backend/                 # Express.js API (Deploy to Render)
│   ├── src/
│   │   ├── auth/           # JWT authentication logic
│   │   ├── middleware/     # Security middleware (CORS, rate limiting)
│   │   ├── routes/         # API route handlers
│   │   ├── db.ts          # Database connection
│   │   ├── storage.ts     # Data access layer
│   │   └── index.ts       # Server entry point
│   ├── package.json       # Backend dependencies
│   ├── tsconfig.json      # TypeScript config
│   ├── render.yaml        # Render deployment config
│   ├── .env.example       # Environment variables template
│   └── README.md          # Backend documentation
│
├── frontend/               # React SPA (Deploy to Vercel)
│   ├── src/
│   │   ├── components/ui/ # shadcn/ui components
│   │   ├── hooks/         # React hooks (useAuth, etc.)
│   │   ├── lib/           # Utilities and API client
│   │   ├── pages/         # Application pages/routes
│   │   └── App.tsx        # Main React component
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.ts     # Vite configuration
│   ├── vercel.json        # Vercel deployment config
│   ├── .env.example       # Environment variables template
│   └── README.md          # Frontend documentation
│
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Database schema and Zod validation
│
├── DEPLOYMENT.md          # Complete deployment guide
└── PROJECT_STRUCTURE.md   # This file
```

## Key Changes Made

### Backend Separation
- ✅ Removed all Vite dependencies
- ✅ Created independent `package.json` with only backend dependencies
- ✅ Clean Express.js server without frontend serving
- ✅ Environment-based CORS configuration
- ✅ Render deployment configuration (`render.yaml`)
- ✅ Production-ready build process

### Frontend Separation
- ✅ Independent React application with Vite
- ✅ Environment-based API URL configuration
- ✅ Proper TypeScript configuration
- ✅ Vercel deployment configuration (`vercel.json`)
- ✅ Proxy configuration for development

### Authentication System
- ✅ JWT-based authentication (replaced Replit auth)
- ✅ Role-based access control (admin, supplier, customer)
- ✅ Admin-controlled supplier approval workflow
- ✅ Secure token management with invalidation support

### Security Features
- ✅ CORS protection with configurable origins
- ✅ Rate limiting protection
- ✅ Helmet security headers
- ✅ bcrypt password hashing
- ✅ Input validation with Zod schemas

## Deployment Process

### Backend (Render)
1. Push `backend/` directory to GitHub
2. Connect repository to Render
3. Use `backend/render.yaml` configuration
4. Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
5. Deploy and run database migrations

### Frontend (Vercel)
1. Push `frontend/` directory to GitHub
2. Connect repository to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy using `frontend/vercel.json` configuration

## Development Setup

### Backend Development
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:push
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

## Test Credentials

- **Admin**: admin@test.com / password
- **Supplier**: supplier@test.com / password (requires admin approval)
- **Customer**: customer@test.com / password

## Next Steps

1. Deploy backend to Render using the provided configuration
2. Deploy frontend to Vercel with backend URL
3. Configure production environment variables
4. Set up monitoring and logging
5. Configure custom domains (optional)

The project is now fully separated and ready for independent deployment on modern hosting platforms.