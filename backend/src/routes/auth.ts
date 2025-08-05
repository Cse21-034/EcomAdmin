import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import { hashPassword, comparePassword } from '../auth/password';
import { generateToken, authenticateToken, requireAdmin } from '../auth/jwt';
import { loginSchema, registerSchema } from '@shared/schema';

const router = Router();

// Rate limiting for auth routes
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many authentication attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: { message: 'Too many registration attempts, try again later' },
});

// Register new user
router.post('/register', registerRateLimit, async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const userData = {
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role || 'customer',
      isApproved: validatedData.role === 'supplier' ? false : true, // Suppliers need approval
    };

    const user = await storage.createUser(userData);

    // Generate JWT token
    const token = generateToken(
      { userId: user.id, email: user.email, role: user.role },
      user.jwtTokenVersion
    );

    // Remove password from response
    const { password, ...userResponse } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token,
      requiresApproval: user.role === 'supplier' && !user.isApproved,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user by email
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    // Check if supplier is approved
    if (user.role === 'supplier' && !user.isApproved) {
      return res.status(403).json({ 
        message: 'Supplier account pending approval',
        requiresApproval: true 
      });
    }

    // Update last login
    await storage.updateUser(user.id, { lastLogin: new Date() });

    // Generate JWT token
    const token = generateToken(
      { userId: user.id, email: user.email, role: user.role },
      user.jwtTokenVersion
    );

    // Remove password from response
    const { password, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { password, ...userResponse } = user;
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout (invalidate current token)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    await storage.incrementUserTokenVersion(user.id);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for supplier management
router.get('/pending-suppliers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingSuppliers = await storage.getPendingSuppliers();
    const suppliersResponse = pendingSuppliers.map(({ password, ...supplier }) => supplier);
    res.json({ suppliers: suppliersResponse });
  } catch (error) {
    console.error('Get pending suppliers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/approve-supplier/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    const adminUser = (req as any).user;

    if (isNaN(supplierId)) {
      return res.status(400).json({ message: 'Invalid supplier ID' });
    }

    const approvedSupplier = await storage.approveSupplier(supplierId, adminUser.id);
    const { password, ...supplierResponse } = approvedSupplier;

    res.json({
      message: 'Supplier approved successfully',
      supplier: supplierResponse,
    });
  } catch (error) {
    console.error('Approve supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/deactivate-user/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const deactivatedUser = await storage.deactivateUser(userId);
    const { password, ...userResponse } = deactivatedUser;

    res.json({
      message: 'User deactivated successfully',
      user: userResponse,
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;