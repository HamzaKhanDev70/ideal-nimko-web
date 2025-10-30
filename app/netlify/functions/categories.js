import mongoose from 'mongoose';
import Category from '../../api/models/Category.js';
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
    const categoryId = pathSegments[pathSegments.length - 2];

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

    // GET /categories - Get all categories
    if (httpMethod === 'GET' && action === 'categories') {
      const categories = await Category.find().sort({ order: 1, name: 1 });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ categories }),
      };
    }

    // GET /categories/all - Get all categories for admin
    if (httpMethod === 'GET' && action === 'all') {
      const categories = await Category.find().sort({ order: 1, name: 1 });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ categories }),
      };
    }

    // POST /categories - Create new category
    if (httpMethod === 'POST' && action === 'categories') {
      const { name, description, isActive = true } = JSON.parse(body);
      
      if (!name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Category name is required' }),
        };
      }

      // Check if category already exists
      const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existingCategory) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Category with this name already exists' }),
        };
      }

      // Get the next order number
      const lastCategory = await Category.findOne().sort({ order: -1 });
      const order = lastCategory ? lastCategory.order + 1 : 1;

      const category = new Category({
        name,
        description,
        isActive,
        order,
        createdBy: user._id
      });

      await category.save();

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          message: 'Category created successfully',
          category 
        }),
      };
    }

    // PUT /categories/:id - Update category
    if (httpMethod === 'PUT' && categoryId) {
      const { name, description, isActive } = JSON.parse(body);
      
      const category = await Category.findById(categoryId);
      if (!category) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Category not found' }),
        };
      }

      // Check if name is being changed and if new name already exists
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          _id: { $ne: categoryId }
        });
        if (existingCategory) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Category with this name already exists' }),
          };
        }
      }

      category.name = name || category.name;
      category.description = description !== undefined ? description : category.description;
      category.isActive = isActive !== undefined ? isActive : category.isActive;
      category.updatedBy = user._id;

      await category.save();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Category updated successfully',
          category 
        }),
      };
    }

    // DELETE /categories/:id - Delete category
    if (httpMethod === 'DELETE' && categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Category not found' }),
        };
      }

      await Category.findByIdAndDelete(categoryId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Category deleted successfully' }),
      };
    }

    // PUT /categories/:id/toggle - Toggle category status
    if (httpMethod === 'PUT' && action === 'toggle' && categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Category not found' }),
        };
      }

      category.isActive = !category.isActive;
      category.updatedBy = user._id;
      await category.save();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Category status updated successfully',
          category 
        }),
      };
    }

    // POST /categories/reorder - Reorder categories
    if (httpMethod === 'POST' && action === 'reorder') {
      const { categoryIds } = JSON.parse(body);
      
      if (!Array.isArray(categoryIds)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'categoryIds must be an array' }),
        };
      }

      // Update order for each category
      for (let i = 0; i < categoryIds.length; i++) {
        await Category.findByIdAndUpdate(categoryIds[i], { order: i + 1 });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Categories reordered successfully' }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };

  } catch (error) {
    console.error('Categories function error:', error);
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
