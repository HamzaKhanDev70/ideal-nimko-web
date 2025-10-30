import mongoose from 'mongoose';
import User from '../../api/models/User.js';
import Admin from '../../api/models/Admin.js';
import Order from '../../api/models/order.js';
import ShopkeeperOrder from '../../api/models/ShopkeeperOrder.js';
import Recovery from '../../api/models/Recovery.js';
import Product from '../../api/models/project.js';
import jwt from 'jsonwebtoken';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ideal-nimko';
const JWT_SECRET = process.env.JWT_SECRET || 'ideal_nimko_secret_key_2024';

const connectDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI);
  }
};

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    await connectDB();

    const { httpMethod, headers: requestHeaders, queryStringParameters } = event;
    const pathSegments = event.path.split('/').filter(Boolean);
    const action = pathSegments[pathSegments.length - 1];

    // Authentication middleware
    const authHeader = requestHeaders.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No authorization header' }),
      };
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }

    // Check if user is admin or superadmin - check both User and Admin models
    let user = await User.findById(decoded.id);
    if (!user) {
      const admin = await Admin.findById(decoded.id);
      if (admin) {
        user = {
          _id: admin._id,
          role: admin.role === 'super_admin' ? 'superadmin' : admin.role
        };
      }
    }
    
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Access denied. Admin or Super Admin required.' }),
      };
    }

    // GET /analytics/dashboard - Get comprehensive analytics
    if (httpMethod === 'GET' && action === 'dashboard') {
      const { startDate, endDate } = queryStringParameters || {};
      
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
        totalRecoveries
      ] = await Promise.all([
        User.countDocuments({ role: { $in: ['shopkeeper', 'salesman'] } }),
        Product.countDocuments(),
        Order.countDocuments(dateFilter),
        ShopkeeperOrder.countDocuments(dateFilter),
        Recovery.countDocuments(dateFilter)
      ]);

      // Get revenue data
      const [websiteOrders, shopkeeperOrders, recoveries] = await Promise.all([
        Order.aggregate([
          { $match: dateFilter },
          { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]),
        ShopkeeperOrder.aggregate([
          { $match: dateFilter },
          { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]),
        Recovery.aggregate([
          { $match: dateFilter },
          { $group: { _id: null, totalRecovery: { $sum: '$netPayment' } } }
        ])
      ]);

      const websiteRevenue = websiteOrders[0]?.totalRevenue || 0;
      const shopkeeperRevenue = shopkeeperOrders[0]?.totalRevenue || 0;
      const recoveryAmount = recoveries[0]?.totalRecovery || 0;
      const totalRevenue = websiteRevenue + shopkeeperRevenue + recoveryAmount;

      // Get monthly stats
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

      // Get top products
      const topProducts = await Product.aggregate([
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'items.productId',
            as: 'orders'
          }
        },
        {
          $lookup: {
            from: 'shopkeeperorders',
            localField: '_id',
            foreignField: 'items.productId',
            as: 'shopkeeperOrders'
          }
        },
        {
          $addFields: {
            totalSold: {
              $add: [
                { $sum: '$orders.items.quantity' },
                { $sum: '$shopkeeperOrders.items.quantity' }
              ]
            }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]);

      // Get salesman performance
      const salesmanPerformance = await User.aggregate([
        { $match: { role: 'salesman' } },
        {
          $lookup: {
            from: 'shopkeeperorders',
            localField: '_id',
            foreignField: 'salesman',
            as: 'orders'
          }
        },
        {
          $addFields: {
            totalOrders: { $size: '$orders' },
            totalRevenue: { $sum: '$orders.totalAmount' }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      // Get shopkeeper performance
      const shopkeeperPerformance = await User.aggregate([
        { $match: { role: 'shopkeeper' } },
        {
          $lookup: {
            from: 'shopkeeperorders',
            localField: '_id',
            foreignField: 'shopkeeper',
            as: 'orders'
          }
        },
        {
          $addFields: {
            totalOrders: { $size: '$orders' },
            totalSpent: { $sum: '$orders.totalAmount' },
            pendingAmount: { $ifNull: ['$pendingAmount', 0] }
          }
        },
        { $sort: { totalSpent: -1 } }
      ]);

      const analytics = {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders: totalOrders + totalShopkeeperOrders,
          totalRevenue,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        revenue: {
          websiteOrders: websiteRevenue,
          shopkeeperOrders: shopkeeperRevenue,
          recoveries: recoveryAmount,
          netPayment: totalRevenue
        },
        monthlyStats,
        topProducts,
        salesmanPerformance,
        shopkeeperPerformance
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ analytics }),
      };
    }

    // GET /analytics/salesman/:salesmanId - Get salesman analytics
    if (httpMethod === 'GET' && pathSegments[pathSegments.length - 2] === 'salesman') {
      const salesmanId = pathSegments[pathSegments.length - 1];
      
      const salesman = await User.findById(salesmanId);
      if (!salesman || salesman.role !== 'salesman') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Salesman not found' }),
        };
      }

      const { startDate, endDate } = queryStringParameters || {};
      const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate) : new Date();
      
      const dateFilter = {
        salesman: salesmanId,
        createdAt: { $gte: start, $lte: end }
      };

      const [orders, recoveries] = await Promise.all([
        ShopkeeperOrder.find(dateFilter).populate('shopkeeper', 'name'),
        Recovery.find(dateFilter).populate('shopkeeper', 'name')
      ]);

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalRecoveries = recoveries.length;
      const totalRecoveryAmount = recoveries.reduce((sum, recovery) => sum + recovery.netPayment, 0);

      const analytics = {
        salesman: {
          _id: salesman._id,
          name: salesman.name,
          email: salesman.email
        },
        overview: {
          totalOrders,
          totalRevenue,
          totalRecoveries,
          totalRecoveryAmount,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        orders,
        recoveries
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ analytics }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };

  } catch (error) {
    console.error('Analytics function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
    };
  }
};
