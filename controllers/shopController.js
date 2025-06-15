const Product = require('../models/Product');

const shopController = {
    // Home page
    getHome: async (req, res) => {
       try {
           const featuredProducts = await Product.find()
               .sort('-createdAt')  
               .limit(9);          
           res.render('pages/index', { 
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
            res.render('pages/shop', { 
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
        res.render('pages/about', { 
            title: 'Spicy - About Us' 
        });
    },

    // Contact page
    getContact: (req, res) => {
        res.render('pages/contact', { 
            title: 'Spicy - Contact Us' 
        });
    },

    // Cart page
    getCart: (req, res) => {
        const cart = req.session.cart || [];
        res.render('pages/cart', { 
            title: 'Spicy - Shopping Cart',
            cart 
        });
    }
};

module.exports = shopController; 
