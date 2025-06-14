const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Contact = require('../models/Contact');

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const recentOrders = await Order.find()
            .sort('-createdAt')
            .limit(5)
            .populate('user', 'firstName lastName email');

        const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
            .select('name stock price')
            .limit(5);

        const unreadMessages = await Contact.countDocuments({ status: 'new' });

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                totalUsers,
                totalRevenue: totalRevenue[0]?.total || 0,
                unreadMessages
            },
            recentOrders,
            lowStockProducts
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Error fetching dashboard statistics' });
    }
};

// Product Management
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort('-createdAt');
        res.json({ success: true, products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Error creating product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Error deleting product' });
    }
};

// Order Management
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort('-createdAt')
            .populate('user', 'firstName lastName email');
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true, runValidators: true }
        );
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ success: true, order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Error updating order status' });
    }
};

// User Management
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');
        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
};

// Contact Messages Management
exports.getContactMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort('-createdAt');
        res.json({ success: true, messages });
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ error: 'Error fetching contact messages' });
    }
};

exports.updateMessageStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ success: true, message });
    } catch (error) {
        console.error('Update message status error:', error);
        res.status(500).json({ error: 'Error updating message status' });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Error deleting message' });
    }
}; 