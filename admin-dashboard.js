// Product Management
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
    }

    // Add a new product
    addProduct(product) {
        product.id = `product-${Date.now()}`;
        this.products.push(product);
        this.saveProducts();
        return product;
    }

    // Update an existing product
    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updatedProduct };
            this.saveProducts();
            return true;
        }
        return false;
    }

    // Delete a product
    deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products.splice(index, 1);
            this.saveProducts();
            return true;
        }
        return false;
    }

    // Get all products
    getAllProducts() {
        return this.products;
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }
}

// Category Management
class CategoryManager {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
    }

    addCategory(category) {
        category.id = Date.now();
        this.categories.push(category);
        this.saveCategories();
    }

    updateCategory(id, updatedCategory) {
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            this.categories[index] = { ...this.categories[index], ...updatedCategory };
            this.saveCategories();
        }
    }

    deleteCategory(id) {
        this.categories = this.categories.filter(c => c.id !== id);
        this.saveCategories();
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }
}

// Order Management
class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
    }

    addOrder(order) {
        order.id = Date.now();
        order.status = 'pending';
        order.date = new Date().toISOString();
        this.orders.push(order);
        this.saveOrders();
    }

    updateOrderStatus(id, status) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            this.saveOrders();
        }
    }

    deleteOrder(id) {
        this.orders = this.orders.filter(o => o.id !== id);
        this.saveOrders();
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }
}

// User Management
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }

    addUser(user) {
        user.id = Date.now();
        user.role = 'user';
        user.joinDate = new Date().toISOString();
        this.users.push(user);
        this.saveUsers();
    }

    updateUser(id, updatedUser) {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUser };
            this.saveUsers();
        }
    }

    deleteUser(id) {
        this.users = this.users.filter(u => u.id !== id);
        this.saveUsers();
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
}

// Settings Management
class SettingsManager {
    constructor() {
        this.settings = JSON.parse(localStorage.getItem('settings')) || {
            siteName: 'Spicy',
            siteEmail: 'admin@spicy.com',
            currency: 'USD',
            taxRate: 10,
            shippingCost: 5
        };
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }
}

// Initialize managers
const productManager = new ProductManager();
const categoryManager = new CategoryManager();
const orderManager = new OrderManager();
const userManager = new UserManager();
const settingsManager = new SettingsManager();

// Check if user is admin
function checkAdminAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'login.html';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initDashboard();
    setupEventListeners();
    loadProducts();
    updateStats();

    // Sidebar menu item click handling
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        // Add your search logic here
        console.log('Searching for:', searchTerm);
    });

    // Notification click handling
    const notificationBell = document.querySelector('.notifications');
    notificationBell.addEventListener('click', function() {
        // Add your notification logic here
        alert('Notifications feature coming soon!');
    });

    // View button click handling
    const viewButtons = document.querySelectorAll('.btn-view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const orderId = row.querySelector('td:first-child').textContent;
            // Add your view order logic here
            alert(`Viewing order ${orderId}`);
        });
    });

    // Responsive sidebar toggle
    const toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (window.innerWidth <= 768) {
            sidebar.style.width = '70px';
            mainContent.style.marginLeft = '70px';
        } else {
            sidebar.style.width = '250px';
            mainContent.style.marginLeft = '250px';
        }
    };

    // Initial call and window resize handling
    toggleSidebar();
    window.addEventListener('resize', toggleSidebar);

    // Add smooth scrolling for sidebar links
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Update dashboard statistics
function updateStats() {
    const products = productManager.products;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Update UI
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('totalProducts').textContent = products.length;
}

// Load products into the table
function loadProducts() {
    const products = productManager.getAllProducts();
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn-view" data-id="${product.id}">View</button>
                <button class="btn-edit" data-id="${product.id}">Edit</button>
                <button class="btn-delete" data-id="${product.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('productId').value = '';
        document.getElementById('productForm').reset();
        showModal('productModal');
    });
    
    // Product form submission
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // Cancel buttons
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', hideAllModals);
    });
    
    // Product table buttons
    document.querySelector('#productsTable').addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (id) {
            if (e.target.classList.contains('btn-view')) {
                viewProduct(id);
            } else if (e.target.classList.contains('btn-edit')) {
                editProduct(id);
            } else if (e.target.classList.contains('btn-delete')) {
                deleteProduct(id);
            }
        }
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

