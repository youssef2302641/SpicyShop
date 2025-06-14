const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Contact = require('../models/Contact');

// Static products for the homepage
const homepageProducts = [
    {
        _id: 'red-1',
        name: 'Red Hoodie',
        price: 180.85,
        image: '/images/red.png',
        category: 'drop 1',
        brand: 'drop1',
        isNew: true,
        categories: ['Men', 'Women']
    },
    {
        _id: 'black-1',
        name: 'Red/White Hoodie',
        price: 190.85,
        image: '/images/R.jpeg',
        category: 'drop 1',
        brand: 'drop1',
        categories: ['Men', 'Sports']
    },
    {
        _id: 'yellow-1',
        name: 'Yellow Hoodie',
        price: 160.85,
        image: '/images/yellow.png',
        category: 'drop 1',
        brand: 'drop1',
        isNew: true,
        categories: ['Men', 'Women']
    },
    {
        _id: 'Black-1',
        name: 'Black Hoodie',
        price: 170.85,
        image: '/images/black.png',
        category: 'drop 1',
        brand: 'drop1',
        discount: 25,
        originalPrice: 200.21,
        categories: ['Men', 'Sports']
    },
    {
        _id: 'pink-1',
        name: 'Pink Hoodie',
        price: 120.85,
        image: '/images/pink.png',
        category: 'drop 1',
        brand: 'drop1',
        isNew: true,
        categories: ['Men', 'Women']
    },
    {
        _id: 'white-1',
        name: 'White Hoodie',
        price: 100.85,
        image: '/images/white.png',
        category: 'drop 1',
        brand: 'drop1',
        categories: ['Men', 'Women']
    }
];

// Home page
router.get('/', async (req, res) => {
    try {
        // Try to use Product model if available
        let products;
        try {
            products = await Product.find().limit(10);
            // If no products in database, use static products
            if (!products || products.length === 0) {
                products = homepageProducts;
            }
        } catch (error) {
            console.log('Using static product data');
            products = homepageProducts;
        }

        res.render('pages/index', {
            title: 'Home',
            user: req.user || null,
            products: products,
            currentPage: 1,
            totalPages: 1
        });
    } catch (error) {
        console.error('Error in home route:', error);
        // Fallback to static products
        res.render('pages/index', {
            title: 'Home',
            user: req.user || null,
            products: homepageProducts,
            currentPage: 1,
            totalPages: 1
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('pages/about', {
        title: 'About Us',
        user: req.user || null
    });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Contact Us',
        user: req.user || null
    });
});

// Handle contact form submission
router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Create new contact message
        const contactMessage = new Contact({
            name,
            email,
            subject,
            message,
            status: 'unread'
        });

        // Save the message
        await contactMessage.save();

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });
    } catch (error) {
        console.error('Error in contact form submission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

module.exports = router; 