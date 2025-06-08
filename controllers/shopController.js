const Product = require('../models/Product');

const shopController = {
    // Home page
    getHome: async (req, res) => {
        try {
            const featuredProducts = await Product.find({ featured: true }).limit(4);
            res.render('index', { 
                title: 'Spicy - Home',
                featuredProducts 
            });
        } catch (error) {
            res.status(500).render('error', { 
                message: 'Error loading home page' 
            });
        }
    },

    // Shop page
    getShop: async (req, res) => {
        try {
            const products = await Product.find();
            res.render('shop', { 
                title: 'Spicy - Shop',
                products 
            });
        } catch (error) {
            res.status(500).render('error', { 
                message: 'Error loading shop page' 
            });
        }
    },

    // About page
    getAbout: (req, res) => {
        res.render('about', { 
            title: 'Spicy - About Us' 
        });
    },

    // Contact page
    getContact: (req, res) => {
        res.render('contact', { 
            title: 'Spicy - Contact Us' 
        });
    },

    // Cart page
    getCart: (req, res) => {
        const cart = req.session.cart || [];
        res.render('cart', { 
            title: 'Spicy - Shopping Cart',
            cart 
        });
    }
};

module.exports = shopController; 