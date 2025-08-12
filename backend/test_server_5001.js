const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      general: {
        siteName: 'Test Store',
        siteDescription: 'Test Description',
        contactEmail: 'test@example.com',
        contactPhone: '+1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'Test Country'
        },
        currency: 'USD'
      }
    }
  });
});

app.put('/api/settings/:section', (req, res) => {
  console.log('Settings update request:', req.params.section, req.body);
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: req.body
  });
});

app.listen(5001, '0.0.0.0', () => {
  console.log('Test server running on port 5001');
});
