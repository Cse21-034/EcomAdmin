# Deployment Guide

This guide covers deploying the e-commerce platform with separated backend and frontend to Render and Vercel respectively.

## Architecture Overview

- **Backend**: Express.js API deployed on Render
- **Frontend**: React SPA deployed on Vercel
- **Database**: PostgreSQL on Render or Neon
- **Authentication**: JWT tokens for stateless authentication

## Backend Deployment (Render)

### 1. Prepare Backend

The backend is located in the `backend/` directory with its own `package.json` and configuration.

### 2. Deploy to Render

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Create PostgreSQL Database**:
   - Go to Dashboard → New → PostgreSQL
   - Choose a name (e.g., `ecommerce-db`)
   - Select region and plan
   - Note the connection details

3. **Deploy Backend Service**:
   - Go to Dashboard → New → Web Service
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Configure build settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment**: Node

4. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://[from database]
   JWT_SECRET=your-secure-jwt-secret-key
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Database Setup**:
   After deployment, run the database migration:
   ```bash
   npm run db:push
   ```

### 3. Backend URL

Your backend will be available at: `https://your-service-name.onrender.com`

## Frontend Deployment (Vercel)

### 1. Prepare Frontend

The frontend is located in the `frontend/` directory with its own `package.json` and configuration.

### 2. Deploy to Vercel

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)

2. **Import Project**:
   - Go to Dashboard → New Project
   - Import from GitHub
   - Set root directory to `frontend`

3. **Environment Variables**:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-backend.onrender.com`)

4. **Deploy**:
   Vercel will automatically build and deploy using the `vercel.json` configuration.

## Database Migration

After both services are deployed:

1. **Access your backend terminal** (Render console or local with production DATABASE_URL)
2. **Run database setup**:
   ```bash
   npm run db:push
   ```
3. **Create admin user** (optional):
   ```sql
   INSERT INTO users (email, password, first_name, last_name, role, is_active, is_approved, approved_at, jwt_token_version, created_at, updated_at) 
   VALUES (
     'admin@yourcompany.com', 
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
     'Admin', 
     'User', 
     'admin', 
     true, 
     true, 
     NOW(), 
     1, 
     NOW(), 
     NOW()
   );
   ```

## Environment Variables Reference

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@host:port/database
PORT=3001
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com
```

## Security Considerations

1. **JWT Secret**: Use a strong, random secret key
2. **CORS**: Configure allowed origins in backend
3. **Environment Variables**: Never commit secrets to repository
4. **HTTPS**: Both services should use HTTPS in production
5. **Rate Limiting**: Backend includes rate limiting protection

## Testing Deployment

1. **Backend Health Check**: Visit `https://your-backend.onrender.com/health`
2. **Frontend**: Visit your Vercel URL
3. **Authentication**: Test login/register functionality
4. **API Connectivity**: Verify frontend can communicate with backend

## Troubleshooting

### Common Issues

1. **CORS Errors**: 
   - Verify `FRONTEND_URL` environment variable
   - Check allowed origins in security middleware

2. **Authentication Fails**:
   - Verify `VITE_API_URL` points to correct backend
   - Check JWT_SECRET is set on backend

3. **Database Connection**:
   - Verify DATABASE_URL format
   - Check database is accessible from Render

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json

## Monitoring

- **Render**: Built-in logs and metrics
- **Vercel**: Analytics and function logs
- **Database**: Connection monitoring

## Scaling

- **Backend**: Upgrade Render plan for more resources
- **Frontend**: Vercel automatically scales
- **Database**: Upgrade PostgreSQL plan as needed

## Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Security Patches**: Monitor for security advisories
3. **Database Backups**: Render provides automatic backups
4. **Monitoring**: Set up alerts for service health