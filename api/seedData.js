import mongoose from "mongoose";
import Product from "./models/project.js";

const sampleProducts = [
  {
    name: "Classic Namkeen Mix",
    description: "A delightful blend of traditional Indian namkeen with peanuts, chana, and spices",
    category: "Namkeen",
    price: 120,
    imageURL: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    stock: 50,
    featured: true
  },
  {
    name: "Spicy Bhujia",
    description: "Crispy and spicy bhujia made with besan and aromatic spices",
    category: "Namkeen",
    price: 80,
    imageURL: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    stock: 75,
    featured: true
  },
  {
    name: "Sweet Mathri",
    description: "Traditional sweet mathri with a hint of cardamom and sugar",
    category: "Sweet Snacks",
    price: 100,
    imageURL: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
    stock: 60,
    featured: false
  },
  {
    name: "Masala Peanuts",
    description: "Roasted peanuts coated with tangy masala spices",
    category: "Nuts",
    price: 90,
    imageURL: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
    stock: 40,
    featured: true
  },
  {
    name: "Coconut Ladoo",
    description: "Soft and sweet coconut ladoos made with fresh coconut",
    category: "Sweet Snacks",
    price: 150,
    imageURL: "https://images.unsplash.com/photo-1578985545062-69928b1c9587?w=400",
    stock: 30,
    featured: false
  },
  {
    name: "Spicy Chana",
    description: "Roasted chana with a perfect blend of spices and herbs",
    category: "Namkeen",
    price: 70,
    imageURL: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    stock: 55,
    featured: false
  },
  {
    name: "Almond Brittle",
    description: "Crunchy almond brittle with caramelized sugar",
    category: "Sweet Snacks",
    price: 200,
    imageURL: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
    stock: 25,
    featured: true
  },
  {
    name: "Mixed Nuts",
    description: "Premium mix of cashews, almonds, and pistachios",
    category: "Nuts",
    price: 300,
    imageURL: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
    stock: 20,
    featured: true
  },
  {
    name: "Tamarind Candy",
    description: "Tangy tamarind candy with a sweet and sour taste",
    category: "Sweet Snacks",
    price: 60,
    imageURL: "https://images.unsplash.com/photo-1578985545062-69928b1c9587?w=400",
    stock: 80,
    featured: false
  },
  {
    name: "Sesame Chikki",
    description: "Traditional sesame chikki with jaggery",
    category: "Sweet Snacks",
    price: 110,
    imageURL: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
    stock: 45,
    featured: false
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ideal-nimko");
    console.log("Connected to MongoDB");
    
    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log("Inserted sample products");
    
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
