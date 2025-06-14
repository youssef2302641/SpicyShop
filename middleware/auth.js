const User = require('../models/User');

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.status(403).render('pages/error', {
        title: 'Access Denied',
        message: 'Access denied. Admin privileges required.',
        user: req.user || null,
        error: null
    });
};

// Check if user is not authenticated (for login/register pages)
const isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isNotAuthenticated
}; 