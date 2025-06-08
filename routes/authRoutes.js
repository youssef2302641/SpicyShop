const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isNotAuthenticated } = require('../middleware/auth');

// Login page
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login', {
        title: 'Login',
        error: req.query.error
    });
});

// Login process
router.post('/login', isNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login?error=Invalid email or password'
}));

// Register page
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register', {
        title: 'Register',
        error: req.query.error
    });
});

// Register process
router.post('/register', isNotAuthenticated, async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const User = require('../models/User');

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/auth/register?error=Email already registered');
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password
        });

        await user.save();

        // Log in the new user
        req.login(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return res.redirect('/auth/login?error=Registration successful, please login');
            }
            res.redirect('/');
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.redirect('/auth/register?error=Registration failed');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router; 