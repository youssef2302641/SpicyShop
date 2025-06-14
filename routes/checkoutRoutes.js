const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { isAuthenticated } = require('../middleware/auth');
const Order = require('../models/Order');

// Get checkout page
router.get('/', isAuthenticated, (req, res) => {
    res.render('pages/checkout', {
        title: 'Checkout',
        user: req.user || null
    });
});

// Process checkout
router.post('/process', isAuthenticated, async (req, res) => {
    try {
        console.log('Processing checkout request...');
        console.log('User:', req.user);
        console.log('Request body:', req.body);

        const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log('Invalid items:', items);
            return res.status(400).json({ error: 'Cart is empty or invalid' });
        }

        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
            console.log('Invalid shipping address:', shippingAddress);
            return res.status(400).json({ error: 'Please provide complete shipping information' });
        }

        if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
            console.log('Invalid total amount:', totalAmount);
            return res.status(400).json({ error: 'Invalid order total' });
        }

        // Create new order
        const order = new Order({
            user: req.user._id,
            items: items.map(item => ({
                product: {
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    size: item.size
                },
                quantity: item.quantity
            })),
            totalAmount,
            shippingAddress,
            paymentMethod: paymentMethod || 'card',
            status: 'pending',
            paymentStatus: 'pending'
        });

        console.log('Created order object:', order);

        // Save order to database
        const savedOrder = await order.save();
        console.log('Order saved successfully:', savedOrder._id);

        // Send confirmation email if transporter is available
        try {
            const transporter = req.app.locals.transporter;
            if (transporter) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: req.user.email,
                    subject: 'Order Confirmation - Spicy Shop',
                    html: `
                        <h1>Thank you for your order!</h1>
                        <p>Your order has been received and is being processed.</p>
                        <h2>Order Details:</h2>
                        <ul>
                            ${items.map(item => `
                                <li>${item.name} (${item.size}) - Quantity: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
                            `).join('')}
                        </ul>
                        <p>Total Amount: $${totalAmount.toFixed(2)}</p>
                        <p>Shipping Address:</p>
                        <p>
                            ${shippingAddress.street}<br>
                            ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                            ${shippingAddress.country}
                        </p>
                    `
                });
                console.log('Confirmation email sent successfully');
            }
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't fail the order if email fails
        }

        res.json({ 
            success: true, 
            orderId: savedOrder._id,
            message: 'Order processed successfully'
        });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ 
            error: 'Error processing order: ' + error.message,
            details: error.stack
        });
    }
});

// Get checkout success page
router.get('/success', isAuthenticated, (req, res) => {
    res.render('pages/checkout-success', {
        title: 'Order Confirmed',
        user: req.user || null
    });
});

// Checkout page
router.get('/checkout', (req, res) => {
    res.render('pages/checkout', {
        title: 'Checkout',
        user: req.user
    });
});

// Process payment
router.post('/payment', (req, res) => {
    // Payment processing logic will be implemented here
    res.json({ message: 'Payment processed' });
});

// Order confirmation
router.get('/checkout-success', (req, res) => {
    res.render('pages/checkout-success', {
        title: 'Order Confirmation',
        user: req.user
    });
});

module.exports = router; 