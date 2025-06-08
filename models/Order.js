const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      _id: String,
      name: String,
      price: Number,
      image: String,
      size: String
    },
    quantity: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `${year}${month}${day}-${random}`;
  }
  next();
});

// Calculate estimated delivery date
orderSchema.methods.calculateEstimatedDelivery = function() {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days from order date
  this.estimatedDelivery = date;
};

// Update order status
orderSchema.methods.updateStatus = async function(status, trackingNumber = null) {
  this.status = status;
  if (trackingNumber) {
    this.trackingNumber = trackingNumber;
  }
  await this.save();
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 