const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send order confirmation email
exports.sendOrderConfirmationEmail = async (email, order) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Order Confirmation - Order #${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                        <h1 style="color: #333;">Order Confirmed!</h1>
                        <p style="color: #666;">Thank you for your purchase</p>
                    </div>
                    
                    <div style="padding: 20px;">
                        <h2 style="color: #333;">Order Information</h2>
                        <p><strong>Order Number:</strong> #${order.orderNumber}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
                        <p><strong>Payment Method:</strong> Credit Card (****${order.paymentInfo.last4})</p>
                        
                        <h2 style="color: #333; margin-top: 30px;">Shipping Information</h2>
                        <p><strong>Name:</strong> ${order.shippingInfo.fullName}</p>
                        <p><strong>Email:</strong> ${order.shippingInfo.email}</p>
                        <p><strong>Phone:</strong> ${order.shippingInfo.phone}</p>
                        <p><strong>Address:</strong><br>
                            ${order.shippingInfo.address}<br>
                            ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.zipCode}<br>
                            ${order.shippingInfo.country}
                        </p>
                        
                        <h2 style="color: #333; margin-top: 30px;">Order Items</h2>
                        <div style="margin-bottom: 20px;">
                            ${order.items.map(item => `
                                <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                                    <p style="margin: 0;"><strong>${item.product.name}</strong></p>
                                    <p style="margin: 5px 0;">Size: ${item.size}</p>
                                    <p style="margin: 5px 0;">Quantity: ${item.quantity}</p>
                                    <p style="margin: 5px 0;">Price: $${item.price.toFixed(2)}</p>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; margin-top: 30px;">
                            <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
                            <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
                            <p><strong>Shipping:</strong> $${order.shipping.toFixed(2)}</p>
                            <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
                            <p style="font-size: 18px; font-weight: bold; margin-top: 10px;">
                                <strong>Total:</strong> $${order.total.toFixed(2)}
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #666;">What's Next?</p>
                            <p>We'll start processing your order right away. You'll receive shipping updates via email.</p>
                            <p>If you have any questions, please don't hesitate to contact our customer service team.</p>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-top: 20px;">
                        <p style="color: #666; margin: 0;">Thank you for shopping with us!</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        throw error;
    }
};

// Send shipping update email
exports.sendShippingUpdateEmail = async (email, order, status) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Shipping Update - Order #${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                        <h1 style="color: #333;">Shipping Update</h1>
                        <p style="color: #666;">Order #${order.orderNumber}</p>
                    </div>
                    
                    <div style="padding: 20px;">
                        <h2 style="color: #333;">Order Status</h2>
                        <p style="font-size: 18px; color: #28a745;">${status}</p>
                        
                        <div style="margin-top: 30px;">
                            <p>Your order is on its way! You can track your order status by clicking the button below.</p>
                            <div style="text-align: center; margin-top: 20px;">
                                <a href="${process.env.BASE_URL}/orders/${order._id}" 
                                   style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                                    Track Order
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-top: 20px;">
                        <p style="color: #666; margin: 0;">Thank you for shopping with us!</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending shipping update email:', error);
        throw error;
    }
}; 