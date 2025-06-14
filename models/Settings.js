const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: [true, 'Site name is required'],
        trim: true
    },
    siteDescription: {
        type: String,
        trim: true
    },
    siteEmail: {
        type: String,
        required: [true, 'Site email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    currency: {
        type: String,
        default: 'USD'
    },
    taxRate: {
        type: Number,
        default: 0,
        min: [0, 'Tax rate cannot be negative']
    },
    shippingCost: {
        type: Number,
        default: 0,
        min: [0, 'Shipping cost cannot be negative']
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    },
    contactInfo: {
        phone: String,
        address: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    maintenanceMode: {
        enabled: {
            type: Boolean,
            default: false
        },
        message: String
    },
    seo: {
        title: String,
        description: String,
        keywords: String
    },
    homepageBanner: {
        title: String,
        subtitle: String,
        image: String,
        link: String
    },
    theme: {
        primaryColor: {
            type: String,
            default: '#ff4d4d'
        },
        secondaryColor: {
            type: String,
            default: '#333333'
        },
        fontFamily: {
            type: String,
            default: 'Arial, sans-serif'
        }
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Method to check if maintenance mode is enabled
settingsSchema.methods.isMaintenanceMode = function() {
    return this.maintenanceMode.enabled;
};

// Method to enable maintenance mode
settingsSchema.methods.enableMaintenanceMode = function(message) {
    this.maintenanceMode.enabled = true;
    if (message) {
        this.maintenanceMode.message = message;
    }
    return this.save();
};

// Method to disable maintenance mode
settingsSchema.methods.disableMaintenanceMode = function() {
    this.maintenanceMode.enabled = false;
    this.maintenanceMode.message = '';
    return this.save();
};

// Static method to get current settings
settingsSchema.statics.getCurrent = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            siteName: 'Spicy',
            siteEmail: 'contact@spicy.com',
            siteDescription: 'Your one-stop shop for premium Hoodie'
        });
    }
    return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(updates, userId) {
    const settings = await this.findOne();
    if (!settings) {
        updates.updatedBy = userId;
        return this.create(updates);
    }
    
    Object.assign(settings, updates);
    settings.updatedBy = userId;
    return settings.save();
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings; 