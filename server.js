require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: true,
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
    // Initialize database with some products if empty
    initializeDatabase();
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Function to initialize database with products
async function initializeDatabase() {
    try {
        const Product = require('./models/Product');
        const count = await Product.countDocuments();
        
        if (count === 0) {
            console.log('Initializing database with sample products...');
            const sampleProducts = [
                {
                    _id: '1',
                    name: 'Red Hoodie',
                    price: 180.85,
                    image: '/images/red.png',
                    category: 'drop 1',
                    brand: 'drop1',
                    sizes: ['S', 'M', 'L', 'XL'],
                    stock: 10,
                    isNew: true
                },
                {
                    _id: '2',
                    name: 'Red/White Hoodie',
                    price: 190.85,
                    image: '/images/R.jpeg',
                    category: 'drop 1',
                    brand: 'drop1',
                    sizes: ['S', 'M', 'L', 'XL'],
                    stock: 15
                },
                {
                    _id: '3',
                    name: 'Yellow Hoodie',
                    price: 160.85,
                    image: '/images/yellow.png',
                    category: 'drop 1',
                    brand: 'drop1',
                    sizes: ['S', 'M', 'L', 'XL'],
                    stock: 20,
                    isNew: true
                },
                {
                    _id: '4',
                    name: 'Black Hoodie',
                    price: 130.00,
                    image: '/images/red.png',
                    category: 'drop 2',
                    brand: 'drop2',
                    sizes: ['S', 'M', 'L', 'XL'],
                    stock: 15,
                    isNew: true
                },
                {
                    _id: '5',
                    name: 'White Hoodie',
                    price: 130.00,
                    image: '/images/R.jpeg',
                    category: 'drop 2',
                    brand: 'Spicy',
                    sizes: ['S', 'M', 'L', 'XL'],
                    stock: 15
                },
                {
                    _id: '6',
                    name: 'OffWhite hoodie',
                    price: 130.00,
                    image: '/images/t.png',
                    category: 'drop 3',
                    brand: 'Spicy',
                    sizes: ['S', 'M', 'L', 'XL'],
                    stock: 15,
                    isNew: true
                },
                {
                    _id: '7',
                    name: 'Pink Hoodie',
                    price: 130.00,
                    image: '/images/pink.png',
                    category: 'drop 2',
                    brand: 'Spicy',
                    sizes: ['S', 'M', 'L', 'XL'],
                    stock: 15
                },
                {
                    _id: '9',
                    name: 'Special Hoodie',
                    price: 130.00,
                    image: '/images/Screenshot 2025-05-02 165916.png',
                    category: 'drop 3',
                    brand: 'drop3',
                    sizes: ['S', 'M', 'L', 'XL'],
                    stock: 15
                },
               
                
                
               
            ];

            await Product.insertMany(sampleProducts);
            console.log('Sample products added to database');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Handle application termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Mongoose connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during app termination:', err);
        process.exit(1);
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use layouts only for non-admin routes
app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        res.locals.layout = false;
    } else {
        res.locals.layout = 'layouts/main';
    }
    next();
});

app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

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

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    }
}));

// Add session debugging middleware
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.title = 'Spicy Shop'; // Default title
    next();
});

// Routes
app.use('/', require('./routes/indexRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/shop', require('./routes/shopRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/checkout', require('./routes/checkoutRoutes'));

// Mount admin routes with explicit path
app.use('/admin', require('./routes/adminRoutes'));

// Import routes
const contactRouter = require('./routes/contact');

// Use routes
app.use('/contact', contactRouter);

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    
    // If the request expects JSON, send JSON response
    if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong!',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    // Otherwise, render error page
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


