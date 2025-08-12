const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  general: {
    siteName: { type: String, default: 'E-commerce Store' },
    siteDescription: { type: String, default: 'Your premier online shopping destination' },
    contactEmail: { type: String, default: 'contact@example.com' },
    contactPhone: { type: String, default: '+1 (555) 123-4567' },
    address: {
      street: { type: String, default: '123 Main Street' },
      city: { type: String, default: 'New York' },
      state: { type: String, default: 'NY' },
      postalCode: { type: String, default: '10001' },
      country: { type: String, default: 'United States' }
    },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    timezone: { type: String, default: 'America/New_York' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' }
  },

  // SEO Settings
  seo: {
    metaTitle: { type: String, default: 'E-commerce Store - Shop Online' },
    metaDescription: { type: String, default: 'Discover amazing products at great prices. Fast shipping and excellent customer service.' },
    metaKeywords: { type: String, default: 'ecommerce, online shopping, products, deals' },
    googleAnalyticsId: { type: String, default: '' },
    googleTagManagerId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' },
    bingWebmasterToolsId: { type: String, default: '' },
    googleSearchConsoleCode: { type: String, default: '' },
    bingSearchConsoleCode: { type: String, default: '' },
    robotsTxt: { 
      type: String, 
      default: `User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /

Sitemap: https://yoursite.com/sitemap.xml`
    },
    sitemapEnabled: { type: Boolean, default: true },
    schemaMarkup: {
      organizationName: { type: String, default: 'E-commerce Store' },
      organizationType: { type: String, default: 'Organization' },
      logo: { type: String, default: '' },
      contactPoint: {
        telephone: { type: String, default: '+1-555-123-4567' },
        contactType: { type: String, default: 'customer service' }
      }
    }
  },

  // Payment Settings
  payment: {
    paypalEmail: { type: String, default: '' },
    stripePublishableKey: { type: String, default: '' },
    stripeSecretKey: { type: String, default: '' },
    paymentMethods: {
      paypal: { type: Boolean, default: true },
      stripe: { type: Boolean, default: true },
      creditCard: { type: Boolean, default: true },
      cash: { type: Boolean, default: false }
    },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 10 },
    shippingRates: {
      domestic: { type: Number, default: 10 },
      international: { type: Number, default: 25 },
      freeShippingThreshold: { type: Number, default: 100 }
    }
  },

  // API & Integrations
  api: {
    webhooks: [{
      id: { type: Number },
      name: { type: String },
      url: { type: String },
      events: [{ type: String }]
    }],
    apiKeys: [{
      id: { type: Number },
      name: { type: String },
      key: { type: String },
      description: { type: String }
    }],
    integrations: {
      mailchimp: {
        enabled: { type: Boolean, default: false },
        apiKey: { type: String, default: '' },
        listId: { type: String, default: '' }
      },
      sendgrid: {
        enabled: { type: Boolean, default: false },
        apiKey: { type: String, default: '' },
        fromEmail: { type: String, default: '' }
      },
      twilio: {
        enabled: { type: Boolean, default: false },
        accountSid: { type: String, default: '' },
        authToken: { type: String, default: '' },
        phoneNumber: { type: String, default: '' }
      }
    }
  },

  // Gallery & Media
  gallery: {
    carousels: [{
      id: { type: Number },
      name: { type: String },
      images: [{ type: String }],
      autoPlay: { type: Boolean, default: true },
      interval: { type: Number, default: 5000 }
    }],
    allowedFileTypes: { type: [String], default: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
    maxFileSize: { type: Number, default: 5 }, // MB
    imageQuality: { type: Number, default: 80 },
    autoOptimize: { type: Boolean, default: true }
  },

  // Social Media
  social: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    pinterest: { type: String, default: '' }
  },

  // Header Scripts
  scripts: {
    headerScripts: { type: String, default: '' },
    footerScripts: { type: String, default: '' },
    customCSS: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Static method to get or create settings
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(section, data) {
  let settings = await this.getSettings();
  if (section) {
    settings[section] = { ...settings[section].toObject(), ...data };
  } else {
    Object.keys(data).forEach(key => {
      settings[key] = { ...settings[key].toObject(), ...data[key] };
    });
  }
  return await settings.save();
};

module.exports = mongoose.model('Settings', settingsSchema);