// Show modal
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Hide all modals
function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// View product details
function viewProduct(id) {
    const product = productManager.getProductById(id);
    if (product) {
        document.getElementById('viewProductName').textContent = product.name;
        document.getElementById('viewProductDescription').textContent = product.description;
        document.getElementById('viewProductPrice').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('viewProductCategory').textContent = product.category;
        document.getElementById('viewProductStock').textContent = product.stock;
        showModal('viewProductModal');
    }
}

// Edit product
function editProduct(id) {
    const product = productManager.getProductById(id);
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImage').value = product.image;
        showModal('productModal');
    }
}

// Delete product
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        if (productManager.deleteProduct(id)) {
            loadProducts();
            updateStats();
        }
    }
}

// Handle product form submission
function handleProductSubmit(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value
    };
    
    if (productId) {
        // Update existing product
        productManager.updateProduct(productId, productData);
    } else {
        // Add new product
        productManager.addProduct(productData);
    }
    
    hideAllModals();
    loadProducts();
    updateStats();
    event.target.reset();
}

// Initialize dashboard
function initDashboard() {
    productManager.initializeProducts();
    loadProducts();
    updateStats();
}

// DOM Elements
const sidebarItems = document.querySelectorAll('.sidebar-nav li');
const sections = document.querySelectorAll('.admin-section');
const productModal = document.getElementById('productModal');
const categoryModal = document.getElementById('categoryModal');
const addProductBtn = document.getElementById('addProductBtn');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const closeModalBtns = document.querySelectorAll('.close-modal');
const productForm = document.getElementById('productForm');
const categoryForm = document.getElementById('categoryForm');
const logoutBtn = document.getElementById('logoutBtn');

// State
let currentSection = 'dashboard';
let products = [];
let categories = [];
let orders = [];
let users = [];
let settings = {
  siteName: 'Spicy',
  siteEmail: 'admin@spicy.com',
  currency: 'USD',
  taxRate: 10
};

// Navigation
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const section = item.dataset.section;
    if (section) {
      showSection(section);
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    }
  });
});

function showSection(sectionId) {
  sections.forEach(section => {
    section.classList.remove('active');
    if (section.id === sectionId) {
      section.classList.add('active');
      currentSection = sectionId;
      loadSectionData(sectionId);
    }
  });
}

// Modal Handling
function showModal(modal) {
  modal.classList.remove('hidden');
}

function hideModal(modal) {
  modal.classList.add('hidden');
}

addProductBtn.addEventListener('click', () => showModal(productModal));
addCategoryBtn.addEventListener('click', () => showModal(categoryModal));

closeModalBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    hideModal(productModal);
    hideModal(categoryModal);
  });
});

// Form Submissions
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(productForm);
  const product = {
    id: Date.now(),
    name: formData.get('productName'),
    category: formData.get('productCategory'),
    price: parseFloat(formData.get('productPrice')),
    stock: parseInt(formData.get('productStock')),
    image: formData.get('productImage'),
    description: formData.get('productDescription')
  };

  try {
    await saveProduct(product);
    products.push(product);
    updateProductsTable();
    hideModal(productModal);
    productForm.reset();
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Failed to save product. Please try again.');
  }
});

categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(categoryForm);
  const category = {
    id: Date.now(),
    name: formData.get('categoryName'),
    description: formData.get('categoryDescription')
  };

  try {
    await saveCategory(category);
    categories.push(category);
    updateCategoriesGrid();
    hideModal(categoryModal);
    categoryForm.reset();
  } catch (error) {
    console.error('Error saving category:', error);
    alert('Failed to save category. Please try again.');
  }
});

