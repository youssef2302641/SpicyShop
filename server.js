require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const expressLayouts = require('express-ejs-layouts');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Set up email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Make transporter available to all routes
app.locals.transporter = transporter;

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.title = 'Spicy Shop'; // Default title
    next();
});

// Passport configuration
require('./config/passport')(passport);

// Routes
app.use('/', require('./routes/indexRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/shop', require('./routes/shopRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/checkout', require('./routes/checkoutRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 


