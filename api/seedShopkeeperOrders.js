import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShopkeeperOrder from './models/ShopkeeperOrder.js';
import Product from './models/project.js';
import User from './models/User.js';

dotenv.config();

const seedShopkeeperOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ideal-nimko");
    console.log('Connected to MongoDB');

    // Clear existing orders
    await ShopkeeperOrder.deleteMany({});
    console.log('Existing shopkeeper orders cleared.');

    // Get users and products
    const shopkeepers = await User.find({ role: 'shopkeeper' });
    const salesmen = await User.find({ role: 'salesman' });
    const products = await Product.find();

    if (shopkeepers.length === 0 || salesmen.length === 0 || products.length === 0) {
      console.log('Please run seedUsers.js and seedData.js first to create users and products.');
      return;
    }

    // Create sample orders
    const sampleOrders = [
      {
        shopkeeper: shopkeepers[0]._id,
        salesman: salesmen[0]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 5,
            unitPrice: products[0].price,
            totalPrice: products[0].price * 5
          },
          {
            product: products[1]._id,
            quantity: 3,
            unitPrice: products[1].price,
            totalPrice: products[1].price * 3
          }
        ],
        totalAmount: (products[0].price * 5) + (products[1].price * 3),
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        deliveryAddress: '123 Main Street, Mumbai, Maharashtra 400001',
        notes: 'Please deliver in the morning',
        commission: ((products[0].price * 5) + (products[1].price * 3)) * 0.05
      },
      {
        shopkeeper: shopkeepers[1]._id,
        salesman: salesmen[0]._id,
        items: [
          {
            product: products[2]._id,
            quantity: 2,
            unitPrice: products[2].price,
            totalPrice: products[2].price * 2
          }
        ],
        totalAmount: products[2].price * 2,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'bank_transfer',
        deliveryAddress: '456 Park Avenue, Delhi, Delhi 110001',
        notes: 'Urgent delivery required',
        commission: (products[2].price * 2) * 0.05,
        confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        shopkeeper: shopkeepers[0]._id,
        salesman: salesmen[1]._id,
        items: [
          {
            product: products[3]._id,
            quantity: 10,
            unitPrice: products[3].price,
            totalPrice: products[3].price * 10
          }
        ],
        totalAmount: products[3].price * 10,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'upi',
        deliveryAddress: '789 Business District, Bangalore, Karnataka 560001',
        notes: 'Bulk order for festival season',
        commission: (products[3].price * 10) * 0.05,
        confirmedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    for (const orderData of sampleOrders) {
      const order = new ShopkeeperOrder(orderData);
      await order.save();
    }

    console.log('Shopkeeper orders seeded successfully!');
    console.log(`Created ${sampleOrders.length} sample orders`);

  } catch (error) {
    console.error('Error seeding shopkeeper orders:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

seedShopkeeperOrders();
