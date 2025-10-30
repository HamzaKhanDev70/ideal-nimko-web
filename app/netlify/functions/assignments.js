import mongoose from 'mongoose';
import Assignment from '../../api/models/Assignment.js';
import User from '../../api/models/User.js';
import Admin from '../../api/models/Admin.js';
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
    const assignmentId = pathSegments[pathSegments.length - 2];

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

    // GET /assignments - Get all assignments
    if (httpMethod === 'GET' && action === 'assignments') {
      const assignments = await Assignment.find()
        .populate('salesman', 'name email')
        .populate('shopkeeper', 'name email')
        .sort({ createdAt: -1 });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ assignments }),
      };
    }

    // GET /assignments/salesman/:salesmanId - Get assignments by salesman
    if (httpMethod === 'GET' && pathSegments[pathSegments.length - 2] === 'salesman') {
      const salesmanId = pathSegments[pathSegments.length - 1];
      const assignments = await Assignment.find({ salesman: salesmanId })
        .populate('shopkeeper', 'name email')
        .sort({ createdAt: -1 });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ assignments }),
      };
    }

    // GET /assignments/salesman/:salesmanId/shopkeepers - Get shopkeepers by salesman
    if (httpMethod === 'GET' && action === 'shopkeepers' && pathSegments[pathSegments.length - 3] === 'salesman') {
      const salesmanId = pathSegments[pathSegments.length - 2];
      const assignments = await Assignment.find({ salesman: salesmanId })
        .populate('shopkeeper', 'name email phone address pendingAmount creditLimit');
      
      const shopkeepers = assignments.map(assignment => assignment.shopkeeper);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ shopkeepers }),
      };
    }

    // POST /assignments - Create new assignment
    if (httpMethod === 'POST' && action === 'assignments') {
      const { salesmanId, shopkeeperId } = JSON.parse(body);
      
      if (!salesmanId || !shopkeeperId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Salesman ID and Shopkeeper ID are required' }),
        };
      }

      // Check if assignment already exists
      const existingAssignment = await Assignment.findOne({ 
        salesman: salesmanId, 
        shopkeeper: shopkeeperId 
      });
      
      if (existingAssignment) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Assignment already exists' }),
        };
      }

      const assignment = new Assignment({
        salesman: salesmanId,
        shopkeeper: shopkeeperId,
        assignedBy: user._id
      });

      await assignment.save();

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          message: 'Assignment created successfully',
          assignment 
        }),
      };
    }

    // DELETE /assignments/:id - Delete assignment
    if (httpMethod === 'DELETE' && assignmentId) {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Assignment not found' }),
        };
      }

      await Assignment.findByIdAndDelete(assignmentId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Assignment deleted successfully' }),
      };
    }

    // GET /assignments/available/salesmen - Get available salesmen
    if (httpMethod === 'GET' && action === 'salesmen' && pathSegments[pathSegments.length - 2] === 'available') {
      const salesmen = await User.find({ role: 'salesman' }).select('name email');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ salesmen }),
      };
    }

    // GET /assignments/available/shopkeepers - Get available shopkeepers
    if (httpMethod === 'GET' && action === 'shopkeepers' && pathSegments[pathSegments.length - 2] === 'available') {
      const shopkeepers = await User.find({ role: 'shopkeeper' }).select('name email phone address pendingAmount creditLimit');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ shopkeepers }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };

  } catch (error) {
    console.error('Assignments function error:', error);
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
