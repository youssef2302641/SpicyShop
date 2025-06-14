const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// GET contact page
router.get('/', (req, res) => {
    res.render('pages/contact', {
        title: 'Contact Us',
        user: req.session.user || null
    });
});

// POST contact form
router.post('/', async (req, res) => {
    try {
        console.log('Received contact form submission:', req.body); // Debug log

        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            console.log('Missing required fields:', { name, email, subject, message }); // Debug log
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create new contact message
        const contact = new Contact({
            name,
            email,
            subject,
            message
        });

        // Save to database
        const savedContact = await contact.save();
        console.log('Message saved successfully:', savedContact); // Debug log

        // Send success response
        res.json({
            success: true,
            message: 'Your message has been sent successfully!'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

module.exports = router; 