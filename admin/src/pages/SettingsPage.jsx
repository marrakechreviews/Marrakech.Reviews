import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { 
  Settings, 
  Globe, 
  Search, 
  CreditCard, 
  Code, 
  Webhook, 
  Image as ImageIcon,
  Save,
  Upload,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Building,
  Palette,
  Monitor,
  Smartphone,
  Zap,
  Shield,
  Database,
  Link,
  FileText,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();


  // Fetch settings from API
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.getSettings(),
    select: (response) => response.data.data
  });

  const [settings, setSettings] = useState({
    // Default settings structure (will be overridden by API data)
    general: {
      siteName: 'E-commerce Store',
      siteDescription: 'Your premier online shopping destination',
      contactEmail: 'contact@example.com',
      contactPhone: '+1 (555) 123-4567',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States'
      },
      logo: '',
      favicon: '',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en'
    },
    seo: {
      metaTitle: 'E-commerce Store - Shop Online',
      metaDescription: 'Discover amazing products at great prices. Fast shipping and excellent customer service.',
      metaKeywords: 'ecommerce, online shopping, products, deals',
      googleAnalyticsId: '',
      googleTagManagerId: '',
      facebookPixelId: '',
      bingWebmasterToolsId: '',
      googleSearchConsoleCode: '',
      bingSearchConsoleCode: '',
      robotsTxt: `User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /

Sitemap: https://yoursite.com/sitemap.xml`,
      sitemapEnabled: true,
      schemaMarkup: {
        organizationName: 'E-commerce Store',
        organizationType: 'Organization',
        logo: '',
        contactPoint: {
          telephone: '+1-555-123-4567',
          contactType: 'customer service'
        }
      }
    },
    payment: {
      paypalEmail: '',
      stripePublishableKey: '',
      stripeSecretKey: '',
      paymentMethods: {
        paypal: true,
        stripe: true,
        creditCard: true,
        cash: false
      },
      currency: 'USD',
      taxRate: 10,
      shippingRates: {
        domestic: 10,
        international: 25,
        freeShippingThreshold: 100
      }
    },
    api: {
      webhooks: [],
      apiKeys: [],
      integrations: {
        mailchimp: {
          enabled: false,
          apiKey: '',
          listId: ''
        },
        sendgrid: {
          enabled: false,
          apiKey: '',
          fromEmail: ''
        },
        twilio: {
          enabled: false,
          accountSid: '',
          authToken: '',
          phoneNumber: ''
        }
      }
    },
    gallery: {
      carousels: [],
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      maxFileSize: 5,
      imageQuality: 80,
      autoOptimize: true
    },
    social: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
      pinterest: ''
    },
    scripts: {
      headerScripts: '',
      footerScripts: '',
      customCSS: ''
    }
  });

  // Update local settings when API data is loaded
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: ({ section, data }) => settingsAPI.updateSettingsSection(section, data),
    onSuccess: (response, variables) => {
      toast.success(`${variables.section.charAt(0).toUpperCase() + variables.section.slice(1)} settings saved successfully`);
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      console.error('Settings save error:', error);
      toast.error('Failed to save settings: ' + (error.response?.data?.message || error.message));
    },
  });

  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] });
  const [newApiKey, setNewApiKey] = useState({ name: '', key: '', description: '' });
  const [newCarousel, setNewCarousel] = useState({ name: '', images: [], autoPlay: true, interval: 5000 });
  const [showSecrets, setShowSecrets] = useState({});

  const handleSettingChange = useCallback((section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const handleNestedSettingChange = useCallback((section, parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [field]: value
        }
      }
    }));
  }, []);

  const handleSaveSettings = useCallback((section) => {
    saveSettingsMutation.mutate({ section, data: settings[section] });
  }, [settings, saveSettingsMutation]);

  const addWebhook = useCallback(() => {
    if (newWebhook.name && newWebhook.url) {
      setSettings(prev => ({
        ...prev,
        api: {
          ...prev.api,
          webhooks: [...prev.api.webhooks, { ...newWebhook, id: Date.now() }]
        }
      }));
      setNewWebhook({ name: '', url: '', events: [] });
      toast.success('Webhook added successfully');
    }
  }, [newWebhook]);

  const removeWebhook = useCallback((id) => {
    setSettings(prev => ({
      ...prev,
      api: {
        ...prev.api,
        webhooks: prev.api.webhooks.filter(webhook => webhook.id !== id)
      }
    }));
    toast.success('Webhook removed successfully');
  }, []);

  const addApiKey = useCallback(() => {
    if (newApiKey.name && newApiKey.key) {
      setSettings(prev => ({
        ...prev,
        api: {
          ...prev.api,
          apiKeys: [...prev.api.apiKeys, { ...newApiKey, id: Date.now() }]
        }
      }));
      setNewApiKey({ name: '', key: '', description: '' });
      toast.success('API key added successfully');
    }
  }, [newApiKey]);

  const removeApiKey = useCallback((id) => {
    setSettings(prev => ({
      ...prev,
      api: {
        ...prev.api,
        apiKeys: prev.api.apiKeys.filter(key => key.id !== id)
      }
    }));
    toast.success('API key removed successfully');
  }, []);

  const addCarousel = useCallback(() => {
    if (newCarousel.name) {
      setSettings(prev => ({
        ...prev,
        gallery: {
          ...prev.gallery,
          carousels: [...prev.gallery.carousels, { ...newCarousel, id: Date.now() }]
        }
      }));
      setNewCarousel({ name: '', images: [], autoPlay: true, interval: 5000 });
      toast.success('Carousel added successfully');
    }
  }, [newCarousel]);

  const removeCarousel = useCallback((id) => {
    setSettings(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        carousels: prev.gallery.carousels.filter(carousel => carousel.id !== id)
      }
    }));
    toast.success('Carousel removed successfully');
  }, []);

  const toggleSecretVisibility = useCallback((key) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your store settings and integrations</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load settings</p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
        </div>
      ) : (

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API & Webhooks
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="scripts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Scripts
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                    placeholder="Your Store Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={settings.general.currency}
                    onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                    placeholder="USD"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Site Description</Label>
                <Textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                  placeholder="Brief description of your store"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={settings.general.contactPhone}
                    onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <div className="space-y-2">
                  <Input
                    value={settings.general.address.street}
                    onChange={(e) => handleNestedSettingChange('general', 'address', 'street', e.target.value)}
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={settings.general.address.city}
                      onChange={(e) => handleNestedSettingChange('general', 'address', 'city', e.target.value)}
                      placeholder="City"
                    />
                    <Input
                      value={settings.general.address.state}
                      onChange={(e) => handleNestedSettingChange('general', 'address', 'state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={settings.general.address.postalCode}
                      onChange={(e) => handleNestedSettingChange('general', 'address', 'postalCode', e.target.value)}
                      placeholder="Postal Code"
                    />
                    <Input
                      value={settings.general.address.country}
                      onChange={(e) => handleNestedSettingChange('general', 'address', 'country', e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('general')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={settings.seo.metaTitle}
                  onChange={(e) => handleSettingChange('seo', 'metaTitle', e.target.value)}
                  placeholder="Your site title for search engines"
                  maxLength={60}
                />
                <p className="text-sm text-muted-foreground">{settings.seo.metaTitle.length}/60 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={settings.seo.metaDescription}
                  onChange={(e) => handleSettingChange('seo', 'metaDescription', e.target.value)}
                  placeholder="Brief description for search engines"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">{settings.seo.metaDescription.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Input
                  value={settings.seo.metaKeywords}
                  onChange={(e) => handleSettingChange('seo', 'metaKeywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('seo')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save SEO Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>PayPal Email</Label>
                <Input
                  type="email"
                  value={settings.payment.paypalEmail}
                  onChange={(e) => handleSettingChange('payment', 'paypalEmail', e.target.value)}
                  placeholder="paypal@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Stripe Publishable Key</Label>
                <Input
                  value={settings.payment.stripePublishableKey}
                  onChange={(e) => handleSettingChange('payment', 'stripePublishableKey', e.target.value)}
                  placeholder="pk_test_..."
                />
              </div>

              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={settings.payment.taxRate}
                  onChange={(e) => handleSettingChange('payment', 'taxRate', parseFloat(e.target.value) || 0)}
                  placeholder="10"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('payment')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Payment Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Webhooks */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="API Key Name"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="API Key"
                  value={newApiKey.key}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
                />
                <Button onClick={addApiKey}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('api')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save API Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery */}
        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Max File Size (MB)</Label>
                <Input
                  type="number"
                  value={settings.gallery.maxFileSize}
                  onChange={(e) => handleSettingChange('gallery', 'maxFileSize', parseInt(e.target.value) || 5)}
                  placeholder="5"
                />
              </div>

              <div className="space-y-2">
                <Label>Image Quality (%)</Label>
                <Input
                  type="number"
                  value={settings.gallery.imageQuality}
                  onChange={(e) => handleSettingChange('gallery', 'imageQuality', parseInt(e.target.value) || 80)}
                  placeholder="80"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('gallery')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Gallery Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scripts */}
        <TabsContent value="scripts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Scripts & CSS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Header Scripts</Label>
                <Textarea
                  value={settings.scripts.headerScripts}
                  onChange={(e) => handleSettingChange('scripts', 'headerScripts', e.target.value)}
                  placeholder="<script>...</script> tags"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Scripts and meta tags to be inserted in the &lt;head&gt; section
                </p>
              </div>

              <div className="space-y-2">
                <Label>Footer Scripts</Label>
                <Textarea
                  value={settings.scripts.footerScripts}
                  onChange={(e) => handleSettingChange('scripts', 'footerScripts', e.target.value)}
                  placeholder="<script>...</script> tags"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Scripts to be inserted before the closing &lt;/body&gt; tag
                </p>
              </div>

              <div className="space-y-2">
                <Label>Custom CSS</Label>
                <Textarea
                  value={settings.scripts.customCSS}
                  onChange={(e) => handleSettingChange('scripts', 'customCSS', e.target.value)}
                  placeholder=".custom-class { color: #000; }"
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Custom CSS styles to be applied to your site
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('scripts')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Scripts & Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
};

export default SettingsPage;

