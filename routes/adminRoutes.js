const express = require('express');
const router = express.Router();

// Admin dashboard
router.get('/', (req, res) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        user: req.user
    });
});

// Product management
router.get('/products', (req, res) => {
    res.render('admin/products', {
        title: 'Manage Products',
        user: req.user
    });
});

// Order management
router.get('/orders', (req, res) => {
    res.render('admin/orders', {
        title: 'Manage Orders',
        user: req.user
    });
});

module.exports = router; 