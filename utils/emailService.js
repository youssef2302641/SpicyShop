const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services or SMTP
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Welcome to Spicy!',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #ff6b6b;">Welcome to Spicy!</h2>
                    <p>Dear ${userName},</p>
                    <p>Thank you for registering at Spicy! We are thrilled to welcome you to our community.</p>
                    <p>As a token of our appreciation for trusting us, here is your exclusive discount code for new customers:</p>
                    <h3 style="color: #ff6b6b; background-color: #f0f0f0; padding: 10px; display: inline-block; border-radius: 5px;">NEWCUSTOMER</h3>
                    <p>Use this code during your next purchase to enjoy a special discount.</p>
                    <p>If you have any questions or need assistance, our team is always here to help.</p>
                    <p>Thank you for choosing us!</p>
                    <p>Best regards,<br>Spicy Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
        console.error(`Error sending welcome email to ${userEmail}:`, error);
    }
};

module.exports = {
    sendWelcomeEmail
}; 