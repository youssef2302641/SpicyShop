document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing settings form');
    // Initialize settings form
    const settingsForm = document.getElementById('settingsForm');
    console.log('Settings form found:', settingsForm);
    
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
        console.log('Submit event listener added to settings form');
    }

    // Load current settings
    loadSettings();
});

// Load settings
async function loadSettings() {
    try {
        console.log('Loading settings...');
        const response = await fetch('/admin/api/settings');
        console.log('Settings response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to fetch settings');
        }
        
        const settings = await response.json();
        console.log('Loaded settings:', settings);
        updateSettingsForm(settings);
    } catch (error) {
        console.error('Error loading settings:', error);
        alert('Error loading settings: ' + error.message);
    }
}

// Update settings form
function updateSettingsForm(settings) {
    const form = document.getElementById('settingsForm');
    if (!form) {
        console.error('Settings form not found');
        return;
    }

    console.log('Updating form with settings:', settings);

    // Populate form with settings data
    Object.keys(settings).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = settings[key];
            } else {
                input.value = settings[key];
            }
        }
    });

    // Handle nested objects
    if (settings.socialMedia) {
        Object.keys(settings.socialMedia).forEach(key => {
            const input = form.querySelector(`[name="socialMedia.${key}"]`);
            if (input) {
                input.value = settings.socialMedia[key];
            }
        });
    }

    if (settings.theme) {
        Object.keys(settings.theme).forEach(key => {
            const input = form.querySelector(`[name="theme.${key}"]`);
            if (input) {
                input.value = settings.theme[key];
            }
        });
    }
}

// Handle settings form submission
async function handleSettingsSubmit(event) {
    event.preventDefault();
    console.log('Settings form submitted');
    
    const form = event.target;
    const formData = new FormData(form);
    const data = {};

    // Process form data
    for (const [key, value] of formData.entries()) {
        console.log('Processing form field:', key, value);
        if (key.includes('.')) {
            const [parent, child] = key.split('.');
            if (!data[parent]) {
                data[parent] = {};
            }
            data[parent][child] = value;
        } else {
            data[key] = value;
        }
    }

    console.log('Processed form data:', data);

    try {
        const response = await fetch('/admin/api/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Save settings response status:', response.status);

        if (!response.ok) {
            throw new Error('Failed to save settings');
        }

        const result = await response.json();
        console.log('Settings saved successfully:', result);
        
        alert('Settings saved successfully!');
        
        // Reload settings to ensure everything is in sync
        loadSettings();
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings: ' + error.message);
    }
}

// Handle image upload
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/admin/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const result = await response.json();
        const input = event.target;
        const preview = input.nextElementSibling;
        
        if (preview && preview.tagName === 'IMG') {
            preview.src = result.url;
            preview.style.display = 'block';
        }

        // Update the corresponding hidden input with the image URL
        const hiddenInput = document.getElementById(`${input.id}-url`);
        if (hiddenInput) {
            hiddenInput.value = result.url;
        }
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

// Handle maintenance mode toggle
function handleMaintenanceMode(event) {
    const checkbox = event.target;
    const messageInput = document.getElementById('maintenanceMessage');
    
    if (messageInput) {
        messageInput.disabled = !checkbox.checked;
        if (!checkbox.checked) {
            messageInput.value = '';
        }
    }
}

// Initialize image upload handlers
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', handleImageUpload);
});

// Initialize maintenance mode handler
const maintenanceCheckbox = document.getElementById('maintenanceMode');
if (maintenanceCheckbox) {
    maintenanceCheckbox.addEventListener('change', handleMaintenanceMode);
} 