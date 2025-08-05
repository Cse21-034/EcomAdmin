import { Router } from 'express';
import { storage } from '../storage';
import { authenticateToken, requireAdmin } from '../auth/jwt';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get pending suppliers for approval
router.get('/pending-suppliers', async (req, res) => {
  try {
    const pendingSuppliers = await storage.getPendingSuppliers();
    const suppliersResponse = pendingSuppliers.map(({ password, ...supplier }) => supplier);
    res.json({ suppliers: suppliersResponse });
  } catch (error) {
    console.error('Get pending suppliers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve supplier
router.post('/approve-supplier/:id', async (req, res) => {
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

// Deactivate user
router.post('/deactivate-user/:id', async (req, res) => {
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

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await storage.getAdminStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await storage.getAllOrders();
    res.json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ message: 'Status is required' });
    }

    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get users with statistics
router.get('/users', async (req, res) => {
  try {
    const users = await storage.getUsersWithStats();
    res.json({ users });
  } catch (error) {
    console.error('Get users with stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;