class OrderManager {
    constructor() {
        this.orders = [];
        this.initializeEventListeners();
        this.loadOrders();
    }

    initializeEventListeners() {
        // Search functionality
        document.getElementById('orderSearch').addEventListener('input', () => this.filterOrders());
        
        // Status filter
        document.getElementById('statusFilter').addEventListener('change', () => this.filterOrders());
        
        // Sort functionality
        document.getElementById('sortBy').addEventListener('change', () => this.filterOrders());
    }

    loadOrders() {
        // Get orders from localStorage (set when purchase is made in cart.html)
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.updateOrdersTable();
    }

    filterOrders() {
        const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;
        
        let filteredOrders = this.orders.filter(order => {
            const matchesSearch = 
                order.id.toLowerCase().includes(searchTerm) ||
                order.customerEmail.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        
        // Sort orders
        filteredOrders.sort((a, b) => {
            switch(sortBy) {
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'amount':
                    return b.total - a.total;
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });
        
        this.updateOrdersTable(filteredOrders);
    }

    updateOrdersTable(orders = this.orders) {
        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerEmail}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>
                    <span class="status ${order.status.toLowerCase()}">${order.status}</span>
                </td>
                <td>
                    <button class="btn btn-primary" onclick="orderManager.viewOrderDetails('${order.id}')">
                        <ion-icon name="eye-outline"></ion-icon>
                    </button>
                    <button class="btn btn-primary" onclick="orderManager.updateOrderStatus('${order.id}')">
                        <ion-icon name="create-outline"></ion-icon>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.getElementById('orderDetailsModal');
        const modalContent = document.getElementById('orderDetailsContent');
        
        modalContent.innerHTML = `
            <h3>Order #${order.id}</h3>
            <div class="order-info">
                <p><strong>Customer:</strong> ${order.customerEmail}</p>
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            </div>
            <div class="order-items">
                <h4>Items</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>$${item.price.toFixed(2)}</td>
                                <td>${item.quantity}</td>
                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    updateOrderStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const newStatus = prompt('Enter new status (Pending, Processing, Shipped, Delivered):', order.status);
        if (!newStatus) return;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        if (!validStatuses.includes(newStatus)) {
            alert('Invalid status. Please use one of: ' + validStatuses.join(', '));
            return;
        }

        order.status = newStatus;
        localStorage.setItem('orders', JSON.stringify(this.orders));
        this.updateOrdersTable();
    }

    closeOrderDetails() {
        const modal = document.getElementById('orderDetailsModal');
        modal.style.display = 'none';
    }
}

// Initialize the order manager
const orderManager = new OrderManager(); 