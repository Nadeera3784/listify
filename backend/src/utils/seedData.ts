import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Category from '../models/Category';
import Listing from '../models/Listing';
import Auction from '../models/Auction';

dotenv.config();


const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/listify');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Sample categories
const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Furniture', slug: 'furniture' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Vehicles', slug: 'vehicles' },
  { name: 'Toys', slug: 'toys' },
  { name: 'Other', slug: 'other' }
];

// Sample users
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    isAdmin: false
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    isAdmin: false
  }
];

// Import data
const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Listing.deleteMany({});
    await Auction.deleteMany({});
    
    console.log('Data cleared');
    
    // Create users
    const createdUsers = await User.insertMany(users);
    console.log('Users created');
    
    const adminUser = createdUsers[0]._id;
    
    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created');
    
    console.log('Data import complete!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    process.exit(1);
  }
};

// Delete data
const destroyData = async () => {
  try {
    await connectDB();
    
    await User.deleteMany({});
    await Category.deleteMany({});
    await Listing.deleteMany({});
    await Auction.deleteMany({});
    
    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`);
    process.exit(1);
  }
};

// Run script with argument -d to destroy data, otherwise import data
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 