class AdminProductManager {
    constructor() {
        this.productManager = window.productManager;
        this.setupEventListeners();
        this.loadProducts();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterProducts(e.target.value));
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterByCategory(e.target.value));
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortProducts');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortProducts(e.target.value));
        }

        // Product form submission
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }
    }

    loadProducts() {
        const products = this.productManager.getAllProducts();
        this.updateProductsTable(products);
    }

    updateProductsTable(products) {
        const tbody = document.querySelector('#productsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>${product.category}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn-edit" data-id="${product.id}">
                        <ion-icon name="create-outline"></ion-icon>
                    </button>
                    <button class="btn-delete" data-id="${product.id}">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </td>
            </tr>
        `).join('');

        // Add event listeners for edit and delete buttons
        tbody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.editProduct(btn.dataset.id));
        });

        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => this.deleteProduct(btn.dataset.id));
        });
    }

    filterProducts(searchTerm) {
        const products = this.productManager.getAllProducts();
        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.updateProductsTable(filtered);
    }

    filterByCategory(category) {
        const products = this.productManager.getAllProducts();
        const filtered = category === 'all' 
            ? products 
            : products.filter(product => product.category === category);
        this.updateProductsTable(filtered);
    }

    sortProducts(sortBy) {
        const products = this.productManager.getAllProducts();
        const sorted = [...products].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                default:
                    return 0;
            }
        });
        this.updateProductsTable(sorted);
    }

    editProduct(productId) {
        const product = this.productManager.getProductById(productId);
        if (!product) return;

        // Populate form with product data
        const form = document.getElementById('productForm');
        form.dataset.editId = productId;
        
        // Set form values
        form.querySelector('[name="name"]').value = product.name;
        form.querySelector('[name="price"]').value = product.price;
        form.querySelector('[name="brand"]').value = product.brand;
        form.querySelector('[name="category"]').value = product.category;
        form.querySelector('[name="stock"]').value = product.stock;
        
        // Show form
        form.style.display = 'block';
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.productManager.deleteProduct(productId);
            this.loadProducts();
        }
    }

    handleProductSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const productData = {
            id: form.dataset.editId || `product-${Date.now()}`,
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            brand: formData.get('brand'),
            category: formData.get('category'),
            stock: parseInt(formData.get('stock')),
            image: formData.get('image') || 'images/default-product.jpg'
        };

        if (form.dataset.editId) {
            this.productManager.updateProduct(form.dataset.editId, productData);
        } else {
            this.productManager.addProduct(productData);
        }

        // Reset form
        form.reset();
        form.dataset.editId = '';
        form.style.display = 'none';
        
        // Reload products
        this.loadProducts();
    }
}

// Initialize admin product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminProductManager = new AdminProductManager();
}); 