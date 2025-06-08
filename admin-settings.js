class SettingsManager {
    constructor() {
        this.settings = JSON.parse(localStorage.getItem('settings')) || this.getDefaultSettings();
        this.initializeEventListeners();
        this.loadSettings();
    }

    getDefaultSettings() {
        return {
            siteName: "Spicy",
            siteEmail: "contact@spicy.com",
            siteDescription: "Your one-stop shop for premium footwear",
            currency: "USD",
            taxRate: 8.5,
            shippingCost: 5.99,
            facebookUrl: "",
            instagramUrl: "",
            twitterUrl: "",
            primaryColor: "#ff4d4d",
            secondaryColor: "#333333",
            logoUrl: "images/logo.svg"
        };
    }

    initializeEventListeners() {
        // Settings Form Submit
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        // Color Input Changes
        document.getElementById('primaryColor').addEventListener('input', (e) => {
            this.updateColorPreview('primaryColor', e.target.value);
        });

        document.getElementById('secondaryColor').addEventListener('input', (e) => {
            this.updateColorPreview('secondaryColor', e.target.value);
        });
    }

    loadSettings() {
        const form = document.getElementById('settingsForm');
        
        // Load all settings into form
        Object.keys(this.settings).forEach(key => {
            const element = form.elements[key];
            if (element) {
                element.value = this.settings[key];
            }
        });

        // Update color previews
        this.updateColorPreview('primaryColor', this.settings.primaryColor);
        this.updateColorPreview('secondaryColor', this.settings.secondaryColor);
    }

    updateColorPreview(colorId, value) {
        const colorInput = document.getElementById(colorId);
        const preview = document.createElement('div');
        preview.className = 'color-preview';
        preview.style.backgroundColor = value;

        // Remove existing preview if any
        const existingPreview = colorInput.parentElement.querySelector('.color-preview');
        if (existingPreview) {
            existingPreview.remove();
        }

        colorInput.parentElement.appendChild(preview);
    }

    saveSettings() {
        const form = document.getElementById('settingsForm');
        const formData = new FormData(form);
        
        // Convert FormData to object
        const newSettings = {};
        formData.forEach((value, key) => {
            newSettings[key] = value;
        });

        // Update settings
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('settings', JSON.stringify(this.settings));

        // Show success message
        this.showNotification('Settings saved successfully!');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <ion-icon name="checkmark-circle-outline"></ion-icon>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Helper method to get a specific setting
    getSetting(key) {
        return this.settings[key];
    }

    // Helper method to update a specific setting
    updateSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }
}

// Initialize Settings Manager
const settingsManager = new SettingsManager();

// Add some CSS for the color preview and notification
const style = document.createElement('style');
style.textContent = `
    .color-preview {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        margin-left: 8px;
        display: inline-block;
        vertical-align: middle;
        border: 1px solid #ddd;
    }

    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background-color: #4CAF50;
        color: white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .notification ion-icon {
        font-size: 20px;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .settings-section {
        background: white;
        padding: 24px;
        border-radius: 8px;
        margin-bottom: 24px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .settings-section h2 {
        margin-top: 0;
        margin-bottom: 20px;
        color: var(--rich-black-fogra-29);
        font-size: 1.5rem;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: var(--rich-black-fogra-29);
        font-weight: 500;
    }

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="url"],
    .form-group input[type="number"],
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    .form-group input[type="color"] {
        width: 50px;
        height: 40px;
        padding: 2px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .form-actions {
        margin-top: 32px;
        text-align: right;
    }

    .btn-primary {
        padding: 12px 24px;
        background-color: var(--bittersweet);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .btn-primary:hover {
        background-color: var(--salmon);
    }
`;

document.head.appendChild(style); 