// Data Loading
async function loadSectionData(section) {
  switch (section) {
    case 'dashboard':
      await loadDashboardStats();
      break;
    case 'products':
      await loadProducts();
      break;
    case 'categories':
      await loadCategories();
      break;
    case 'orders':
      await loadOrders();
      break;
    case 'users':
      await loadUsers();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

async function loadDashboardStats() {
  try {
    const stats = await fetchDashboardStats();
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

async function loadProducts() {
  try {
    products = await fetchProducts();
    updateProductsTable();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

async function loadCategories() {
  try {
    categories = await fetchCategories();
    updateCategoriesGrid();
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function loadOrders() {
  try {
    orders = await fetchOrders();
    updateOrdersTable();
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

async function loadUsers() {
  try {
    users = await fetchUsers();
    updateUsersTable();
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function loadSettings() {
  document.getElementById('siteName').value = settings.siteName;
  document.getElementById('siteEmail').value = settings.siteEmail;
  document.getElementById('currency').value = settings.currency;
  document.getElementById('taxRate').value = settings.taxRate;
}

// Table Updates
function updateProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = products.map(product => `
    <tr>
      <td><img src="${product.image}" alt="${product.name}" width="50" height="50"></td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${product.stock}</td>
      <td>
        <button class="btn btn-primary" onclick="editProduct('${product.id}')">
          <ion-icon name="create-outline"></ion-icon>
        </button>
        <button class="btn btn-primary" onclick="deleteProduct('${product.id}')">
          <ion-icon name="trash-outline"></ion-icon>
        </button>
      </td>
    </tr>
  `).join('');
}

function updateCategoriesGrid() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = categories.map(category => `
    <div class="category-card">
      <h3>${category.name}</h3>
      <p>${category.description}</p>
      <div class="category-actions">
        <button class="btn btn-primary" onclick="editCategory(${category.id})">
          <ion-icon name="create-outline"></ion-icon>
        </button>
        <button class="btn btn-primary" onclick="deleteCategory(${category.id})">
          <ion-icon name="trash-outline"></ion-icon>
        </button>
      </div>
    </div>
  `).join('');
}

function updateOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>#${order.id}</td>
      <td>${order.customer}</td>
      <td>${formatDate(order.date)}</td>
      <td>${formatCurrency(order.total)}</td>
      <td>${order.status}</td>
      <td>
        <button class="btn btn-primary" onclick="viewOrder(${order.id})">
          <ion-icon name="eye-outline"></ion-icon>
        </button>
        <button class="btn btn-primary" onclick="updateOrderStatus(${order.id})">
          <ion-icon name="checkmark-outline"></ion-icon>
        </button>
      </td>
    </tr>
  `).join('');
}

function updateUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${formatDate(user.joinDate)}</td>
      <td>
        <button class="btn btn-primary" onclick="editUser(${user.id})">
          <ion-icon name="create-outline"></ion-icon>
        </button>
        <button class="btn btn-primary" onclick="deleteUser(${user.id})">
          <ion-icon name="trash-outline"></ion-icon>
        </button>
      </td>
    </tr>
  `).join('');
}

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: settings.currency
  }).format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// API Functions (Mock)
async function fetchDashboardStats() {
  // Simulate API call
  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
  };
}

async function fetchProducts() {
  // Simulate API call
  return [];
}

async function fetchCategories() {
  // Simulate API call
  return [];
}

async function fetchOrders() {
  // Simulate API call
  return [];
}

async function fetchUsers() {
  // Simulate API call
  return [];
}

async function saveProduct(product) {
  // Simulate API call
  return product;
}

async function saveCategory(category) {
  // Simulate API call
  return category;
}

// Event Handlers
function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    showModal(productModal);
  }
}

function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    products = products.filter(p => p.id !== id);
    updateProductsTable();
  }
}

function editCategory(id) {
  const category = categories.find(c => c.id === id);
  if (category) {
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = category.description;
    showModal(categoryModal);
  }
}

function deleteCategory(id) {
  if (confirm('Are you sure you want to delete this category?')) {
    categories = categories.filter(c => c.id !== id);
    updateCategoriesGrid();
  }
}

function viewOrder(id) {
  const order = orders.find(o => o.id === id);
  if (order) {
    // Implement order details view
    console.log('View order:', order);
  }
}

function updateOrderStatus(id) {
  const order = orders.find(o => o.id === id);
  if (order) {
    // Implement order status update
    console.log('Update order status:', order);
  }
}

function editUser(id) {
  const user = users.find(u => u.id === id);
  if (user) {
    // Implement user edit
    console.log('Edit user:', user);
  }
}

function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    users = users.filter(u => u.id !== id);
    updateUsersTable();
  }
}

