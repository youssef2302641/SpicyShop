const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  brand: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  isNew: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  sizes: [{
    type: String,
    enum: ['Small', 'Medium', 'Large', 'XLarge']
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
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
  timestamps: true
});

// Virtual for product URL
productSchema.virtual('url').get(function() {
  return `/shop/product/${this._id}`;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock <= 0) return 'out-of-stock';
  if (this.stock <= 5) return 'low-stock';
  return 'in-stock';
});

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

// Method to check if product is low in stock
productSchema.methods.isLowStock = function() {
  return this.stock > 0 && this.stock <= 5;
};

// Method to update stock
productSchema.methods.updateStock = async function(quantity) {
  if (this.stock + quantity < 0) {
    throw new Error('Insufficient stock');
  }
  this.stock += quantity;
  return this.save();
};

// Static method to find low stock products
productSchema.statics.findLowStock = function() {
  return this.find({ stock: { $lte: 5 } });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 