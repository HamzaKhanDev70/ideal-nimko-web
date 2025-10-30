import mongoose from 'mongoose';
import User from '../../../api/models/User.js';
import Admin from '../../../api/models/Admin.js';
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

    const { httpMethod, body, headers: requestHeaders } = event;
    const pathSegments = event.path.split('/').filter(Boolean);
    const action = pathSegments[pathSegments.length - 1];

    // Handle GET /api/users - list all users (catch-all for root path)
    if (httpMethod === 'GET' && (action === 'users' || action === 'users.js' || pathSegments.length === 0)) {
      const users = await User.find().select('-password');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users),
      };
    }

    if (httpMethod === 'GET' && action === 'profile') {
      const authHeader = requestHeaders.authorization;
      if (!authHeader) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'No authorization header' }),
        };
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check both User and Admin models
      let user = await User.findById(decoded.id).select('-password');
      if (!user) {
        const admin = await Admin.findById(decoded.id);
        if (admin) {
          user = {
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role === 'super_admin' ? 'superadmin' : admin.role
          };
        }
      }

      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'User not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ user }),
      };
    }

    if (httpMethod === 'POST' && action === 'login') {
      const { email, password } = JSON.parse(body);
      
      // Try User model first
      let user = await User.findOne({ email });
      if (user && await user.matchPassword(password)) {
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
          }),
        };
      }
      
      // Try Admin model if User login failed
      const admin = await Admin.findOne({ email });
      if (admin && await admin.matchPassword(password)) {
        const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role === 'super_admin' ? 'superadmin' : admin.role,
            token
          }),
        };
      }
      
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