// Logout
logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    window.location.href = 'login.html';
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSectionData(currentSection);
});

class DashboardManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.initializeEventListeners();
        this.updateDashboard();
    }

    initializeEventListeners() {
        // Update current date
        this.updateCurrentDate();
        setInterval(() => this.updateCurrentDate(), 60000); // Update every minute
    }

    updateCurrentDate() {
        const dateDisplay = document.getElementById('currentDate');
        const now = new Date();
        dateDisplay.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    updateDashboard() {
        this.updateStats();
        this.updateRecentOrders();
        this.updateLowStockProducts();
        this.updateRecentUsers();
    }

    updateStats() {
        // Update total products
        document.getElementById('totalProducts').textContent = this.products.length;

        // Update total orders
        document.getElementById('totalOrders').textContent = this.orders.length;

        // Update total users
        document.getElementById('totalUsers').textContent = this.users.length;

        // Update total revenue
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    }

    updateRecentOrders() {
        const tbody = document.getElementById('recentOrdersTable');
        tbody.innerHTML = '';

        // Get 5 most recent orders
        const recentOrders = [...this.orders]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        recentOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td><span class="status ${order.status}">${order.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    updateLowStockProducts() {
        const tbody = document.getElementById('lowStockTable');
        tbody.innerHTML = '';

        // Get products with stock less than 10
        const lowStockProducts = this.products
            .filter(product => product.stock < 10)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5);

        lowStockProducts.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>${product.stock}</td>
                <td><span class="status ${product.stock === 0 ? 'out-of-stock' : 'low-stock'}">${product.stock === 0 ? 'Out of Stock' : 'Low Stock'}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    updateRecentUsers() {
        const tbody = document.getElementById('recentUsersTable');
        tbody.innerHTML = '';

        // Get 5 most recent users
        const recentUsers = [...this.users]
            .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
            .slice(0, 5);

        recentUsers.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${new Date(user.joinDate).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Initialize Dashboard Manager
const dashboardManager = new DashboardManager();

// Add some CSS for the dashboard
const style = document.createElement('style');
style.textContent = `
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
    }

    .stat-card {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .stat-icon {
        width: 48px;
        height: 48px;
        background-color: var(--bittersweet);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-icon ion-icon {
        font-size: 24px;
        color: white;
    }

    .stat-info h3 {
        margin: 0;
        font-size: 0.875rem;
        color: var(--onyx);
    }

    .stat-info p {
        margin: 4px 0 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--rich-black-fogra-29);
    }

    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
    }

    .dashboard-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        overflow: hidden;
    }

    .card-header {
        padding: 16px 24px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .card-header h2 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--rich-black-fogra-29);
    }

    .view-all {
        color: var(--bittersweet);
        text-decoration: none;
        font-size: 0.875rem;
    }

    .view-all:hover {
        text-decoration: underline;
    }

    .card-content {
        padding: 24px;
    }

    .dashboard-table {
        width: 100%;
        border-collapse: collapse;
    }

    .dashboard-table th,
    .dashboard-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    .dashboard-table th {
        font-weight: 500;
        color: var(--onyx);
    }

    .status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .status.pending {
        background-color: #fff3cd;
        color: #856404;
    }

    .status.processing {
        background-color: #cce5ff;
        color: #004085;
    }

    .status.shipped {
        background-color: #d4edda;
        color: #155724;
    }

    .status.delivered {
        background-color: #d1e7dd;
        color: #0f5132;
    }

    .status.cancelled {
        background-color: #f8d7da;
        color: #721c24;
    }

    .status.in-stock {
        background-color: #d1e7dd;
        color: #0f5132;
    }

    .status.low-stock {
        background-color: #fff3cd;
        color: #856404;
    }

    .status.out-of-stock {
        background-color: #f8d7da;
        color: #721c24;
    }

    .quick-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
    }

    .quick-action {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 4px;
        color: var(--rich-black-fogra-29);
        text-decoration: none;
        transition: background-color 0.3s;
    }

    .quick-action:hover {
        background-color: #e9ecef;
    }

    .quick-action ion-icon {
        font-size: 20px;
        color: var(--bittersweet);
    }

    .date-display {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--onyx);
    }

    .date-display ion-icon {
        font-size: 20px;
    }
`;

document.head.appendChild(style);

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const orderDetailsModal = document.getElementById('order-details-modal');
const modalClose = document.querySelector('.modal-close');

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Show corresponding page
        const pageId = item.getAttribute('data-page');
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === `${pageId}-page`) {
                page.classList.add('active');
            }
        });
    });
});

