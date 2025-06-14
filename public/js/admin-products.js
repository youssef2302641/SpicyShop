// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing ProductManager');
    window.productManager = new ProductManager();
    console.log('ProductManager initialized:', window.productManager);
});

// Product Management
class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    init() {
        console.log('Initializing ProductManager...');
        this.loadProducts();
        this.setupEventListeners();
        
        // Add event listener for Add Product button
        const addProductBtn = document.querySelector('.add-product-btn');
        console.log('Add Product button found:', addProductBtn);
        
        if (addProductBtn) {
            console.log('Adding click event listener to Add Product button');
            addProductBtn.addEventListener('click', () => {
                console.log('Add Product button clicked');
                this.showAddProductModal();
            });
        } else {
            console.error('Add Product button not found in the DOM');
        }
    }

    setupEventListeners() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterProducts());
        }
    }

    async loadProducts() {
        try {
            console.log('Fetching products...');
            const response = await fetch('/admin/api/products');
            console.log('Fetch products response status:', response.status);
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.statusText}`);
            }
            this.products = await response.json();
            console.log('Fetched products data:', this.products);
            this.filteredProducts = [...this.products];
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    filterProducts() {
        const categoryFilter = document.getElementById('categoryFilter');
        const selectedCategory = categoryFilter.value;

        this.filteredProducts = this.products.filter(product => {
            if (selectedCategory === 'all') return true;
            return product.category === selectedCategory;
        });

        this.currentPage = 1;
        this.renderProducts();
    }

    renderProducts() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        const tbody = document.querySelector('.products-table tbody');
        if (!tbody) {
            console.error('Error: .products-table tbody not found.');
            return;
        }

        tbody.innerHTML = productsToShow.map(product => `
            <tr data-product-id="${product._id}">
                <td>
                    <img src="${product.image}" alt="${product.name}" class="product-thumbnail">
                </td>
                <td>
                    <span class="view-mode" data-field="name">${product.name}</span>
                    <input type="text" class="edit-mode" name="name" value="${product.name}" style="display:none;">
                </td>
                <td>
                    <span class="view-mode" data-field="category">${product.category}</span>
                    <input type="text" class="edit-mode" name="category" value="${product.category}" style="display:none;">
                </td>
                <td>
                    <span class="view-mode" data-field="price">$${product.price.toFixed(2)}</span>
                    <input type="number" step="0.01" class="edit-mode" name="price" value="${product.price.toFixed(2)}" style="display:none;">
                </td>
                <td>
                    <span class="view-mode" data-field="stock">${product.stock}</span>
                    <input type="number" class="edit-mode" name="stock" value="${product.stock}" style="display:none;">
                </td>
                <td>
                    <span class="view-mode status-badge ${product.status.toLowerCase()}" data-field="status">${product.status}</span>
                    <select class="edit-mode" name="status" style="display:none;">
                        <option value="In Stock" ${product.status === 'In Stock' ? 'selected' : ''}>In Stock</option>
                        <option value="Low Stock" ${product.status === 'Low Stock' ? 'selected' : ''}>Low Stock</option>
                        <option value="Out of Stock" ${product.status === 'Out of Stock' ? 'selected' : ''}>Out of Stock</option>
                    </select>
                </td>
                <td>
                    <div class="action-buttons view-mode">
                        <button class="btn btn-icon edit-product-btn" data-product-id="${product._id}">
                            <ion-icon name="create-outline"></ion-icon> Edit
                        </button>
                        <button class="btn btn-icon delete-product-btn" data-product-id="${product._id}">
                            <ion-icon name="trash-outline"></ion-icon> Delete
                        </button>
                    </div>
                    <div class="action-buttons edit-mode" style="display:none;">
                        <button class="btn btn-success save-product-btn" data-product-id="${product._id}">Save</button>
                        <button class="btn btn-secondary cancel-edit-btn" data-product-id="${product._id}">Cancel</button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.setupActionButtons();
        this.renderPagination();
    }

    setupActionButtons() {
        document.querySelectorAll('.edit-product-btn').forEach(button => {
            button.onclick = (e) => this.editProduct(e.currentTarget.dataset.productId);
        });
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.onclick = (e) => this.deleteProduct(e.currentTarget.dataset.productId);
        });

        document.querySelectorAll('.save-product-btn').forEach(button => {
            button.onclick = (e) => this.saveProduct(e.currentTarget.dataset.productId);
        });
        document.querySelectorAll('.cancel-edit-btn').forEach(button => {
            button.onclick = (e) => this.cancelEdit(e.currentTarget.dataset.productId);
        });
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        let paginationHTML = `
            <button class="btn btn-icon" ${this.currentPage === 1 ? 'disabled' : ''} onclick="adminProducts.changePage(${this.currentPage - 1})">
                <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="btn ${i === this.currentPage ? 'btn-primary' : ''}" onclick="adminProducts.changePage(${i})">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
            <button class="btn btn-icon" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="adminProducts.changePage(${this.currentPage + 1})">
                <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.filteredProducts.length / this.itemsPerPage)) return;
        this.currentPage = page;
        this.renderProducts();
    }

    async editProduct(productId) {
        const productRow = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (!productRow) return;

        productRow.querySelectorAll('.view-mode').forEach(el => el.style.display = 'none');
        productRow.querySelectorAll('.edit-mode').forEach(el => el.style.display = 'inline-block');
    }

    async saveProduct(productId) {
        console.log(`Save button clicked for product ID: ${productId}`);
        const productRow = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (!productRow) return;

        const updatedData = {};
        updatedData.name = productRow.querySelector('input[name="name"]').value;
        updatedData.category = productRow.querySelector('input[name="category"]').value;
        updatedData.price = parseFloat(productRow.querySelector('input[name="price"]').value);
        updatedData.stock = parseInt(productRow.querySelector('input[name="stock"]').value);
        updatedData.status = productRow.querySelector('select[name="status"]').value;

        console.log('Data to be sent for update:', updatedData);

        try {
            const response = await fetch(`/admin/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            console.log('Save product response status:', response.status);

            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            const updatedProduct = await response.json();
            console.log('Product updated successfully:', updatedProduct);

            const index = this.products.findIndex(p => p._id === productId);
            if (index !== -1) {
                this.products[index] = updatedProduct;
            }
            const filteredIndex = this.filteredProducts.findIndex(p => p._id === productId);
            if (filteredIndex !== -1) {
                this.filteredProducts[filteredIndex] = updatedProduct;
            }
            this.renderProducts();

        } catch (error) {
            console.error('Error saving product:', error);
            console.error('Failed to save product. Please try again.');
        }
    }

    cancelEdit(productId) {
        this.renderProducts();
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/admin/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.products = this.products.filter(p => p._id !== productId);
                this.filteredProducts = this.filteredProducts.filter(p => p._id !== productId);
                this.renderProducts();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }

    showAddProductModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal" id="addProductModal">
                <div class="modal-content">
                    <h2>Add New Product</h2>
                    <form id="addProductForm">
                        <div class="form-group">
                            <label for="newProductName">Name:</label>
                            <input type="text" id="newProductName" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="newProductCategory">Category:</label>
                            <input type="text" id="newProductCategory" name="category" required>
                        </div>
                        <div class="form-group">
                            <label for="newProductPrice">Price:</label>
                            <input type="number" id="newProductPrice" name="price" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="newProductStock">Stock:</label>
                            <input type="number" id="newProductStock" name="stock" required>
                        </div>
                        <div class="form-group">
                            <label for="newProductStatus">Status:</label>
                            <select id="newProductStatus" name="status" required>
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="newProductImage">Image URL:</label>
                            <input type="text" id="newProductImage" name="image" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Add Product</button>
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add modal to the page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add form submit handler
        const form = document.getElementById('addProductForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('newProductName').value,
                category: document.getElementById('newProductCategory').value,
                price: parseFloat(document.getElementById('newProductPrice').value),
                stock: parseInt(document.getElementById('newProductStock').value),
                status: document.getElementById('newProductStatus').value,
                image: document.getElementById('newProductImage').value
            };

            console.log('Submitting new product data:', formData);

            try {
                const response = await fetch('/admin/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Add product response status:', response.status);

                if (!response.ok) {
                    throw new Error('Failed to add product');
                }

                const newProduct = await response.json();
                console.log('New product added:', newProduct);

                // Remove modal
                document.getElementById('addProductModal').remove();

                // Reload products to ensure we have the latest data
                await this.loadProducts();
                
                console.log('Products after adding new product:', this.products);
            } catch (error) {
                console.error('Error adding product:', error);
                alert('Failed to add product. Please try again.');
            }
        });
    }
}

const adminProducts = new ProductManager(); 
