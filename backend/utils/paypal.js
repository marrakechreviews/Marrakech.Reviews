const PAYPAL_API_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

/**
 * Get PayPal access token using client credentials.
 */
const getPayPalAccessToken = async () => {
  try {
    const response = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to get access token');
    }
    return data.access_token;
  } catch (error) {
    console.error('Error fetching PayPal access token:', error);
    throw error;
  }
};

/**
 * Create a PayPal order.
 */
const createOrder = async (order, receiverEmail) => {
  try {
    const accessToken = await getPayPalAccessToken();
    const orderDetails = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: order.totalPrice.toFixed(2),
          },
          payee: {
            email_address: receiverEmail,
          },
        },
      ],
      application_context: {
        return_url: `${process.env.WEBSITE_URL}/checkout/success`,
        cancel_url: `${process.env.WEBSITE_URL}/checkout/cancel`,
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderDetails),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, order: data };
    } else {
      return { success: false, error: data.message || 'Failed to create PayPal order' };
    }
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

/**
 * Capture a PayPal order.
 */
const captureOrder = async (paypalOrderID) => {
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders/${paypalOrderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, capture: data };
    } else {
      return { success: false, error: data.message || 'Failed to capture PayPal order' };
    }
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
};

module.exports = { createOrder, captureOrder };
