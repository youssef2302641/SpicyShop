const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const adminController = require('../controllers/adminController');

// Middleware to check if user is admin
router.use(isAdmin);

// Dashboard Routes
router.get('/dashboard', async (req, res) => {
    try {
        const stats = await getDashboardStats();
        res.render('admin/dashboard', { stats, layout: false });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).render('error', { message: 'Error loading dashboard' });
    }
});

// API Routes for Dashboard Stats
router.get('/api/stats', async (req, res) => {
    try {
        const stats = await getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

// Product Routes
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { products, layout: false });
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).render('error', { message: 'Error loading products' });
    }
});

// Product API Routes
router.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

router.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error fetching product' });
    }
});

router.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Error creating product' });
    }
});

router.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error updating product' });
    }
});

router.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error deleting product' });
    }
});

// User Routes
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/users', { users, layout: false });
    } catch (error) {
        console.error('Error loading users:', error);
        res.status(500).render('error', { message: 'Error loading users' });
    }
});

// User API Routes
router.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

router.post('/api/users', async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        
        const { firstName, lastName, email, password, role, status } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'First name, last name, email, and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                details: 'Please enter a valid email address'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Invalid password',
                details: 'Password must be at least 6 characters long'
            });
        }

        // Validate role
        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                error: 'Invalid role',
                details: 'Role must be either "user" or "admin"'
            });
        }

        // Validate status
        if (status && !['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                details: 'Status must be either "active", "inactive", or "suspended"'
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User already exists',
                details: 'A user with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password, // Password will be hashed by the User model's pre-save hook
            role: role || 'user',
            status: status || 'active'
        });

        await user.save();
        
        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Error creating user:', error);
        // Log the full error details
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation Error',
                details: validationErrors.join(', ')
            });
        }

        // Handle duplicate key errors (e.g., duplicate email)
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Duplicate Error',
                details: 'A user with this email already exists'
            });
        }

        res.status(500).json({ 
            error: 'Error creating user',
            details: error.message 
        });
    }
});

router.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

router.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
});

router.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Settings Routes
router.get('/settings', async (req, res) => {
    try {
        const settings = await Settings.getCurrent();
        res.render('admin/settings', { settings, layout: false });
    } catch (error) {
        console.error('Error loading settings:', error);
        res.status(500).render('error', { message: 'Error loading settings' });
    }
});

// Settings API Routes
router.get('/api/settings', async (req, res) => {
    try {
        const settings = await Settings.getCurrent();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Error fetching settings' });
    }
});

router.put('/api/settings', async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            {},
            req.body,
            { new: true, upsert: true, runValidators: true }
        );
        res.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Error updating settings' });
    }
});

// Contact Messages Routes
router.get('/messages', isAdmin, adminController.getContactMessages);
router.put('/messages/:id/status', isAdmin, adminController.updateMessageStatus);
router.delete('/messages/:id', isAdmin, adminController.deleteMessage);

// Order Routes
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.render('admin/orders', { orders, layout: false });
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).render('error', { message: 'Error loading orders' });
    }
});

// Helper function to get dashboard stats
async function getDashboardStats() {
    try {
        const [
            totalProducts,
            totalUsers,
            totalOrders,
            recentOrders,
            lowStockProducts
        ] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments(),
            Order.countDocuments(),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'email'),
            Product.find({ stock: { $lte: 5 } })
                .select('name stock image')
                .limit(5)
        ]);

        return {
            totalProducts,
            totalUsers,
            totalOrders,
            recentOrders,
            lowStockProducts
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        throw error;
    }
}

module.exports = router; 