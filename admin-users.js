class UserManager {
    constructor() {
        this.users = [];
        this.initializeEventListeners();
        this.loadUsers();
    }

    initializeEventListeners() {
        // Search functionality
        document.getElementById('userSearch').addEventListener('input', () => this.filterUsers());
        
        // Role filter
        document.getElementById('roleFilter').addEventListener('change', () => this.filterUsers());
        
        // Sort functionality
        document.getElementById('sortBy').addEventListener('change', () => this.filterUsers());
    }

    loadUsers() {
        // Get users from localStorage
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Add admin user if not exists
        if (!this.users.some(user => user.role === 'admin')) {
            this.users.push({
                id: 'admin-1',
                email: 'admin@drop1.com',
                password: 'admin123', // In a real app, this would be hashed
                role: 'admin',
                date: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(this.users));
        }
        
        this.updateUsersTable();
    }

    filterUsers() {
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        const roleFilter = document.getElementById('roleFilter').value;
        const sortBy = document.getElementById('sortBy').value;
        
        let filteredUsers = this.users.filter(user => {
            const matchesSearch = user.email.toLowerCase().includes(searchTerm);
            const matchesRole = !roleFilter || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
        
        // Sort users
        filteredUsers.sort((a, b) => {
            switch(sortBy) {
                case 'email':
                    return a.email.localeCompare(b.email);
                case 'role':
                    return a.role.localeCompare(b.role);
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                default:
                    return 0;
            }
        });
        
        this.updateUsersTable(filteredUsers);
    }

    updateUsersTable(users = this.users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${new Date(user.date).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-primary" onclick="userManager.viewUserDetails('${user.id}')">
                        <ion-icon name="eye-outline"></ion-icon>
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="btn btn-primary" onclick="userManager.deleteUser('${user.id}')">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    viewUserDetails(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = document.getElementById('userDetailsModal');
        const modalContent = document.getElementById('userDetailsContent');
        
        modalContent.innerHTML = `
            <h3>User Details</h3>
            <div class="user-info">
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Joined:</strong> ${new Date(user.date).toLocaleString()}</p>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user || user.role === 'admin') return;

        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(this.users));
            this.updateUsersTable();
        }
    }

    closeUserDetails() {
        const modal = document.getElementById('userDetailsModal');
        modal.style.display = 'none';
    }
}

// Initialize the user manager
const userManager = new UserManager(); 