const Product = require('../models/Product');

const cartController = {
    // Get cart page
    getCart: async (req, res) => {
        try {
            const cart = req.session.cart || [];
            let subtotal = 0;
            
            // Calculate subtotal
            for (let item of cart) {
                const product = await Product.findById(item.product);
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

            res.render('cart', {
                title: 'Spicy - Shopping Cart',
                cart,
                subtotal,
                shipping,
                tax,
                total
            });
        } catch (error) {
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
                return res.status(404).json({ message: 'Product not found' });
            }

            let cart = req.session.cart || [];
            const existingItem = cart.find(item => 
                item.product.toString() === productId && item.size === size
            );

            if (existingItem) {
                existingItem.quantity += parseInt(quantity);
            } else {
                cart.push({
                    product: productId,
                    quantity: parseInt(quantity),
                    size
                });
            }

            req.session.cart = cart;
            res.json({ message: 'Item added to cart', cart });
        } catch (error) {
            res.status(500).json({ message: 'Error adding item to cart' });
        }
    },

    // Update cart item
    updateCartItem: async (req, res) => {
        try {
            const { productId, quantity, size } = req.body;
            let cart = req.session.cart || [];
            
            const itemIndex = cart.findIndex(item => 
                item.product.toString() === productId && item.size === size
            );

            if (itemIndex > -1) {
                cart[itemIndex].quantity = parseInt(quantity);
                req.session.cart = cart;
                res.json({ message: 'Cart updated', cart });
            } else {
                res.status(404).json({ message: 'Item not found in cart' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating cart' });
        }
    },

    // Remove item from cart
    removeFromCart: async (req, res) => {
        try {
            const { productId, size } = req.body;
            let cart = req.session.cart || [];
            
            cart = cart.filter(item => 
                !(item.product.toString() === productId && item.size === size)
            );

            req.session.cart = cart;
            res.json({ message: 'Item removed from cart', cart });
        } catch (error) {
            res.status(500).json({ message: 'Error removing item from cart' });
        }
    }
};

module.exports = cartController; 