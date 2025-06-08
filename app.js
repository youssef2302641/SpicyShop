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
                    name: 'Red Hoodie',
                    price: 180.85,
                    image: '/images/red.png',
                    category: 'drop 1',
                    brand: 'drop1',
                    isNew: true,
                    stock: 10,
                    description: 'Stylish red hoodie for everyday wear'
                },
                {
                    name: 'Red/White Hoodie',
                    price: 190.85,
                    image: '/images/R.jpeg',
                    category: 'drop 1',
                    brand: 'drop1',
                    stock: 15,
                    description: 'Classic red and white hoodie design'
                },
                {
                    name: 'Yellow Hoodie',
                    price: 160.85,
                    image: '/images/yellow.png',
                    category: 'drop 1',
                    brand: 'drop1',
                    isNew: true,
                    stock: 20,
                    description: 'Bright yellow hoodie for a bold look'
                },
                {
                    name: 'Black Hoodie',
                    price: 170.85,
                    image: '/images/black.png',
                    category: 'drop 2',
                    brand: 'drop2',
                    stock: 25,
                    description: 'Classic black hoodie for a sleek look'
                },
                {
                    name: 'White Hoodie',
                    price: 165.85,
                    image: '/images/white.png',
                    category: 'drop 2',
                    brand: 'drop2',
                    isNew: true,
                    stock: 18,
                    description: 'Clean white hoodie for a fresh style'
                },
                {
                    name: 'Blue Hoodie',
                    price: 175.85,
                    image: '/images/blue.png',
                    category: 'drop 3',
                    brand: 'drop3',
                    stock: 22,
                    description: 'Cool blue hoodie for a casual look'
                },
                {
                    name: 'Green Hoodie',
                    price: 168.85,
                    image: '/images/green.png',
                    category: 'drop 3',
                    brand: 'drop3',
                    isNew: true,
                    stock: 15,
                    description: 'Fresh green hoodie for a natural style'
                },
                {
                    name: 'Purple Hoodie',
                    price: 172.85,
                    image: '/images/purple.png',
                    category: 'drop 3',
                    brand: 'drop3',
                    stock: 20,
                    description: 'Royal purple hoodie for a unique look'
                }
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

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

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
        done(error);
    }
});

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const indexRoutes = require('./routes/indexRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Register routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/shop', shopRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error',
        error: err,
        message: err.message || 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 