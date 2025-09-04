const axios = require('axios');

const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';

const getPayPalAccessToken = async () => {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  try {
    const response = await axios.post(`${PAYPAL_API_BASE}/v1/oauth2/token`, 'grant_type=client_credentials', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get PayPal access token:', error.response ? error.response.data : error.message);
    throw new Error('Could not get PayPal access token');
  }
};

const createOrder = async (orderData) => {
  const accessToken = await getPayPalAccessToken();
  try {
    const response = await axios.post(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: orderData.totalPrice.toFixed(2),
        },
        description: `Order ${orderData._id}`,
        invoice_id: orderData._id.toString(),
      }],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return { success: true, order: response.data };
  } catch (error) {
    console.error('PayPal create order error:', error.response ? error.response.data : error.message);
    return { success: false, error: 'Failed to create PayPal order.' };
  }
};

const captureOrder = async (paypalOrderID) => {
  const accessToken = await getPayPalAccessToken();
  try {
    const response = await axios.post(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderID}/capture`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return { success: true, capture: response.data };
  } catch (error) {
    console.error('PayPal capture order error:', error.response ? error.response.data : error.message);
    return { success: false, error: 'Failed to capture PayPal payment.' };
  }
};

module.exports = { createOrder, captureOrder };
