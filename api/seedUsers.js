import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ideal-nimko");
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const superAdminExists = await User.findOne({ role: 'superadmin' });

    if (superAdminExists) {
      console.log('Super admin already exists. Skipping user seeding.');
      return;
    }

    // Create super admin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@idealnimko.com',
      password: 'superadmin123',
      role: 'superadmin',
      phone: '+91-9876543210',
      address: 'Ideal Nimko Ltd., Mumbai, India',
      territory: 'All India',
      commissionRate: 0
    });

    await superAdmin.save();
    console.log('Super Admin created successfully!');
    console.log('Email: superadmin@idealnimko.com');
    console.log('Password: superadmin123');

    // Create sample admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@idealnimko.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91-9876543211',
      address: 'Ideal Nimko Ltd., Mumbai, India',
      territory: 'Mumbai',
      commissionRate: 0,
      assignedBy: superAdmin._id
    });

    await admin.save();
    console.log('Admin User created successfully!');
    console.log('Email: admin@idealnimko.com');
    console.log('Password: admin123');

    // Create sample salesmen
    const salesmen = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@idealnimko.com',
        password: 'salesman123',
        role: 'salesman',
        phone: '+91-9876543212',
        address: 'Mumbai, Maharashtra',
        territory: 'Mumbai West',
        commissionRate: 5,
        assignedBy: admin._id
      },
      {
        name: 'Priya Sharma',
        email: 'priya@idealnimko.com',
        password: 'salesman123',
        role: 'salesman',
        phone: '+91-9876543213',
        address: 'Delhi, India',
        territory: 'Delhi North',
        commissionRate: 5,
        assignedBy: admin._id
      }
    ];

    for (const salesmanData of salesmen) {
      const salesman = new User(salesmanData);
      await salesman.save();
      console.log(`Salesman ${salesmanData.name} created successfully!`);
    }

    // Create sample shopkeepers
    const shopkeepers = [
      {
        name: 'Amit Patel',
        email: 'amit@shopkeeper.com',
        password: 'shopkeeper123',
        role: 'shopkeeper',
        phone: '+91-9876543214',
        address: 'Andheri, Mumbai',
        territory: 'Mumbai West',
        assignedSalesman: (await User.findOne({ email: 'rajesh@idealnimko.com' }))._id
      },
      {
        name: 'Sunita Singh',
        email: 'sunita@shopkeeper.com',
        password: 'shopkeeper123',
        role: 'shopkeeper',
        phone: '+91-9876543215',
        address: 'Karol Bagh, Delhi',
        territory: 'Delhi North',
        assignedSalesman: (await User.findOne({ email: 'priya@idealnimko.com' }))._id
      }
    ];

    for (const shopkeeperData of shopkeepers) {
      const shopkeeper = new User(shopkeeperData);
      await shopkeeper.save();
      console.log(`Shopkeeper ${shopkeeperData.name} created successfully!`);
    }

    console.log('\nAll users created successfully!');
    console.log('\nLogin Credentials:');
    console.log('Super Admin: superadmin@idealnimko.com / superadmin123');
    console.log('Admin: admin@idealnimko.com / admin123');
    console.log('Salesman: rajesh@idealnimko.com / salesman123');
    console.log('Salesman: priya@idealnimko.com / salesman123');
    console.log('Shopkeeper: amit@shopkeeper.com / shopkeeper123');
    console.log('Shopkeeper: sunita@shopkeeper.com / shopkeeper123');

  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

seedUsers();
