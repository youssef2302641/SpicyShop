const Product = require('../models/Product');

const shopController = {


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
