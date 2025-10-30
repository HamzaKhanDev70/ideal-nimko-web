import express from 'express';
import SalesRecord from '../models/SalesRecord.js';
import Product from '../models/project.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is salesman or admin
const requireSalesman = (req, res, next) => {
  if (!['salesman', 'admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Salesman, admin or super admin required.' });
  }
  next();
};

// @route   POST /api/sales/record
// @desc    Record a sale
// @access  Private (Salesman)
router.post('/record', authenticateToken, requireSalesman, async (req, res) => {
  try {
    const { shopkeeperId, productId, quantity, unitPrice, paymentMethod, notes } = req.body;

    // Verify shopkeeper exists and is assigned to this salesman
    const shopkeeper = await User.findOne({
      _id: shopkeeperId,
      role: 'shopkeeper',
      assignedSalesman: req.user._id,
      isActive: true
    });

    if (!shopkeeper) {
      return res.status(404).json({ error: 'Shopkeeper not found or not assigned to you' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const totalAmount = quantity * unitPrice;
    const commissionRate = req.user.commissionRate || 0;
    const commission = (totalAmount * commissionRate) / 100;
    const profit = totalAmount - commission;

    const salesRecord = new SalesRecord({
      salesman: req.user._id,
      shopkeeper: shopkeeperId,
      product: productId,
      quantity,
      unitPrice,
      totalAmount,
      commission,
      profit,
      paymentMethod,
      notes
    });

    await salesRecord.save();

    // Populate the sales record data
    await salesRecord.populate([
      { path: 'salesman', select: 'name email' },
      { path: 'shopkeeper', select: 'name email phone' },
      { path: 'product', select: 'name category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      salesRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/sales
// @desc    Get sales records
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { salesmanId, shopkeeperId, startDate, endDate, page = 1, limit = 10 } = req.query;
    let query = {};

    // Filter based on user role
    if (req.user.role === 'salesman') {
      query.salesman = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see sales of their assigned salesmen
      const salesmen = await User.find({ assignedBy: req.user._id }).select('_id');
      query.salesman = { $in: salesmen.map(s => s._id) };
    }

    if (salesmanId) {
      query.salesman = salesmanId;
    }

    if (shopkeeperId) {
      query.shopkeeper = shopkeeperId;
    }

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;
    const salesRecords = await SalesRecord.find(query)
      .populate('salesman', 'name email')
      .populate('shopkeeper', 'name email phone')
      .populate('product', 'name category imageURL')
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SalesRecord.countDocuments(query);

    res.json({
      salesRecords,
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

// @route   GET /api/sales/stats
// @desc    Get sales statistics
// @access  Private (Admin/SuperAdmin)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, salesmanId } = req.query;
    let matchQuery = {};

    if (startDate && endDate) {
      matchQuery.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (salesmanId) {
      matchQuery.salesman = salesmanId;
    } else if (req.user.role === 'admin') {
      // Admin can see stats of their assigned salesmen
      const salesmen = await User.find({ assignedBy: req.user._id }).select('_id');
      matchQuery.salesman = { $in: salesmen.map(s => s._id) };
    }

    const stats = await SalesRecord.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          totalCommission: { $sum: '$commission' },
          totalProfit: { $sum: '$profit' },
          averageSaleValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get monthly breakdown
    const monthlyStats = await SalesRecord.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          },
          revenue: { $sum: '$totalAmount' },
          profit: { $sum: '$profit' },
          sales: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.json({
      stats: stats[0] || {
        totalSales: 0,
        totalQuantity: 0,
        totalRevenue: 0,
        totalCommission: 0,
        totalProfit: 0,
        averageSaleValue: 0
      },
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/sales/profit-loss
// @desc    Get profit/loss analysis
// @access  Private (SuperAdmin)
router.get('/profit-loss', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Super admin required.' });
    }

    const { startDate, endDate } = req.query;
    let matchQuery = {};

    if (startDate && endDate) {
      matchQuery.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const profitLoss = await SalesRecord.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalCost: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
          totalCommission: { $sum: '$commission' },
          totalProfit: { $sum: '$profit' },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    const result = profitLoss[0] || {
      totalRevenue: 0,
      totalCost: 0,
      totalCommission: 0,
      totalProfit: 0,
      salesCount: 0
    };

    result.profitMargin = result.totalRevenue > 0 ? (result.totalProfit / result.totalRevenue) * 100 : 0;

    res.json({ profitLoss: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/sales/:id/payment-status
// @desc    Update payment status
// @access  Private (Salesman/Admin)
router.put('/:id/payment-status', authenticateToken, requireSalesman, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const salesRecord = await SalesRecord.findById(req.params.id);

    if (!salesRecord) {
      return res.status(404).json({ error: 'Sales record not found' });
    }

    // Check permissions
    if (req.user.role === 'salesman' && salesRecord.salesman.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    salesRecord.paymentStatus = paymentStatus;
    await salesRecord.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      salesRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
