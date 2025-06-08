// Product management functionality
class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
    }

    // Get all products
    getAllProducts() {
        return this.products;
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    // Add new product
    addProduct(product) {
        const newProduct = {
            ...product,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    // Update product
    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(product => product.id === id);
        if (index !== -1) {
            this.products[index] = {
                ...this.products[index],
                ...updatedProduct,
                updatedAt: new Date().toISOString()
            };
            this.saveProducts();
            return this.products[index];
        }
        return null;
    }

    // Delete product
    deleteProduct(id) {
        const index = this.products.findIndex(product => product.id === id);
        if (index !== -1) {
            const deletedProduct = this.products[index];
            this.products.splice(index, 1);
            this.saveProducts();
            return deletedProduct;
        }
        return null;
    }

    // Save products to localStorage
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    // Initialize with sample products if none exist
    initializeSampleProducts() {
        if (this.products.length === 0) {
            const sampleProducts = [
                {
                    name: 'Sample Product 1',
                    description: 'This is a sample product description',
                    price: 99.99,
                    category: 'Electronics',
                    stock: 100,
                    image: 'https://via.placeholder.com/150'
                },
                {
                    name: 'Sample Product 2',
                    description: 'Another sample product description',
                    price: 149.99,
                    category: 'Clothing',
                    stock: 50,
                    image: 'https://via.placeholder.com/150'
                }
            ];

            sampleProducts.forEach(product => this.addProduct(product));
        }
    }
}

// Export the ProductManager class
window.ProductManager = ProductManager; 