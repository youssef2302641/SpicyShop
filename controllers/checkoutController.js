const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');
const Order = require('../models/Order');
const { sendOrderConfirmation } = require('../utils/email');

// Get checkout page
exports.getCheckout = async (req, res) => {
    try {
        res.render('checkout', {
            title: 'Checkout',
            user: req.user,
            stripePublicKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_dummy_key'
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).render('error', {
            message: 'Error loading checkout page'
        });
    }
};

// Process checkout
exports.processCheckout = async (req, res) => {
    try {
        const { paymentMethodId, shippingAddress } = req.body;

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.session.cart.total * 100, // Convert to cents
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true
        });

        // Create order
        const order = new Order({
            user: req.user._id,
            items: req.session.cart.items,
            total: req.session.cart.total,
            shippingAddress,
            paymentIntentId: paymentIntent.id
        });

        await order.save();

        // Send confirmation email
        await sendOrderConfirmation(req.user.email, order);

        // Clear cart
        req.session.cart = { items: [], total: 0 };

        res.redirect('/checkout/success');
    } catch (error) {
        console.error('Checkout processing error:', error);
        res.status(500).json({
            error: 'Error processing checkout'
        });
    }
};

// Get checkout success page
exports.getCheckoutSuccess = (req, res) => {
    res.render('checkout-success', {
        title: 'Order Confirmation',
        user: req.user
    });
}; 