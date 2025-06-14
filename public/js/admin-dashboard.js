// Admin Dashboard Functions
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        new Tooltip(tooltip);
    });

    // Initialize all modals
    
    // Initialize all tabs
    const tabGroups = document.querySelectorAll('.tab-group');
    tabGroups.forEach(tabGroup => {
        new TabGroup(tabGroup);
    });

    // Initialize all dropdowns
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        new Dropdown(dropdown);
    });

    // Initialize all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Initialize all delete buttons
    const deleteButtons = document.querySelectorAll('[data-delete]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDelete);
    });

    // Initialize all edit buttons
    const editButtons = document.querySelectorAll('[data-edit]');
    editButtons.forEach(button => {
        button.addEventListener('click', handleEdit);
    });

    // Initialize all view buttons
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
        button.addEventListener('click', handleView);
    });

    // Initialize dashboard manager
    window.dashboardManager = new DashboardManager();
});

// Form submission handler
async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const url = form.action;
    const method = form.method || 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        
        // Refresh the page or update the UI
        if (form.dataset.refresh) {
            window.location.reload();
        } else {
            updateUI(result);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Delete handler
async function handleDelete(event) {
    event.preventDefault();
    const button = event.target;
    const url = button.dataset.delete;
    const type = button.dataset.type;
    const id = button.dataset.id;

    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        
        // Remove the element from the UI
        const element = button.closest(`[data-${type}-id="${id}"]`);
        if (element) {
            element.remove();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Edit handler
async function handleEdit(event) {
    event.preventDefault();
    const button = event.target;
    const url = button.dataset.edit;
    const type = button.dataset.type;
    const id = button.dataset.id;

    console.log(`Edit ${type} with ID: ${id}`);
}

// View handler
async function handleView(event) {
    event.preventDefault();
    const button = event.target;
    const url = button.dataset.view;
    const type = button.dataset.type;
    const id = button.dataset.id;

    console.log(`View ${type} with ID: ${id}`);
}

// UI update handler
function updateUI(data) {
    const type = data.type || 'item';
    const id = data._id;
    const element = document.querySelector(`[data-${type}-id="${id}"]`);
    
    if (element) {
        // Update element with new data
        Object.keys(data).forEach(key => {
            const field = element.querySelector(`[data-field="${key}"]`);
            if (field) {
                field.textContent = data[key];
            }
        });
    }
}

// Notification handler
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <ion-icon name="${type === 'success' ? 'checkmark-circle' : 'alert-circle'}"></ion-icon>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Modal class

// TabGroup class
class TabGroup {
    constructor(element) {
        this.element = element;
        this.tabs = element.querySelectorAll('.tab');
        this.panels = element.querySelectorAll('.tab-panel');
        
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });
    }
    
    switchTab(selectedTab) {
        // Remove active class from all tabs and panels
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.panels.forEach(panel => panel.classList.remove('active'));
        
        // Add active class to selected tab and panel
        selectedTab.classList.add('active');
        const panel = this.element.querySelector(selectedTab.dataset.tab);
        if (panel) {
            panel.classList.add('active');
        }
    }
}

// Dropdown class
class Dropdown {
    constructor(element) {
        this.element = element;
        this.trigger = element.querySelector('.dropdown-trigger');
        this.menu = element.querySelector('.dropdown-menu');
        
        this.trigger?.addEventListener('click', () => this.toggle());
        
        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });
    }
    
    toggle() {
        this.menu.classList.toggle('active');
    }
    
    close() {
        this.menu.classList.remove('active');
    }
}

// Tooltip class
class Tooltip {
    constructor(element) {
        this.element = element;
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.textContent = element.dataset.tooltip;
        
        this.element.addEventListener('mouseenter', () => this.show());
        this.element.addEventListener('mouseleave', () => this.hide());
    }
    
    show() {
        document.body.appendChild(this.tooltip);
        const rect = this.element.getBoundingClientRect();
        this.tooltip.style.top = rect.bottom + 'px';
        this.tooltip.style.left = rect.left + (rect.width / 2) - (this.tooltip.offsetWidth / 2) + 'px';
    }
    
    hide() {
        this.tooltip.remove();
    }
}

// Dashboard Management
class DashboardManager {
    constructor() {
        this.initializeEventListeners();
        this.updateCurrentDate();
        this.updateDashboard();
    }

