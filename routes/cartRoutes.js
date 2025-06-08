const express = require('express');
const router = express.Router();

// Get cart page
router.get('/', (req, res) => {
    console.log('Session cart:', req.session.cart); // Debug log
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.render('cart', {
        title: 'Shopping Cart',
        cart,
        total
    });
});

// Add item to cart
router.post('/add', (req, res) => {
    console.log('Adding to cart:', req.body); // Debug log
    const { productId, name, price, quantity = 1 } = req.body;
    
    // Initialize cart if it doesn't exist
    if (!req.session.cart) {
        req.session.cart = [];
    }
    
    const cart = req.session.cart;
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += parseInt(quantity);
    } else {
        cart.push({
            productId,
            name,
            price: parseFloat(price),
            quantity: parseInt(quantity)
        });
    }

    console.log('Updated cart:', cart); // Debug log
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, error: 'Failed to save cart' });
        }
        res.json({ success: true, cart });
    });
});

// Update cart item quantity
router.post('/update', (req, res) => {
    console.log('Updating cart:', req.body); // Debug log
    const { productId, quantity } = req.body;
    
    if (!req.session.cart) {
        return res.json({ success: false, message: 'Cart is empty' });
    }
    
    const cart = req.session.cart;
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        item.quantity = parseInt(quantity);
    }

    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, error: 'Failed to save cart' });
        }
        res.json({ success: true, cart });
    });
});

// Remove item from cart
router.post('/remove', (req, res) => {
    console.log('Removing from cart:', req.body); // Debug log
    const { productId } = req.body;
    
    if (!req.session.cart) {
        return res.json({ success: false, message: 'Cart is empty' });
    }
    
    const updatedCart = req.session.cart.filter(item => item.productId !== productId);
    req.session.cart = updatedCart;

    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, error: 'Failed to save cart' });
        }
        res.json({ success: true, cart: updatedCart });
    });
});

// Clear cart
router.post('/clear', (req, res) => {
    req.session.cart = [];
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, error: 'Failed to clear cart' });
        }
        res.json({ success: true, cart: [] });
    });
});

module.exports = router; 