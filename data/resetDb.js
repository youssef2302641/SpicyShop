require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function resetDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            sslValidate: true,
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('Connected to MongoDB');

        // Delete all existing products
        await Product.deleteMany({});
        console.log('Deleted all existing products');

        // Initialize with new products
        const sampleProducts = [
            {
                name: 'Red Hoodie',
                price: 180.85,
                image: '/images/red.png',
                category: 'drop 1',
                brand: 'drop1',
                isNew: true,
                stock: 10,
                description: 'Stylish red hoodie for everyday wear'
            },
            {
                name: 'Red/White Hoodie',
                price: 190.85,
                image: '/images/R.jpeg',
                category: 'drop 1',
                brand: 'drop1',
                stock: 15,
                description: 'Classic red and white hoodie design'
            },
            {
                name: 'Yellow Hoodie',
                price: 160.85,
                image: '/images/yellow.png',
                category: 'drop 1',
                brand: 'drop1',
                isNew: true,
                stock: 20,
                description: 'Bright yellow hoodie for a bold look'
            },
            {
                name: 'Black Hoodie',
                price: 170.85,
                image: '/images/black.png',
                category: 'drop 2',
                brand: 'drop2',
                stock: 25,
                description: 'Classic black hoodie for a sleek look'
            },
            {
                name: 'White Hoodie',
                price: 165.85,
                image: '/images/white.png',
                category: 'drop 2',
                brand: 'drop2',
                isNew: true,
                stock: 18,
                description: 'Clean white hoodie for a fresh style'
            },
            {
                name: 'Blue Hoodie',
                price: 175.85,
                image: '/images/blue.png',
                category: 'drop 3',
                brand: 'drop3',
                stock: 22,
                description: 'Cool blue hoodie for a casual look'
            },
            {
                name: 'Green Hoodie',
                price: 168.85,
                image: '/images/green.png',
                category: 'drop 3',
                brand: 'drop3',
                isNew: true,
                stock: 15,
                description: 'Fresh green hoodie for a natural style'
            },
            {
                name: 'Purple Hoodie',
                price: 172.85,
                image: '/images/purple.png',
                category: 'drop 3',
                brand: 'drop3',
                stock: 20,
                description: 'Royal purple hoodie for a unique look'
            }
        ];

        await Product.insertMany(sampleProducts);
        console.log('Added new sample products');

        // Close the connection
        await mongoose.connection.close();
        console.log('Database reset complete');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase(); 