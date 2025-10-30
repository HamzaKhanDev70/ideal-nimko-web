import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import Product from '../../api/models/project.js';
import Order from '../../api/models/Order.js';
import User from '../../api/models/User.js';
import Admin from '../../api/models/Admin.js';
import ShopkeeperOrder from '../../api/models/ShopkeeperOrder.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ideal-nimko';
const JWT_SECRET = process.env.JWT_SECRET || 'ideal_nimko_secret_key_2024';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI);
  }
};

// Authentication middleware
const authenticateToken = async (authHeader) => {
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();
    
    // Check both User and Admin models
    let user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin) {
        user = {
          _id: admin._id,
          name: admin.username,
          email: admin.email,
          role: admin.role === 'super_admin' ? 'superadmin' : admin.role,
          isActive: admin.isActive
        };
      }
    }
    
    return user;
  } catch (error) {
    return null;
  }
};

export const handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    await connectDB();

    const { httpMethod, path, body, headers } = event;
    const pathSegments = path.split('/').filter(Boolean);
    
    // Handle both /.netlify/functions/api/users and /api/users patterns
    let resource, action, id;
    if (pathSegments[0] === 'netlify' && pathSegments[1] === 'functions') {
      // Pattern: /.netlify/functions/api/users
      resource = pathSegments[2]; // api
      action = pathSegments[3]; // users
      id = pathSegments[4]; // optional id
    } else {
      // Pattern: /api/users
      resource = pathSegments[1]; // api/products, api/orders, etc.
      action = pathSegments[2]; // products, orders, etc.
      id = pathSegments[3]; // ID parameter
    }

    // Parse query parameters
    const queryParams = new URLSearchParams(event.queryStringParameters || {});
    const page = parseInt(queryParams.get('page')) || 1;
    const limit = parseInt(queryParams.get('limit')) || 10;

    // Authentication
    const user = await authenticateToken(headers.authorization);

    // Route to different handlers
    // If resource is 'api', route based on action instead
    const routingResource = resource === 'api' ? action : resource;
    
    switch (routingResource) {
      case 'products':
        return await handleProducts(httpMethod, resource === 'api' ? undefined : action, id, body, queryParams, user);
      case 'orders':
        return await handleOrders(httpMethod, resource === 'api' ? undefined : action, id, body, queryParams, user);
      case 'users':
        return await handleUsers(httpMethod, resource === 'api' ? undefined : action, id, body, queryParams, user);
      case 'shopkeeper-orders':
        return await handleShopkeeperOrders(httpMethod, resource === 'api' ? undefined : action, id, body, queryParams, user);
      case 'admin':
        return await handleAdmin(httpMethod, resource === 'api' ? undefined : action, id, body, queryParams, user);
      default:
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Resource not found' }),
        };
    }

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Products handler
const handleProducts = async (method, action, id, body, queryParams, user) => {
  switch (method) {
    case 'GET':
      if (action === 'products') {
        const { category, featured } = Object.fromEntries(queryParams);
        let query = {};
        if (category) query.category = category;
        if (featured) query.featured = featured === 'true';

        const products = await Product.find(query)
          .skip((queryParams.get('page') - 1) * limit)
          .limit(parseInt(queryParams.get('limit')) || 10)
          .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            products,
            pagination: {
              current: parseInt(queryParams.get('page')) || 1,
              pages: Math.ceil(total / (parseInt(queryParams.get('limit')) || 10)),
              total
            }
          }),
        };
      }
      break;

    case 'POST':
      if (action === 'products' && user) {
        const productData = JSON.parse(body);
        const product = new Product(productData);
        await product.save();

        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify({ success: true, product }),
        };
      }
      break;
  }

  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Not found' }),
  };
};

// Orders handler
const handleOrders = async (method, action, id, body, queryParams, user) => {
  switch (method) {
    case 'GET':
      if (action === 'orders') {
        const orders = await Order.find()
          .populate('items.product')
          .sort({ orderDate: -1 });

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ orders }),
        };
      }
      break;

    case 'POST':
      if (action === 'orders') {
        const orderData = JSON.parse(body);
        const order = new Order(orderData);
        await order.save();

        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify({ success: true, order }),
        };
      }
      break;
  }

  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Not found' }),
  };
};

// Users handler
const handleUsers = async (method, action, id, body, queryParams, user) => {
  switch (method) {
    case 'GET':
      if (action === 'users') {
        const users = await User.find().select('-password');
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(users),
        };
      }
      if (action === 'profile' && user) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ user }),
        };
      }
      break;

    case 'POST':
      if (action === 'login') {
        const { email, password } = JSON.parse(body);
        const user = await User.findOne({ email });
        
        if (user && await user.matchPassword(password)) {
          const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              token
            }),
          };
        } else {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid credentials' }),
          };
        }
      }
      break;
  }

  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Not found' }),
  };
};

// Shopkeeper Orders handler
const handleShopkeeperOrders = async (method, action, id, body, queryParams, user) => {
  switch (method) {
    case 'GET':
      if (action === 'shopkeeper-orders') {
        let query = {};
        if (user?.role === 'shopkeeper') {
          query.shopkeeper = user._id;
        }

        const orders = await ShopkeeperOrder.find(query)
          .populate('shopkeeper', 'name email phone')
          .populate('salesman', 'name email phone')
          .populate('items.product', 'name category imageURL price')
          .sort({ orderDate: -1 });

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ orders }),
        };
      }
      break;

    case 'POST':
      if (action === 'shopkeeper-orders' && user?.role === 'shopkeeper') {
        const orderData = JSON.parse(body);
        orderData.shopkeeper = user._id;
        
        const order = new ShopkeeperOrder(orderData);
        await order.save();

        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify({ success: true, order }),
        };
      }
      break;
  }

  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Not found' }),
  };
};

// Admin handler
const handleAdmin = async (method, action, id, body, queryParams, user) => {
  switch (method) {
    case 'GET':
      if (action === 'profile' && user) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ admin: user }),
        };
      }
      break;

    case 'POST':
      if (action === 'login') {
        const { email, password } = JSON.parse(body);
        const user = await User.findOne({ email });
        
        if (user && await user.matchPassword(password)) {
          const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              token,
              admin: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            }),
          };
        } else {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid credentials' }),
          };
        }
      }
      break;
  }

  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Not found' }),
  };
};
