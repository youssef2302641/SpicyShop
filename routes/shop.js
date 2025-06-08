const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

// Shop routes
router.get('/', shopController.getHome);
router.get('/shop', shopController.getShop);
router.get('/about', shopController.getAbout);
router.get('/contact', shopController.getContact);
router.get('/cart', shopController.getCart);

module.exports = router; 