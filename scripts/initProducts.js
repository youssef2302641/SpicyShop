const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
    {
        name: 'Red Hoodie',
        description: 'Classic red hoodie with premium quality material',
        price: 180.85,
        image: '/images/red.png',
        category: 'drop 1',
        brand: 'Spicy',
        sizes: ['Small', 'Medium', 'Large', 'XLarge'],
        stock: 10,
        isNew: true
    },
    {
        name: 'Red/White Hoodie',
        description: 'Stylish red and white hoodie perfect for any occasion',
        price: 190.85,
        image: '/images/R.jpeg',
        category: 'drop 1',
        brand: 'Spicy',
        sizes: ['Small', 'Medium', 'Large', 'XLarge'],
        stock: 15
    },
    {
        name: 'Yellow Hoodie',
        description: 'Bright yellow hoodie for a bold statement',
        price: 160.85,
        image: '/images/yellow.png',
        category: 'drop 1',
        brand: 'Spicy',
        sizes: ['Small', 'Medium', 'Large', 'XLarge'],
        stock: 20,
        isNew: true
    },
    {
        name: 'Black Hoodie',
        description: 'Elegant black hoodie with modern design',
        price: 170.85,
        image: '/images/black.png',
        category: 'drop 1',
        brand: 'Spicy',
        sizes: ['Small', 'Medium', 'Large', 'XLarge'],
        stock: 15,
        discount: 25,
        originalPrice: 200.21
    },
    {
        name: 'Pink Hoodie',
        description: 'Soft pink hoodie with comfortable fit',
        price: 120.85,
        image: '/images/pink.png',
        category: 'drop 1',
        brand: 'Spicy',
        sizes: ['Small', 'Medium', 'Large', 'XLarge'],
        stock: 12,
        isNew: true
    },
    {
        name: 'White Hoodie',
        description: 'Clean white hoodie for a minimalist look',
        price: 100.85,
        image: '/images/white.png',
        category: 'drop 1',
        brand: 'Spicy',
        sizes: ['Small', 'Medium', 'Large', 'XLarge'],
        stock: 18
    },
    {
        name:  'Cyan/Red Hoodie',
        description: 'Soft Cyan/red hoodie',
        price: 130.00,
        image: '/images/Screenshot 2025-05-02 165834.png',
        category: 'drop 2',
        brand: 'Spicy',
        sizes: ['Small', 'Medium', 'Large', 'XLarge'],
        stock: 15,
        isNew: true
    },
    {
        name: 'Special Hoodie',
        description: 'Special hoodie for our special Users',
        price: 130.00,
        image: '/images/Screenshot 2025-05-02 165916.png',
        category: 'drop 3',
        brand: 'Spicy',
        sizes: ['Small', 'Medium', 'Large', 'XLarge'],
        stock: 15
    },
    {
        name: 'Offwhite Hoodie',
        description: 'Stylish Off-White hoodie for fashion enthusiasts',
        price: 120.85,
        image: '/images/t.png',
        category: 'drop 1',
        brand: 'Spicy',
        sizes: ['Small', 'Medium', 'Large', 'XLarge'],
        stock: 15,
        isNew: true
    }
];

async function initProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        const createdProducts = await Product.insertMany(products);
        console.log(`Successfully added ${createdProducts.length} products`);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error initializing products:', error);
        process.exit(1);
    }
}

initProducts(); 