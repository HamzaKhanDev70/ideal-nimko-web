import express from 'express';
import User from '../models/User.js';
import Order from '../models/order.js';
import ShopkeeperOrder from '../models/ShopkeeperOrder.js';
import Recovery from '../models/Recovery.js';
import Receipt from '../models/Receipt.js';
import Product from '../models/project.js';
import SalesRecord from '../models/SalesRecord.js';
import ProductDistribution from '../models/ProductDistribution.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin or superadmin
const requireAdmin = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Admin or Super Admin required.' });
  }
  next();
};

// @route   GET /api/analytics/dashboard
// @desc    Get comprehensive analytics dashboard data
// @access  Private (Admin, Super Admin)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Build date filter for queries
    const dateFilter = {
      createdAt: {
        $gte: start,
        $lte: end
      }
    };

    // Get basic counts
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalShopkeeperOrders,
      totalRecoveries,
      totalReceipts
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['shopkeeper', 'salesman'] } }),
      Product.countDocuments(),
      Order.countDocuments(dateFilter),
      ShopkeeperOrder.countDocuments(dateFilter),
      Recovery.countDocuments(dateFilter),
      Receipt.countDocuments(dateFilter)
    ]);

    // Get revenue data from orders
    const orderRevenue = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get revenue data from shopkeeper orders
    const shopkeeperOrderRevenue = await ShopkeeperOrder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get recovery data
    const recoveryStats = await Recovery.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAmountCollected: { $sum: '$amountCollected' },
          totalNetPayment: { $sum: '$netPayment' },
          totalItemsValue: { $sum: '$itemsValue' }
        }
      }
    ]);

    // Get monthly breakdown
    const monthlyStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get shopkeeper order monthly breakdown
    const shopkeeperMonthlyStats = await ShopkeeperOrder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get user role distribution
    const userRoleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top products by sales
    const topProducts = await ShopkeeperOrder.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Get salesman performance
    const salesmanPerformance = await ShopkeeperOrder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$salesman',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'salesman'
        }
      },
      { $unwind: '$salesman' }
    ]);

    // Get shopkeeper performance
    const shopkeeperPerformance = await ShopkeeperOrder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$shopkeeper',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'shopkeeper'
        }
      },
      { $unwind: '$shopkeeper' }
    ]);

    // Calculate total revenue from all sources
    const totalRevenue = (orderRevenue[0]?.totalRevenue || 0) + 
                        (shopkeeperOrderRevenue[0]?.totalRevenue || 0) +
                        (recoveryStats[0]?.totalAmountCollected || 0);

    // Calculate total orders
    const totalAllOrders = totalOrders + totalShopkeeperOrders;

    // Calculate average order value
    const totalOrderValue = (orderRevenue[0]?.totalRevenue || 0) + 
                           (shopkeeperOrderRevenue[0]?.totalRevenue || 0);
    const averageOrderValue = totalAllOrders > 0 ? totalOrderValue / totalAllOrders : 0;

    // Combine monthly stats
    const combinedMonthlyStats = monthlyStats.map(stat => {
      const shopkeeperStat = shopkeeperMonthlyStats.find(s => 
        s._id.year === stat._id.year && s._id.month === stat._id.month
      );
      return {
        month: `${stat._id.year}-${stat._id.month.toString().padStart(2, '0')}`,
        revenue: stat.revenue + (shopkeeperStat?.revenue || 0),
        orders: stat.orders + (shopkeeperStat?.orders || 0)
      };
    });

    res.json({
      success: true,
      analytics: {
        overview: {
          totalRevenue,
          totalOrders: totalAllOrders,
          averageOrderValue,
          totalUsers,
          totalProducts,
          totalRecoveries,
          totalReceipts
        },
        revenue: {
          websiteOrders: orderRevenue[0]?.totalRevenue || 0,
          shopkeeperOrders: shopkeeperOrderRevenue[0]?.totalRevenue || 0,
          recoveries: recoveryStats[0]?.totalAmountCollected || 0,
          netPayment: recoveryStats[0]?.totalNetPayment || 0,
          itemsValue: recoveryStats[0]?.totalItemsValue || 0
        },
        monthlyStats: combinedMonthlyStats,
        userRoleStats,
        topProducts: topProducts.map(item => ({
          productName: item.product.name,
          totalQuantity: item.totalQuantity,
          totalRevenue: item.totalRevenue
        })),
        salesmanPerformance: salesmanPerformance.map(item => ({
          salesmanName: item.salesman.name,
          totalOrders: item.totalOrders,
          totalRevenue: item.totalRevenue,
          averageOrderValue: item.averageOrderValue
        })),
        shopkeeperPerformance: shopkeeperPerformance.map(item => ({
          shopkeeperName: item.shopkeeper.name,
          totalOrders: item.totalOrders,
          totalRevenue: item.totalRevenue,
          averageOrderValue: item.averageOrderValue
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analytics/salesman/:salesmanId
// @desc    Get analytics for specific salesman
// @access  Private (Admin, Super Admin)
router.get('/salesman/:salesmanId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { salesmanId } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    
    const dateFilter = {
      salesman: salesmanId,
      createdAt: {
        $gte: start,
        $lte: end
      }
    };

    // Get salesman orders
    const orderStats = await ShopkeeperOrder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get salesman recoveries
    const recoveryStats = await Recovery.aggregate([
      { $match: { salesman: salesmanId, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalRecoveries: { $sum: 1 },
          totalAmountCollected: { $sum: '$amountCollected' },
          totalNetPayment: { $sum: '$netPayment' }
        }
      }
    ]);

    // Get monthly performance
    const monthlyPerformance = await ShopkeeperOrder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalOrders: orderStats[0]?.totalOrders || 0,
          totalRevenue: orderStats[0]?.totalRevenue || 0,
          averageOrderValue: orderStats[0]?.averageOrderValue || 0,
          totalRecoveries: recoveryStats[0]?.totalRecoveries || 0,
          totalAmountCollected: recoveryStats[0]?.totalAmountCollected || 0,
          totalNetPayment: recoveryStats[0]?.totalNetPayment || 0
        },
        monthlyPerformance: monthlyPerformance.map(stat => ({
          month: `${stat._id.year}-${stat._id.month.toString().padStart(2, '0')}`,
          revenue: stat.revenue,
          orders: stat.orders
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching salesman analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
