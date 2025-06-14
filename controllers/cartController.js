const Product = require('../models/Product');
const Cart = require('../models/Cart');

const cartController = {
    // Get cart page
    getCart: async (req, res) => {
        try {
            let cart;
            if (req.user) {
                // Get cart from database for logged-in users
                cart = await Cart.findOne({ user: req.user._id })
                    .populate('items.product');
            } else {
                // Use session cart for guests
                cart = { items: req.session.cart || [] };
            }

            let subtotal = 0;
            
            // Calculate subtotal
            for (let item of cart.items) {
                const product = item.product || await Product.findById(item.product);
                if (product) {
                    const price = product.discount > 0 
                        ? product.price * (1 - product.discount/100) 
                        : product.price;
                    subtotal += price * item.quantity;
                }
            }

            // Calculate shipping and tax
            const shipping = subtotal > 100 ? 0 : 10;
            const tax = subtotal * 0.1; // 10% tax
            const total = subtotal + shipping + tax;

            res.render('pages/cart', {
                title: 'Spicy - Shopping Cart',
                cart: cart.items,
                subtotal,
                shipping,
                tax,
                total
            });
        } catch (error) {
            console.error('Error loading cart:', error);
            res.status(500).render('error', {
                message: 'Error loading cart'
            });
        }
    },

    // Add item to cart
    addToCart: async (req, res) => {
        try {
            const { productId, quantity, size } = req.body;
            const product = await Product.findById(productId);
            
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            if (req.user) {
                // Handle cart for logged-in users
                let cart = await Cart.findOne({ user: req.user._id });
                
                if (!cart) {
                    // Create new cart if it doesn't exist
                    cart = new Cart({
                        user: req.user._id,
                        items: []
                    });
                }

                // Check if item already exists in cart
                const existingItemIndex = cart.items.findIndex(item => 
                item.product.toString() === productId && item.size === size
            );

                if (existingItemIndex > -1) {
                    // Update quantity if item exists
                    cart.items[existingItemIndex].quantity += parseInt(quantity);
                } else {
                    // Add new item
                    cart.items.push({
                        product: productId,
                        quantity: parseInt(quantity),
                        size,
                        price: product.price
                    });
                }

                // Save cart
                await cart.save();

                res.json({ 
                    success: true, 
                    message: 'Item added to cart', 
                    cart: cart.items 
                });
            } else {
                // Handle cart for guests using session
                if (!req.session.cart) {
                    req.session.cart = [];
                }

                const existingItemIndex = req.session.cart.findIndex(item => 
                    item.product.toString() === productId && item.size === size
                );

                if (existingItemIndex > -1) {
                    req.session.cart[existingItemIndex].quantity += parseInt(quantity);
                } else {
                    req.session.cart.push({
                    product: productId,
                    quantity: parseInt(quantity),
                        size,
                        price: product.price
                });
            }

                await new Promise((resolve) => req.session.save(resolve));

                res.json({ 
                    success: true, 
                    message: 'Item added to cart', 
                    cart: req.session.cart 
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error adding item to cart' 
            });
        }
    },

    // Update cart item
    updateCartItem: async (req, res) => {
        try {
            const { productId, quantity, size } = req.body;

            if (req.user) {
                // Update cart for logged-in users
                const cart = await Cart.findOne({ user: req.user._id });
                if (!cart) {
                    return res.status(404).json({ success: false, message: 'Cart not found' });
                }

                const itemIndex = cart.items.findIndex(item => 
                    item.product.toString() === productId && item.size === size
                );

                if (itemIndex > -1) {
                    cart.items[itemIndex].quantity = parseInt(quantity);
                    await cart.save();
                    res.json({ success: true, message: 'Cart updated', cart: cart.items });
                } else {
                    res.status(404).json({ success: false, message: 'Item not found in cart' });
                }
            } else {
                // Update cart for guests
            let cart = req.session.cart || [];
            const itemIndex = cart.findIndex(item => 
                item.product.toString() === productId && item.size === size
            );

            if (itemIndex > -1) {
                cart[itemIndex].quantity = parseInt(quantity);
                req.session.cart = cart;
                    await new Promise((resolve) => req.session.save(resolve));
                    res.json({ success: true, message: 'Cart updated', cart });
            } else {
                    res.status(404).json({ success: false, message: 'Item not found in cart' });
                }
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            res.status(500).json({ success: false, message: 'Error updating cart' });
        }
    },

    // Remove item from cart
    removeFromCart: async (req, res) => {
        try {
            const { productId, size } = req.body;

            if (req.user) {
                // Remove item for logged-in users
                const cart = await Cart.findOne({ user: req.user._id });
                if (!cart) {
                    return res.status(404).json({ success: false, message: 'Cart not found' });
                }

                cart.items = cart.items.filter(item => 
                    !(item.product.toString() === productId && item.size === size)
                );

                await cart.save();
                res.json({ success: true, message: 'Item removed from cart', cart: cart.items });
            } else {
                // Remove item for guests
            let cart = req.session.cart || [];
            cart = cart.filter(item => 
                !(item.product.toString() === productId && item.size === size)
            );

            req.session.cart = cart;
                await new Promise((resolve) => req.session.save(resolve));
                res.json({ success: true, message: 'Item removed from cart', cart });
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            res.status(500).json({ success: false, message: 'Error removing item from cart' });
        }
    },

    // Merge session cart with database cart after login
    mergeCarts: async (req, res) => {
        try {
            if (!req.user || !req.session.cart) {
                return;
            }

            let cart = await Cart.findOne({ user: req.user._id });
            
            if (!cart) {
                cart = new Cart({
                    user: req.user._id,
                    items: []
                });
            }

            // Merge session cart items with database cart
            for (const sessionItem of req.session.cart) {
                const existingItemIndex = cart.items.findIndex(item => 
                    item.product.toString() === sessionItem.product.toString() && 
                    item.size === sessionItem.size
                );

                if (existingItemIndex > -1) {
                    cart.items[existingItemIndex].quantity += sessionItem.quantity;
                } else {
                    cart.items.push({
                        product: sessionItem.product,
                        quantity: sessionItem.quantity,
                        size: sessionItem.size,
                        price: sessionItem.price
                    });
                }
            }

            await cart.save();
            req.session.cart = null;
            await new Promise((resolve) => req.session.save(resolve));
        } catch (error) {
            console.error('Error merging carts:', error);
        }
    }
};

module.exports = cartController; 