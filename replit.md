# Replit.md

## Overview

This is a full-stack e-commerce platform built with React, Express, and PostgreSQL. The application supports multiple user roles (admin, supplier, customer) with role-based dashboards and functionality. It features a modern UI built with shadcn/ui components, real-time product management, order processing, and comprehensive admin tools for managing the entire marketplace.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the client-side application
- **Vite** as the build tool and development server with hot module replacement
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with CSS variables for theming

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with role-based access control
- **JWT authentication** with secure token management
- **Modular route structure** organized by functionality
- **Role-based middleware** for protecting routes (admin, supplier, customer)
- **Drizzle ORM** for type-safe database operations and migrations
- **Security middleware** with CORS, helmet, and rate limiting
- **Separated from frontend** for independent deployment

### Database Design
- **PostgreSQL** as the primary database
- **Neon Database** serverless PostgreSQL hosting
- **Drizzle ORM** schema definitions with relations
- **Session storage** table for authentication persistence
- **Multi-role user system** with role-based permissions
- **E-commerce entities**: users, categories, products, orders, cart items, contact messages

### Authentication & Authorization
- **JWT Authentication** with secure token-based authentication
- **bcrypt** password hashing for security
- **Role-based access control** (admin, supplier, customer)
- **Supplier approval workflow** managed by admin users
- **Protected routes** with JWT middleware validation
- **Token invalidation** support for enhanced security

### State Management
- **TanStack Query** for server state with optimistic updates
- **React Hook Form** for form state management with Zod validation
- **Custom hooks** for authentication state and user management
- **Toast notifications** for user feedback

### UI/UX Architecture
- **Mobile-first responsive design** with Tailwind breakpoints
- **Dark/light theme support** via CSS variables
- **Accessible components** using Radix UI primitives
- **Loading states** and error boundaries throughout the application
- **Role-specific dashboards** with different UI layouts per user type

## External Dependencies

### Database & Hosting
- **Neon Database** - Serverless PostgreSQL hosting
- **Replit** - Development platform
- **Ready for deployment** on Render (backend) and Vercel (frontend)

### Authentication & Security
- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing and validation
- **helmet** - Security headers middleware
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting for API protection

### UI & Components
- **Radix UI** - Headless UI component primitives
- **Lucide React** - Icon library
- **shadcn/ui** - Pre-built component library

### Development Tools
- **Drizzle Kit** - Database migration and schema management
- **ESBuild** - Fast JavaScript bundler for production builds
- **TypeScript** - Type safety across the entire stack

### Key Integrations
- **JWT token management** with automatic refresh and invalidation
- **File uploads** and image handling for product management
- **Real-time updates** through TanStack Query's background refetching
- **Form validation** using Zod schemas shared between client and server
- **Separate deployment** ready for Render (backend) and Vercel (frontend)