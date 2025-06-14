const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order must belong to a user']
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Order item must have a product']
        },
        quantity: {
            type: Number,
            required: [true, 'Order item must have a quantity'],
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: [true, 'Order item must have a price']
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, 'Order must have a total amount']
    },
    shippingAddress: {
        street: {
            type: String,
            required: [true, 'Shipping address street is required']
        },
        city: {
            type: String,
            required: [true, 'Shipping address city is required']
        },
        state: {
            type: String,
            required: [true, 'Shipping address state is required']
        },
        zipCode: {
            type: String,
            required: [true, 'Shipping address zip code is required']
        },
        country: {
            type: String,
            required: [true, 'Shipping address country is required']
        }
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['credit_card', 'paypal', 'stripe']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: {
        type: String
    },
    shippingMethod: {
        type: String,
        required: [true, 'Shipping method is required'],
        enum: ['standard', 'express', 'overnight']
    },
    shippingCost: {
        type: Number,
        required: [true, 'Shipping cost is required'],
        default: 0
    },
    tax: {
        type: Number,
        required: [true, 'Tax amount is required'],
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for order subtotal
orderSchema.virtual('subtotal').get(function() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for order total with shipping and tax
orderSchema.virtual('total').get(function() {
    return this.subtotal + this.shippingCost + this.tax - this.discount;
});

// Method to check if order is paid
orderSchema.methods.isPaid = function() {
    return this.paymentStatus === 'completed';
};

// Method to check if order is delivered
orderSchema.methods.isDelivered = function() {
    return this.orderStatus === 'delivered';
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
    return ['pending', 'processing'].includes(this.orderStatus);
};

// Method to update order status
orderSchema.methods.updateStatus = async function(status) {
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        throw new Error('Invalid order status');
    }
    this.orderStatus = status;
    return this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = async function(status) {
    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
        throw new Error('Invalid payment status');
    }
    this.paymentStatus = status;
    return this.save();
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
    return this.find({ user: userId }).sort('-createdAt');
};

// Static method to find recent orders
orderSchema.statics.findRecent = function(limit = 10) {
    return this.find().sort('-createdAt').limit(limit);
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
    return this.find({ orderStatus: status }).sort('-createdAt');
};

// Static method to get order statistics
orderSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$orderStatus',
                count: { $sum: 1 },
                total: { $sum: '$totalAmount' }
            }
        }
    ]);
    return stats;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 