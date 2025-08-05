# E-Commerce Backend API

A secure, scalable REST API for an e-commerce platform with JWT authentication and role-based access control.

## Features

- 🔐 JWT Authentication with role-based access control
- 👥 Multi-role support (Admin, Supplier, Customer)
- 🛡️ Security middleware (CORS, Helmet, Rate Limiting)
- 📊 Admin dashboard for supplier approval workflow
- 🗄️ PostgreSQL database with Drizzle ORM
- 🚀 Ready for deployment on Render

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

3. Push database schema:
```bash
npm run db:push
```

4. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Admin Routes
- `GET /api/admin/pending-suppliers` - Get pending supplier approvals
- `POST /api/admin/approve-supplier/:id` - Approve supplier
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/users` - Get all users with stats

### Supplier Routes
- `GET /api/supplier/products` - Get supplier's products
- `GET /api/supplier/stats` - Get supplier statistics
- `GET /api/supplier/orders` - Get orders for supplier's products

### Products & Categories
- `GET /api/products` - Get all products (public)
- `POST /api/products` - Create product (suppliers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/categories` - Get all categories

## Deployment on Render

1. Connect your GitHub repository to Render
2. Use the `render.yaml` configuration provided
3. Set the following environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `JWT_SECRET` (secure random string)
   - `FRONTEND_URL` (your frontend domain)

## Security Features

- JWT token-based authentication
- bcrypt password hashing
- Rate limiting protection
- CORS configuration
- Security headers with Helmet
- Input validation with Zod schemas

## Database Schema

The application uses PostgreSQL with the following main entities:
- Users (with roles: admin, supplier, customer)
- Products (managed by suppliers)
- Categories
- Orders and Order Items
- Cart Items
- Contact Messages

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS