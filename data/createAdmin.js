const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Create admin user
        const adminUser = new User({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@spicyshop.com',
            password: 'Admin@123',
            role: 'admin'
        });

        // Save the admin user
        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email:', adminUser.email);
        console.log('Password: Admin@123');

        // Close the connection
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser(); 