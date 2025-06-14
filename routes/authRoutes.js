const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isNotAuthenticated } = require('../middleware/auth');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { sendWelcomeEmail } = require('../utils/emailService');

// Login page
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        error: req.query.error
    });
});

// Login process
router.post('/login', isNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/auth/login?error=Invalid email or password');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Redirect based on user role
            if (user.role === 'admin') {
                return res.redirect('/admin/dashboard');
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

// Register page
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('auth/register', {
        title: 'Register',
        error: req.query.error
    });
});

// Register process
router.post('/register', isNotAuthenticated, async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;

        // Basic validation
        if (password !== confirmPassword) {
            return res.redirect('/auth/register?error=Passwords do not match');
        }

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

        // Send welcome email (non-blocking)
        sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);

        // Log in the new user
        req.login(user, (err) => {
            if (err) {
                console.error('Login error after registration:', err);
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

// Forgot password page
router.get('/forgot-password', isNotAuthenticated, (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Forgot Password',
        error: req.query.error,
        success: req.query.success
    });
});

// Forgot password process
router.post('/forgot-password', isNotAuthenticated, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.redirect('/auth/forgot-password?error=No account found with that email address');
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;

        // Send email
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            to: user.email,
            from: `"Your Store" <${process.env.EMAIL_USER}>`,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${user.firstName},</p>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
                    <p>This link will expire in 1 hour.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message, please do not reply to this email.
                    </p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            res.redirect('/auth/forgot-password?success=Password reset email sent');
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Clear the reset token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.redirect('/auth/forgot-password?error=Error sending reset email. Please try again later.');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.redirect('/auth/forgot-password?error=Error sending reset email');
    }
});

// Reset password page
router.get('/reset-password/:token', isNotAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect('/auth/forgot-password?error=Password reset token is invalid or has expired');
        }

        res.render('auth/reset-password', {
            title: 'Reset Password',
            token: req.params.token,
            error: req.query.error
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.redirect('/auth/forgot-password?error=Error processing password reset');
    }
});

// Reset password process
router.post('/reset-password/:token', isNotAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect('/auth/forgot-password?error=Password reset token is invalid or has expired');
        }

        // Update password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.redirect('/auth/login?success=Password has been reset');
    } catch (error) {
        console.error('Reset password error:', error);
        res.redirect('/auth/forgot-password?error=Error resetting password');
    }
});

module.exports = router; 