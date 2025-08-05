# E-Commerce Frontend

Modern React frontend for the e-commerce platform with JWT authentication and role-based dashboards.

## Features

- ⚛️ React 18 with TypeScript
- 🎨 Modern UI with shadcn/ui components
- 🔐 JWT authentication with protected routes
- 📱 Responsive design with Tailwind CSS
- 👥 Role-based dashboards (Admin, Supplier, Customer)
- 🚀 Ready for deployment on Vercel

## Quick Start

### Prerequisites
- Node.js 18+
- Running backend API

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your backend API URL
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## User Roles & Features

### Customer
- Browse products and categories
- Manage shopping cart
- Place and track orders
- Contact support

### Supplier
- Manage product inventory
- View sales statistics
- Track orders for their products
- Requires admin approval

### Admin
- Approve supplier registrations
- Manage all users and products
- View platform statistics
- Handle customer support messages

## Environment Variables

Required environment variables:
- `VITE_API_URL` - Backend API URL (e.g., `https://your-backend.onrender.com`)

## Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Set the environment variable:
   - `VITE_API_URL` - Your deployed backend URL
3. Deploy using the `vercel.json` configuration

## Project Structure

```
src/
├── components/ui/     # shadcn/ui components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
├── pages/            # Application pages/routes
└── App.tsx           # Main application component
```

## Authentication Flow

1. Users register with email/password
2. Suppliers require admin approval
3. JWT tokens stored in localStorage
4. Protected routes check authentication status
5. Role-based access to different dashboards

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript checks

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for state management
- React Hook Form for form handling
- Wouter for routing
- Tailwind CSS for styling
- shadcn/ui for components