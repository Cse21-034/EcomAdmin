import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authenticateToken, requireSupplier } from '../auth/jwt';
import { insertProductSchema } from '@shared/schema';

const router = Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      featured: req.query.featured === 'true',
      active: req.query.active !== 'false', // Default to true unless explicitly false
      supplierId: req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined,
    };

    const products = await storage.getProducts(filters);
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create product (suppliers only)
router.post('/', authenticateToken, requireSupplier, async (req, res) => {
  try {
    const user = (req as any).user;
    const validatedData = insertProductSchema.parse(req.body);

    // Set the supplier ID to the current user
    const productData = {
      ...validatedData,
      supplierId: user.id,
    };

    const product = await storage.createProduct(productData);
    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update product (suppliers can only update their own products)
router.put('/:id', authenticateToken, requireSupplier, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const user = (req as any).user;

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Check if product exists and belongs to the supplier
    const existingProduct = await storage.getProduct(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (user.role !== 'admin' && existingProduct.supplierId !== user.id) {
      return res.status(403).json({ message: 'You can only update your own products' });
    }

    const validatedData = insertProductSchema.partial().parse(req.body);
    const updatedProduct = await storage.updateProduct(productId, validatedData);

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete product (suppliers can only delete their own products)
router.delete('/:id', authenticateToken, requireSupplier, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const user = (req as any).user;

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Check if product exists and belongs to the supplier
    const existingProduct = await storage.getProduct(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (user.role !== 'admin' && existingProduct.supplierId !== user.id) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await storage.deleteProduct(productId);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;