// Modal Handling
function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking close button or outside modal
modalClose.addEventListener('click', () => closeModal(orderDetailsModal));
window.addEventListener('click', (e) => {
    if (e.target === orderDetailsModal) {
        closeModal(orderDetailsModal);
    }
});

// View Order Details
document.querySelectorAll('.btn-secondary').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (e.target.textContent === 'View') {
            const orderId = e.target.closest('tr').querySelector('td').textContent;
            loadOrderDetails(orderId);
            openModal(orderDetailsModal);
        }
    });
});

// Load Order Details
async function loadOrderDetails(orderId) {
    try {
        // Simulate API call
        const response = await fetch(`/api/orders/${orderId}`);
        const order = await response.json();
        
        const modalBody = orderDetailsModal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="order-info">
                <h3>Order #${order.id}</h3>
                <p><strong>Customer:</strong> ${order.customer}</p>
                <p><strong>Date:</strong> ${order.date}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
                <p><strong>Total Amount:</strong> $${order.amount}</p>
            </div>
            <div class="order-items">
                <h4>Order Items</h4>
                <table class="dashboard-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>$${item.price}</td>
                                <td>$${item.subtotal}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'processing')">Process Order</button>
                <button class="btn btn-success" onclick="updateOrderStatus('${order.id}', 'completed')">Complete Order</button>
                <button class="btn btn-danger" onclick="updateOrderStatus('${order.id}', 'cancelled')">Cancel Order</button>
            </div>
        `;
    } catch (error) {
        console.error('Error loading order details:', error);
        // Show error message to user
    }
}

// Update Order Status
async function updateOrderStatus(orderId, status) {
    try {
        // Simulate API call
        await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        // Refresh order details
        loadOrderDetails(orderId);
        
        // Update order status in the table
        const orderRow = document.querySelector(`tr[data-order-id="${orderId}"]`);
        if (orderRow) {
            const statusCell = orderRow.querySelector('.status-badge');
            statusCell.className = `status-badge status-${status}`;
            statusCell.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        // Show error message to user
    }
}

// Quick Actions
document.querySelectorAll('.quick-action').forEach(action => {
    action.addEventListener('click', (e) => {
        e.preventDefault();
        const actionType = action.textContent.trim();
        
        switch (actionType) {
            case 'Add New Product':
                // Navigate to products page and show add product form
                document.querySelector('[data-page="products"]').click();
                // Show add product form
                break;
            case 'Manage Orders':
                document.querySelector('[data-page="orders"]').click();
                break;
            case 'Add New User':
                document.querySelector('[data-page="users"]').click();
                // Show add user form
                break;
            case 'System Settings':
                document.querySelector('[data-page="settings"]').click();
                break;
        }
    });
});

// Refresh Data
document.querySelector('.btn-primary').addEventListener('click', async () => {
    try {
        // Show loading state
        const btn = document.querySelector('.btn-primary');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<ion-icon name="reload-outline" class="rotating"></ion-icon> Refreshing...';
        
        // Simulate API calls to refresh data
        await Promise.all([
            fetch('/api/dashboard/stats'),
            fetch('/api/dashboard/recent-orders'),
            fetch('/api/dashboard/popular-products')
        ]);
        
        // Update dashboard data
        // ... (implement data refresh logic)
        
        // Restore button state
        btn.innerHTML = originalText;
    } catch (error) {
        console.error('Error refreshing data:', error);
        // Show error message to user
    }
});

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Load initial dashboard data
    // ... (implement initial data loading)
}); 