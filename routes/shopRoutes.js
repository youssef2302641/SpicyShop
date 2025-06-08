const express = require('express');
const router = express.Router();

// Static product data as fallback
const staticProducts = [
    {
        _id: '1',
        name: 'Red Hoodie',
        price: 180.85,
        image: '/images/red.png',
        category: 'drop 1',
        brand: 'drop1',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 10,
        isNew: true
    },
    {
        _id: '2',
        name: 'Red/White Hoodie',
        price: 190.85,
        image: '/images/R.jpeg',
        category: 'drop 1',
        brand: 'drop1',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 15
    },
    {
        _id: '3',
        name: 'Yellow Hoodie',
        price: 160.85,
        image: '/images/yellow.png',
        category: 'drop 1',
        brand: 'drop1',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 20,
        isNew: true
    },
    {
        _id: '4',
        name: 'Adidas Ultra Boost Red',
        price: 130.00,
        image: '/images/red.png',
        category: 'drop 2',
        brand: 'drop2',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 15,
        isNew: true
    },
    {
        _id: '5',
        name: 'Adidas Ultra Boost Black',
        price: 130.00,
        image: '/images/R.jpeg',
        category: 'drop 2',
        brand:'Spicy',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 15
    },
    {
        _id: '6',
        name: 'Adidas Ultra Boost White',
        price: 130.00,
        image: '/images/white.png',
        category: 'drop 2',
        brand: 'Spicy',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 15,
        isNew: true
    },
    {
        _id: '7',
        name: 'Adidas Ultra Boost Pink',
        price: 130.00,
        image: '/images/pink.png',
        category: 'drop 2',
        brand: 'Spicy',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 15
    },
    {
        _id: '8',
        name: 'Adidas Ultra Boost Blue',
        price: 130.00,
        image: '/images/Screenshot 2025-05-02 165834.png',
        category: 'drop 2',
        brand: 'Spicy',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 15,
        isNew: true
    },
    {
        _id: '9',
        name: 'special Hoodie',
        price: 130.00,
        image: '/images/Screenshot 2025-05-02 165916.png',
        category: 'drop 3',
        brand: 'drop3',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 15
    }
];

// Shop page
router.get('/', async (req, res) => {
    try {
        // Try to use Product model if available
        let products;
        try {
            const Product = require('../models/Product');
            products = await Product.find();
        } catch (error) {
            console.log('Using static product data');
            products = staticProducts;
        }

        res.render('shop', {
            title: 'Shop',
            products: products,
            user: req.user || null,
            currentPage: 1,
            totalPages: 1
        });
    } catch (error) {
        console.error('Error in shop route:', error);
        res.render('shop', {
            title: 'Shop',
            products: staticProducts,
            user: req.user || null,
            currentPage: 1,
            totalPages: 1
        });
    }
});

// Product details page
router.get('/product/:id', async (req, res) => {
    try {
        let product;
        try {
            const Product = require('../models/Product');
            product = await Product.findById(req.params.id);
        } catch (error) {
            product = staticProducts.find(p => p._id === req.params.id);
        }

        res.render('product-details', {
            title: product ? product.name : 'Product Details',
            product: product,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error in product details route:', error);
        res.render('product-details', {
            title: 'Product Details',
            product: null,
            user: req.user || null
        });
    }
});

module.exports = router; 