const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// Get checkout page
router.get('/', checkoutController.getCheckout);

// Process shipping information
router.post('/shipping', checkoutController.processShipping);

// Process payment and create order
router.post('/payment', checkoutController.processPayment);

module.exports = router; 