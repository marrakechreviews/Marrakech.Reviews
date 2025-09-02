const paypal = require('@paypal/paypal-server-sdk');

const configureEnvironment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client ID and secret are required');
  }

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

const client = () => {
  return new paypal.core.PayPalHttpClient(configureEnvironment());
};

const createOrder = async (order) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: order.totalPrice,
      },
    }],
  });

  try {
    const payPalOrder = await client().execute(request);
    return { success: true, order: payPalOrder.result };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

const captureOrder = async (paypalOrderID) => {
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    return { success: true, capture: capture.result };
  } catch (e) {
    return { success: false, error: e.message };
  }
};


module.exports = { client, createOrder, captureOrder };
