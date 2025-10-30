import express from 'express';
import Receipt from '../models/Receipt.js';
import ShopkeeperOrder from '../models/ShopkeeperOrder.js';
import Recovery from '../models/Recovery.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin or superadmin
const requireAdmin = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Admin or Super Admin required.' });
  }
  next();
};

// @route   POST /api/receipts
// @desc    Create a new receipt record
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      receiptType,
      orderId,
      recoveryId,
      receiptContent,
      totalAmount,
      notes
    } = req.body;

    // Validate receipt type and IDs
    if (receiptType === 'order' && !orderId) {
      return res.status(400).json({ error: 'orderId is required for order receipts' });
    }
    if (receiptType === 'recovery' && !recoveryId) {
      return res.status(400).json({ error: 'recoveryId is required for recovery receipts' });
    }

    // Get the original record to extract shopkeeper and salesman info
    let shopkeeper, salesman;
    if (receiptType === 'order') {
      const order = await ShopkeeperOrder.findById(orderId)
        .populate('shopkeeper', 'name email')
        .populate('salesman', 'name email');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      shopkeeper = order.shopkeeper._id;
      salesman = order.salesman._id;
    } else {
      const recovery = await Recovery.findById(recoveryId)
        .populate('shopkeeper', 'name email')
        .populate('salesman', 'name email');
      if (!recovery) {
        return res.status(404).json({ error: 'Recovery not found' });
      }
      shopkeeper = recovery.shopkeeper._id;
      salesman = recovery.salesman._id;
    }

    // Create receipt record
    const receipt = new Receipt({
      receiptType,
      orderId: receiptType === 'order' ? orderId : undefined,
      recoveryId: receiptType === 'recovery' ? recoveryId : undefined,
      shopkeeper,
      salesman,
      receiptContent,
      totalAmount,
      printedBy: req.user._id,
      notes
    });

    await receipt.save();

    res.status(201).json({
      success: true,
      message: 'Receipt recorded successfully',
      receipt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/receipts
// @desc    Get all receipts (filtered by user role)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      receiptType, 
      shopkeeperId, 
      salesmanId, 
      startDate, 
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;

    let query = {};

    // Filter based on user role
    if (req.user.role === 'salesman') {
      query.salesman = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see receipts from their assigned salesmen
      const salesmen = await User.find({ assignedBy: req.user._id, role: 'salesman' }).select('_id');
      query.salesman = { $in: salesmen.map(s => s._id) };
    }

    // Additional filters
    if (receiptType) query.receiptType = receiptType;
    if (shopkeeperId) query.shopkeeper = shopkeeperId;
    if (salesmanId) query.salesman = salesmanId;

    // Date range filter
    if (startDate || endDate) {
      query.printedAt = {};
      if (startDate) query.printedAt.$gte = new Date(startDate);
      if (endDate) query.printedAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const receipts = await Receipt.find(query)
      .populate('shopkeeper', 'name email phone')
      .populate('salesman', 'name email phone')
      .populate('printedBy', 'name email')
      .sort({ printedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Receipt.countDocuments(query);

    res.json({
      success: true,
      receipts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/receipts/:id
// @desc    Get single receipt
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('shopkeeper', 'name email phone')
      .populate('salesman', 'name email phone')
      .populate('printedBy', 'name email');

    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Check permissions
    if (req.user.role === 'salesman' && receipt.salesman._id.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ receipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/receipts/:id/status
// @desc    Update receipt status
// @access  Private (Admin, Super Admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    receipt.status = status;
    await receipt.save();

    res.json({
      success: true,
      message: 'Receipt status updated successfully',
      receipt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/receipts/stats/summary
// @desc    Get receipt statistics
// @access  Private
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = {};
    
    // Filter based on user role
    if (req.user.role === 'salesman') {
      matchQuery.salesman = req.user._id;
    } else if (req.user.role === 'admin') {
      const salesmen = await User.find({ assignedBy: req.user._id, role: 'salesman' }).select('_id');
      matchQuery.salesman = { $in: salesmen.map(s => s._id) };
    }

    // Date range filter
    if (startDate || endDate) {
      matchQuery.printedAt = {};
      if (startDate) matchQuery.printedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.printedAt.$lte = new Date(endDate);
    }

    const stats = await Receipt.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalReceipts: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          averageAmount: { $avg: '$totalAmount' }
        }
      }
    ]);

    const typeStats = await Receipt.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$receiptType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalReceipts: 0,
        totalAmount: 0,
        averageAmount: 0
      },
      typeStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
