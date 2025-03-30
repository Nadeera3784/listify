import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Category from '../models/Category';
import Listing from '../models/Listing';
import Auction from '../models/Auction';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/listify';
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    isAdmin: false,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    isAdmin: false,
  },
];

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
  },
  {
    name: 'Clothing',
    slug: 'clothing',
  },
  {
    name: 'Vehicles',
    slug: 'vehicles',
  },
  {
    name: 'Collectibles',
    slug: 'collectibles',
  },
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Listing.deleteMany({});
    await Auction.deleteMany({});
    
    console.log('Database cleared');
    
    // Create users
    const createdUsers = [];
    for (const user of users) {
      // Create the user directly - let the User model handle the password hashing
      // in its pre-save middleware
      const newUser = await User.create({
        name: user.name,
        email: user.email,
        password: user.password,
        isAdmin: user.isAdmin,
      });
      
      createdUsers.push(newUser);
    }
    
    console.log(`Created ${createdUsers.length} users`);
    
    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);
        
    console.log('Database seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase(); 