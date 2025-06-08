class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.initializeProducts();
    }

    // Initialize products from shop.html if no products exist
    initializeProducts() {
        if (this.products.length === 0) {
            const productItems = document.querySelectorAll('.product-item');
            this.products = Array.from(productItems).map(item => ({
                id: item.dataset.id,
                name: item.dataset.name,
                price: parseFloat(item.dataset.price),
                brand: item.dataset.brand,
                category: item.dataset.category,
                image: item.querySelector('.image-contain').src,
                stock: 100 // Default stock
            }));
            this.saveProducts();
        }
    }

    // Save products to localStorage
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
        this.updateShopDisplay();
    }

    // Add new product
    addProduct(product) {
        this.products.push(product);
        this.saveProducts();
    }

    // Delete product
    deleteProduct(productId) {
        this.products = this.products.filter(product => product.id !== productId);
        this.saveProducts();
    }

    // Update product
    updateProduct(productId, updatedData) {
        const index = this.products.findIndex(product => product.id === productId);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updatedData };
            this.saveProducts();
        }
    }

    // Get all products
    getAllProducts() {
        return this.products;
    }

    // Get product by ID
    getProductById(productId) {
        return this.products.find(product => product.id === productId);
    }

    // Update shop display
    updateShopDisplay() {
        const productList = document.getElementById('productList');
        if (!productList) return;

        productList.innerHTML = this.products.map(product => `
            <li class="product-item" 
                data-id="${product.id}" 
                data-name="${product.name}" 
                data-price="${product.price}" 
                data-brand="${product.brand}" 
                data-category="${product.category}">
                <div class="product-card">
                    <figure class="card-banner">
                        <img src="${product.image}" alt="${product.name}" class="image-contain">
                        <div class="card-badge">New</div>
                        <ul class="card-action-list">
                            <li><button class="card-action-btn" data-cart aria-label="Add to cart">
                                <ion-icon name="cart-outline"></ion-icon>
                            </button></li>
                        </ul>
                    </figure>
                    <div class="card-content">
                        <div class="card-cat">${product.category}</div>
                        <h3 class="h3 card-title"><a href="#">${product.name}</a></h3>
                        <data class="card-price" value="${product.price}">$${product.price.toFixed(2)}</data>
                    </div>
                </div>
            </li>
        `).join('');

        // Reattach event listeners
        this.attachProductEventListeners();
    }

    // Attach event listeners to product elements
    attachProductEventListeners() {
        document.querySelectorAll('[data-cart]').forEach(btn => {
            btn.addEventListener('click', () => {
                const productItem = btn.closest('.product-item');
                const productData = {
                    id: productItem.dataset.id,
                    name: productItem.dataset.name,
                    price: parseFloat(productItem.dataset.price),
                    brand: productItem.dataset.brand,
                    image: productItem.querySelector('.image-contain').src,
                    quantity: 1,
                    size: null
                };
                
                // Show size selection modal
                const modal = document.getElementById('sizeModal');
                const modalImg = document.getElementById('modalImg');
                const modalName = document.getElementById('modalName');
                
                modalImg.src = productData.image;
                modalName.textContent = productData.name;
                modal.classList.remove('hidden');
                
                // Store product data for later use
                modal.dataset.productData = JSON.stringify(productData);
            });
        });
    }
}

// Create global instance
window.productManager = new ProductManager(); 