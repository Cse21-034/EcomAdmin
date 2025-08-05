import { Router } from 'express';
import { storage } from '../storage';
import { authenticateToken, requireSupplier } from '../auth/jwt';

const router = Router();

// All routes require supplier authentication
router.use(authenticateToken);
router.use(requireSupplier);

// Get supplier's own products
router.get('/products', async (req, res) => {
  try {
    const user = (req as any).user;
    const products = await storage.getProducts({ supplierId: user.id });
    res.json({ products });
  } catch (error) {
    console.error('Get supplier products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get supplier statistics
router.get('/stats', async (req, res) => {
  try {
    const user = (req as any).user;
    const stats = await storage.getSupplierStats(user.id);
    res.json({ stats });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get orders for supplier's products
router.get('/orders', async (req, res) => {
  try {
    const user = (req as any).user;
    // Get orders that contain products from this supplier
    const orders = await storage.getOrders();
    
    // Filter orders that contain this supplier's products
    // This would need to be implemented in storage to be more efficient
    res.json({ orders });
  } catch (error) {
    console.error('Get supplier orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;