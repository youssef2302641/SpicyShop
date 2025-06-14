const express = require('express');
const router = express.Router();

// Get cart page
router.get('/', (req, res) => {
    console.log('GET /cart - Session:', req.session); // Debug log
    console.log('Session cart:', req.session.cart); // Debug log
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.render('pages/cart', {
        title: 'Shopping Cart',
        cart,
        total
    });
});

// Add item to cart
router.post('/add', (req, res) => {
    console.log('POST /cart/add - Request body:', req.body); // Debug log
    console.log('Session before update:', req.session); // Debug log
    
    const { productId, name, price, quantity = 1, size } = req.body;
    
    if (!size) {
        console.log('Size missing in request'); // Debug log
        return res.status(400).json({ success: false, error: 'Size is required' });
    }
    
    // Initialize cart if it doesn't exist
    if (!req.session.cart) {
        console.log('Initializing new cart'); // Debug log
        req.session.cart = [];
    }
    
    const cart = req.session.cart;
    console.log('Current cart:', cart); // Debug log
    
    // Check if item already exists in cart with the same size
    const existingItem = cart.find(item => 
        item.productId === productId && item.size === size
    );

    if (existingItem) {
        console.log('Updating existing item quantity'); // Debug log
        existingItem.quantity += parseInt(quantity);
    } else {
        console.log('Adding new item to cart'); // Debug log
        cart.push({
            productId,
            name,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            size
        });
    }

    console.log('Updated cart:', cart); // Debug log
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, error: 'Failed to save cart' });
        }
        console.log('Session saved successfully'); // Debug log
        console.log('Final session state:', req.session); // Debug log
        res.json({ success: true, cart });
    });
});

// Update cart item quantity
router.post('/update', (req, res) => {
    console.log('POST /cart/update - Request body:', req.body); // Debug log
    const { productId, quantity, size } = req.body;
    
    if (!req.session.cart) {
        console.log('Cart is empty'); // Debug log
        return res.json({ success: false, message: 'Cart is empty' });
    }
    
    const cart = req.session.cart;
    const item = cart.find(item => 
        item.productId === productId && item.size === size
    );
    
    if (item) {
        console.log('Updating item quantity'); // Debug log
        item.quantity = parseInt(quantity);
    }

    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, error: 'Failed to save cart' });
        }
        console.log('Cart updated successfully'); // Debug log
        res.json({ success: true, cart });
    });
});

// Remove item from cart
router.post('/remove', (req, res) => {
    console.log('POST /cart/remove - Request body:', req.body); // Debug log
    const { productId, size } = req.body;
    
    if (!req.session.cart) {
        console.log('Cart is empty'); // Debug log
        return res.json({ success: false, message: 'Cart is empty' });
    }
    
    const updatedCart = req.session.cart.filter(item => 
        !(item.productId === productId && item.size === size)
    );
    req.session.cart = updatedCart;

    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, error: 'Failed to save cart' });
        }
        console.log('Item removed successfully'); // Debug log
        res.json({ success: true, cart: updatedCart });
    });
});

// Clear cart
router.post('/clear', (req, res) => {
    console.log('POST /cart/clear'); // Debug log
    req.session.cart = [];
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, error: 'Failed to clear cart' });
        }
        console.log('Cart cleared successfully'); // Debug log
        res.json({ success: true, cart: [] });
    });
});

module.exports = router; 