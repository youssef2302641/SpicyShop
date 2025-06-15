const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Contact = require('../models/Contact');

// Get home page data
exports.getHomePage = async (req, res) => {
    try {
        // Get featured products
        const featuredProducts = await Product.find({ featured: true })
            .limit(8)
            .sort('-createdAt');

        // Get categories
        const categories = await Category.find()
            .sort('order')
            .limit(6);

        // Get site settings
        const settings = await Settings.findOne();

        res.render('index', {
            title: 'Spicy Shop - Home',
            featuredProducts,
            categories,
            settings
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.status(500).render('error', {
            message: 'Error loading home page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// Get about page
exports.getAboutPage = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.render('about', {
            title: 'About Us - Spicy Shop',
            settings
        });
    } catch (error) {
        console.error('About page error:', error);
        res.status(500).render('error', {
            message: 'Error loading about page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// Get contact page
exports.getContactPage = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.render('contact', {
            title: 'Contact Us - Spicy Shop',
            settings
        });
    } catch (error) {
        console.error('Contact page error:', error);
        res.status(500).render('error', {
            message: 'Error loading contact page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Create new contact message
        const contact = new Contact({
            name,
            email,
            subject,
            message
        });
        
        await contact.save();

        req.flash('success', 'Thank you for your message. We will get back to you soon!');
        res.redirect('/contact');
    } catch (error) {
        console.error('Contact form error:', error);
        req.flash('error', 'Error submitting contact form. Please try again.');
        res.redirect('/contact');
    }
};






