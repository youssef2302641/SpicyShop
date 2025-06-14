document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const usersTable = document.querySelector('.users-table tbody');
    const roleFilter = document.getElementById('roleFilter');
    const addUserBtn = document.querySelector('.add-user-btn');
    const addUserModal = document.getElementById('addUserModal');
    const addUserForm = document.getElementById('addUserForm');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelAddUserBtn = document.getElementById('cancelAddUser');

    // Event Listeners
    roleFilter.addEventListener('change', filterUsers);
    addUserBtn.addEventListener('click', showAddUserModal);
    closeModalBtn.addEventListener('click', hideAddUserModal);
    cancelAddUserBtn.addEventListener('click', hideAddUserModal);
    addUserForm.addEventListener('submit', handleAddUser);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addUserModal) {
            hideAddUserModal();
        }
    });

    // Event delegation for edit and delete buttons
    usersTable.addEventListener('click', function(e) {
        const target = e.target;
        if (target.classList.contains('edit-user')) {
            const userId = target.dataset.userId;
            handleEdit(userId);
        } else if (target.classList.contains('delete-user')) {
            const userId = target.dataset.userId;
            handleDelete(userId);
        }
    });

    // Functions
    function filterUsers() {
        const selectedRole = roleFilter.value;
        const rows = usersTable.querySelectorAll('tr');

        rows.forEach(row => {
            const roleCell = row.querySelector('td:nth-child(3)');
            if (selectedRole === 'all' || roleCell.textContent.toLowerCase() === selectedRole) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function showAddUserModal() {
        addUserModal.style.display = 'block';
        addUserForm.reset();
    }

    function hideAddUserModal() {
        addUserModal.style.display = 'none';
    }

    async function handleAddUser(e) {
        e.preventDefault();
        
        const formData = new FormData(addUserForm);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            status: formData.get('status')
        };

        try {
            console.log('Sending user data:', { ...userData, password: '[REDACTED]' });
            
            // Log the URL we're sending to
            const url = '/admin/api/users';
            console.log('Sending request to:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            // Log the response status and headers
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            let data;
            const contentType = response.headers.get('content-type');
            console.log('Response content type:', contentType);
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log('Response data:', data);
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Failed to add user');
            }

            const newUser = data;
            
            // Add the new user to the table
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${newUser.firstName} ${newUser.lastName}</td>
                <td>${newUser.email}</td>
                <td>
                    <span class="status-badge ${newUser.role.toLowerCase()}">
                        ${newUser.role}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${newUser.status.toLowerCase()}">
                        ${newUser.status}
                    </span>
                </td>
                <td>${new Date(newUser.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit-user" data-user-id="${newUser._id}" title="Edit User">
                            Edit
                        </button>
                        <button class="btn-icon delete-user" data-user-id="${newUser._id}" title="Delete User">
                            Delete
                        </button>
                    </div>
                </td>
            `;
            usersTable.appendChild(newRow);

            // Hide modal and show success message
            hideAddUserModal();
            alert('User added successfully!');
        } catch (error) {
            console.error('Error adding user:', error);
            alert(`Failed to add user: ${error.message}`);
        }
    }

    function handleEdit(userId) {
        console.log('Edit user:', userId);
        // TODO: Implement edit functionality
    }

    function handleDelete(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            console.log('Delete user:', userId);
            // TODO: Implement delete functionality
        }
    }
}); 