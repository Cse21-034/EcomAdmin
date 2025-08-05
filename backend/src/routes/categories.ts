import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authenticateToken, requireAdmin } from '../auth/jwt';
import { insertCategorySchema } from '@shared/schema';

const router = Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await storage.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create category (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = insertCategorySchema.parse(req.body);
    const category = await storage.createCategory(validatedData);
    
    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const validatedData = insertCategorySchema.partial().parse(req.body);
    const updatedCategory = await storage.updateCategory(categoryId, validatedData);

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    await storage.deleteCategory(categoryId);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;