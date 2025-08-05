import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  tokenVersion: number;
}

export function generateToken(payload: Omit<JWTPayload, 'tokenVersion'>, tokenVersion: number): string {
  return jwt.sign(
    { ...payload, tokenVersion },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Verify token version to ensure it hasn't been invalidated
    const user = await storage.getUserById(payload.userId);
    if (!user || user.jwtTokenVersion !== payload.tokenVersion) {
      return res.status(403).json({ message: 'Token has been invalidated' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is deactivated' });
    }

    // For suppliers, check if they're approved
    if (user.role === 'supplier' && !user.isApproved) {
      return res.status(403).json({ message: 'Supplier account pending approval' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

export function requireRole(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole('admin')(req, res, next);
}

export function requireSupplier(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin', 'supplier'])(req, res, next);
}

export async function invalidateUserTokens(userId: number): Promise<void> {
  await storage.incrementUserTokenVersion(userId);
}