import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Category from '../models/Category';
import Listing from '../models/Listing';
import Auction from '../models/Auction';

// Load environment variables
dotenv.config();

// Connect to MongoDB
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
    
    // Create sample listings
    const sampleListings = [
      {
        title: 'Vintage Leather Sofa',
        description: 'Beautiful vintage leather sofa in excellent condition',
        price: 350,
        location: 'San Francisco, CA',
        imageUrls: ['/uploads/sofa.jpg'],
        category: createdCategories[1]._id, // Furniture
        user: createdUsers[1]._id, // John Doe
      },
      {
        title: 'iPhone 13 Pro',
        description: 'Like new iPhone 13 Pro, 256GB, Pacific Blue',
        price: 799,
        location: 'New York, NY',
        imageUrls: ['/uploads/iphone.jpg'],
        category: createdCategories[0]._id, // Electronics
        user: createdUsers[2]._id, // Jane Smith
      },
      {
        title: 'Mountain Bike',
        description: 'Trek mountain bike, medium frame, great condition',
        price: 450,
        location: 'Denver, CO',
        imageUrls: ['/uploads/bike.jpg'],
        category: createdCategories[3]._id, // Sports
        user: createdUsers[1]._id, // John Doe
      }
    ];
    
    const createdListings = await Listing.insertMany(sampleListings);
    console.log('Listings created');
    
    // Create sample auctions
    const sampleAuctions = [
      {
        title: 'Vintage Native American Ring',
        description: 'Beautiful handcrafted Native American ring with turquoise stone',
        imageUrls: ['/uploads/ring.jpg'],
        startingBid: 5,
        currentBid: 9,
        numberOfBids: 8,
        status: 'ACCEPTING_BID',
        discount: 0,
        category: createdCategories[6]._id, // Other
        user: createdUsers[1]._id, // John Doe
      },
      {
        title: 'Louis Vuitton Handbag',
        description: 'Authentic Louis Vuitton handbag, gently used',
        imageUrls: ['/uploads/handbag.jpg'],
        startingBid: 20,
        currentBid: 32,
        numberOfBids: 25,
        status: 'ACCEPTING_BID',
        discount: 96,
        category: createdCategories[2]._id, // Clothing
        user: createdUsers[2]._id, // Jane Smith
      }
    ];
    
    await Auction.insertMany(sampleAuctions);
    console.log('Auctions created');
    
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