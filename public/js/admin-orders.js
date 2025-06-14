class AdminOrders {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    init() {
        this.loadOrders();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterOrders());
    }
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/orders');
            this.orders = await response.json();
            this.filteredOrders = [...this.orders];
            this.renderOrders();
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    filterOrders() {
        const statusFilter = document.getElementById('statusFilter');
        const selectedStatus = statusFilter.value;
        
        this.filteredOrders = this.orders.filter(order => {
            if (selectedStatus === 'all') return true;
            return order.status === selectedStatus;
        });
        
        this.currentPage = 1;
        this.renderOrders();
    }

    renderOrders() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const ordersToShow = this.filteredOrders.slice(startIndex, endIndex);

        const tbody = document.querySelector('#ordersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = ordersToShow.map(order => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${order.customerName}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>
                    <span class="status-badge ${order.status.toLowerCase()}">
                        ${order.status}
                    </span>
                </td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon" onclick="adminOrders.viewOrder('${order._id}')">
                        <ion-icon name="eye-outline"></ion-icon>
                    </button>
                        <button class="btn btn-icon" onclick="adminOrders.updateStatus('${order._id}')">
                        <ion-icon name="create-outline"></ion-icon>
                    </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        let paginationHTML = `
            <button class="btn btn-icon" ${this.currentPage === 1 ? 'disabled' : ''} onclick="adminOrders.changePage(${this.currentPage - 1})">
                <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="btn ${i === this.currentPage ? 'btn-primary' : ''}" onclick="adminOrders.changePage(${i})">
                    ${i}
                </button>
        `;
        }

        paginationHTML += `
            <button class="btn btn-icon" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="adminOrders.changePage(${this.currentPage + 1})">
                <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.filteredOrders.length / this.itemsPerPage)) return;
        this.currentPage = page;
        this.renderOrders();
    }

    async viewOrder(orderId) {
        console.log(`View order with ID: ${orderId}`);
    }

    async updateStatus(orderId) {
        console.log(`Update status for order with ID: ${orderId}`);
    }
}

const adminOrders = new AdminOrders(); 