    initializeEventListeners() {
        // Sidebar menu item click handling
        const menuItems = document.querySelectorAll('.sidebar-menu li');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Notification click handling
        const notificationBell = document.qerySelector('.notifications');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => this.handleNotifications());
        }

        // Responsive sidebar toggle
        const toggleBtn = document.querySelector('.toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }
    }

    updateCurrentDate() {
        const dateElement = document.querySelector('.current-date');
        if (dateElement) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    updateDashboard() {
        this.updateStats();
        this.updateRecentOrders();
        this.updateLowStockProducts();
        this.updateRecentUsers();
    }

    async updateStats() {
        try {
            const response = await fetch('/admin/api/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const stats = await response.json();
            
            // Update stats in the UI
            Object.entries(stats).forEach(([key, value]) => {
                const element = document.querySelector(`[data-stat="${key}"]`);
                if (element) element.textContent = value;
            });
        } catch (error) {
            console.error('Error updating stats:', error);
            this.showNotification('Error updating dashboard stats', 'error');
        }
    }

    async updateRecentOrders() {
        try {
            const response = await fetch('/admin/api/orders/recent');
            if (!response.ok) throw new Error('Failed to fetch recent orders');
            const orders = await response.json();
            
            const ordersList = document.querySelector('.recent-orders-list');
            if (ordersList) {
                ordersList.innerHTML = orders.map(order => `
                    <div class="order-item">
                        <div class="order-info">
                            <span class="order-id">#${order.id}</span>
                            <span class="order-date">${this.formatDate(order.date)}</span>
                        </div>
                        <div class="order-status ${order.status}">${order.status}</div>
                        <div class="order-amount">$${order.total.toFixed(2)}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error updating recent orders:', error);
        }
    }

    async updateLowStockProducts() {
        try {
            const response = await fetch('/admin/api/products/low-stock');
            if (!response.ok) throw new Error('Failed to fetch low stock products');
            const products = await response.json();
            
            const productsList = document.querySelector('.low-stock-list');
            if (productsList) {
                productsList.innerHTML = products.map(product => `
                    <div class="product-item">
                        <img src="${product.image}" alt="${product.name}" class="product-thumbnail">
                        <div class="product-info">
                            <span class="product-name">${product.name}</span>
                            <span class="stock-count">${product.stock} left</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error updating low stock products:', error);
        }
    }

    async updateRecentUsers() {
        try {
            const response = await fetch('/admin/api/users/recent');
            if (!response.ok) throw new Error('Failed to fetch recent users');
            const users = await response.json();
            
            const usersList = document.querySelector('.recent-users-list');
            if (usersList) {
                usersList.innerHTML = users.map(user => `
                    <div class="user-item">
                        <div class="user-info">
                            <span class="user-email">${user.email}</span>
                            <span class="user-role">${user.role}</span>
                        </div>
                        <span class="join-date">${this.formatDate(user.joinDate)}</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error updating recent users:', error);
        }
    }

    handleNotifications() {
        // Implement notifications functionality
        this.showNotification('Notifications feature coming soon!', 'info');
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

class AdminDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.loadDashboardStats();
        this.setupCharts();
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('/api/admin/dashboard/stats');
            const stats = await response.json();
            this.updateDashboardStats(stats);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('totalSales').textContent = `$${stats.totalSales.toFixed(2)}`;
        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalUsers').textContent = stats.totalUsers;
    }

    setupCharts() {
        this.setupSalesChart();
        this.setupOrdersChart();
        this.setupProductsChart();
    }

    setupSalesChart() {
        const ctx = document.getElementById('salesChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: '#4CAF50',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    setupOrdersChart() {
        const ctx = document.getElementById('ordersChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
                datasets: [{
                    data: [12, 19, 3, 5],
                    backgroundColor: ['#FFC107', '#2196F3', '#9C27B0', '#4CAF50']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    setupProductsChart() {
        const ctx = document.getElementById('productsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Spices', 'Sauces', 'Herbs', 'Seasonings'],
                datasets: [{
                    label: 'Stock Level',
                    data: [65, 59, 80, 81],
                    backgroundColor: '#2196F3'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

const adminDashboard = new AdminDashboard(); 