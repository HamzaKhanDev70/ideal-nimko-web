import mongoose from 'mongoose';
import Order from '../../api/models/Order.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ideal-nimko';

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

    const { httpMethod, body } = event;

    if (httpMethod === 'GET') {
      const orders = await Order.find()
        .populate('items.product')
        .sort({ orderDate: -1 });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ orders }),
      };
    }

    if (httpMethod === 'POST') {
      const orderData = JSON.parse(body);
      const order = new Order(orderData);
      await order.save();

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, order }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
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
