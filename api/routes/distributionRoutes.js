import express from 'express';
import ProductDistribution from '../models/ProductDistribution.js';
import Product from '../models/project.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin or superadmin
const requireAdmin = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Admin or super admin required.' });
  }
  next();
};

// Middleware to check if user is salesman or admin
const requireSalesman = (req, res, next) => {
  if (!['salesman', 'admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Salesman, admin or super admin required.' });
  }
  next();
};

// @route   POST /api/distribution/admin-to-salesman
// @desc    Admin distributes products to salesman
// @access  Private (Admin)
router.post('/admin-to-salesman', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { productId, salesmanId, quantity, unitPrice, notes } = req.body;

    // Verify salesman exists and is assigned to this admin
    const salesman = await User.findOne({
      _id: salesmanId,
      role: 'salesman',
      assignedBy: req.user._id,
      isActive: true
    });

    if (!salesman) {
      return res.status(404).json({ error: 'Salesman not found or not assigned to you' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if enough stock available
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock available' });
    }

    const totalAmount = quantity * unitPrice;

    const distribution = new ProductDistribution({
      product: productId,
      fromUser: req.user._id,
      toUser: salesmanId,
      quantity,
      unitPrice,
      totalAmount,
      distributionType: 'admin_to_salesman',
      notes
    });

    await distribution.save();

    // Update product stock
    product.stock -= quantity;
    await product.save();

    // Populate the distribution data
    await distribution.populate([
      { path: 'product', select: 'name category' },
      { path: 'fromUser', select: 'name email' },
      { path: 'toUser', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Products distributed to salesman successfully',
      distribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/distribution/salesman-to-shopkeeper
// @desc    Salesman distributes products to shopkeeper
// @access  Private (Salesman)
router.post('/salesman-to-shopkeeper', authenticateToken, requireSalesman, async (req, res) => {
  try {
    const { productId, shopkeeperId, quantity, unitPrice, notes } = req.body;

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

    // Check if salesman has enough stock (from previous distributions)
    const totalDistributed = await ProductDistribution.aggregate([
      {
        $match: {
          toUser: req.user._id,
          product: productId,
          distributionType: 'admin_to_salesman',
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' }
        }
      }
    ]);

    const totalSold = await ProductDistribution.aggregate([
      {
        $match: {
          fromUser: req.user._id,
          product: productId,
          distributionType: 'salesman_to_shopkeeper',
          status: { $in: ['delivered', 'pending'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' }
        }
      }
    ]);

    const availableStock = (totalDistributed[0]?.total || 0) - (totalSold[0]?.total || 0);

    if (availableStock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock available' });
    }

    const totalAmount = quantity * unitPrice;

    const distribution = new ProductDistribution({
      product: productId,
      fromUser: req.user._id,
      toUser: shopkeeperId,
      quantity,
      unitPrice,
      totalAmount,
      distributionType: 'salesman_to_shopkeeper',
      notes
    });

    await distribution.save();

    // Populate the distribution data
    await distribution.populate([
      { path: 'product', select: 'name category' },
      { path: 'fromUser', select: 'name email' },
      { path: 'toUser', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Products distributed to shopkeeper successfully',
      distribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/distribution
// @desc    Get distribution records
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10, startDate, endDate } = req.query;
    let query = {};

    // Filter based on user role
    if (req.user.role === 'salesman') {
      query.$or = [
        { fromUser: req.user._id },
        { toUser: req.user._id }
      ];
    } else if (req.user.role === 'admin') {
      query.$or = [
        { fromUser: req.user._id },
        { toUser: { $in: await User.find({ assignedBy: req.user._id }).select('_id') } }
      ];
    }

    if (type) {
      query.distributionType = type;
    }

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;
    const distributions = await ProductDistribution.find(query)
      .populate('product', 'name category imageURL')
      .populate('fromUser', 'name email role')
      .populate('toUser', 'name email role phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductDistribution.countDocuments(query);

    res.json({
      distributions,
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

// @route   PUT /api/distribution/:id/status
// @desc    Update distribution status
// @access  Private
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const distribution = await ProductDistribution.findById(req.params.id);

    if (!distribution) {
      return res.status(404).json({ error: 'Distribution record not found' });
    }

    // Check permissions
    if (req.user.role === 'salesman' && distribution.fromUser.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    distribution.status = status;
    if (notes) distribution.notes = notes;

    if (status === 'delivered') {
      distribution.deliveredAt = new Date();
    } else if (status === 'returned') {
      distribution.returnedAt = new Date();
      distribution.returnReason = notes || '';
    }

    await distribution.save();

    res.json({
      success: true,
      message: 'Distribution status updated successfully',
      distribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/distribution/stats
// @desc    Get distribution statistics
// @access  Private (Admin/SuperAdmin)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = {};

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await ProductDistribution.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalDistributions: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalAmount: { $sum: '$totalAmount' },
          pendingDistributions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          deliveredDistributions: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      stats: stats[0] || {
        totalDistributions: 0,
        totalQuantity: 0,
        totalAmount: 0,
        pendingDistributions: 0,
        deliveredDistributions: 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
