const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const sampleProducts = [
  {
    name: "Red Hoodie",
    description: "Comfortable red hoodie with modern design",
    price: 180.85,
    images: ["images/red.png"],
    category: "Hoodies",
    brand: "Spicy",
    sizes: ["Small", "Medium", "Large", "XLarge"],
    stock: 50,
    isNew: true
  },
  {
    name: "Red/White Hoodie",
    description: "Classic red and white hoodie",
    price: 190.85,
    images: ["images/R.jpeg"],
    category: "Hoodies",
    brand: "Spicy",
    sizes: ["Small", "Medium", "Large", "XLarge"],
    stock: 30,
    isNew: false
  },
  {
    name: "Yellow Hoodie",
    description: "Lightweight yellow hoodie for everyday wear",
    price: 160.85,
    images: ["images/yellow.png"],
    category: "Hoodies",
    brand: "Spicy",
    sizes: ["Small", "Medium", "Large", "XLarge"],
    stock: 40,
    isNew: true
  }
];

const sampleAdmin = {
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
  role: "admin"
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://youssef230:youssef123456@cluster0.hei74jr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Add sample products
    await Product.insertMany(sampleProducts);
    console.log('Added sample products');

    // Add admin user
    const admin = new User(sampleAdmin);
    await admin.save();
    console.log('Added admin user');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 
