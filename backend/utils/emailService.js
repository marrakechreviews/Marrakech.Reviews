/**
 * @file This file contains the email service for the application.
 * It uses nodemailer to send emails through a configured SMTP server (e.g., Gmail).
 * Email templates are stored as HTML files in the `backend/templates` directory and are populated with dynamic data.
 *
 * Required Environment Variables:
 * - `SMTP_USERNAME`: The username for the SMTP server.
 * - `SMTP_PASSWORD`: The password for the SMTP server (for Gmail, this might be an app-specific password).
 * - `SUPPORT_EMAIL`: The email address to use as the 'from' address in customer-facing emails.
 * - `ADMIN_EMAIL`: The email address for sending administrative notifications (e.g., new reservations).
 * - `BUSINESS_PHONE`: Business phone number, included in email footers.
 * - `BUSINESS_WHATSAPP`: Business WhatsApp number, included in email footers.
 * - `WEBSITE_URL`: The base URL of the website, used for generating links in emails.
 */
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

/**
 * Retrieves an email template from the file system and populates it with data.
 *
 * To create a new email template:
 * 1. Create a new HTML file in the `backend/templates` directory.
 * 2. Use `{{variableName}}` as placeholders for dynamic data.
 * 3. Call this function with the template name (without the .html extension) and the data object.
 *
 * @param {string} templateName - The name of the template file (without .html extension).
 * @param {object} data - An object containing the data to populate the template with.
 * @returns {string} The populated HTML template.
 */
const getEmailTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  try {
    let template = fs.readFileSync(templatePath, 'utf-8');
    for (const key in data) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, data[key]);
    }
    return template;
  } catch (error) {
    console.error(`Error reading email template ${templateName}:`, error);
    return '';
  }
};

/**
 * Creates and configures a nodemailer transporter using Gmail as the email service.
 * It authenticates using the `SMTP_USERNAME` and `SMTP_PASSWORD` environment variables.
 * Note: For Gmail, you may need to use an "App Password" if 2-Factor Authentication is enabled.
 * @returns {import('nodemailer').Transporter} A nodemailer transporter instance.
 */
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Sends a reservation confirmation email to the customer.
 * @param {object} reservationData - The reservation data.
 */
const sendReservationConfirmation = async (reservationData) => {
  try {
    const transporter = createTransporter();
    
    const emailData = {
      reservationId: reservationData.reservationId,
      activityName: reservationData.activity?.name || 'Activity',
      reservationDate: new Date(reservationData.reservationDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      numberOfPersons: reservationData.numberOfPersons,
      customerName: reservationData.customerInfo.name,
      customerEmail: reservationData.customerInfo.email,
      customerWhatsApp: reservationData.customerInfo.whatsapp,
      customerPhone: reservationData.customerInfo.phone || '',
      notes: reservationData.notes || '',
      totalPrice: reservationData.totalPrice,
      contactPhone: process.env.BUSINESS_PHONE || '+212 524-123456',
      whatsappNumber: process.env.BUSINESS_WHATSAPP || '+212 6XX-XXXXXX',
      supportEmail: process.env.SUPPORT_EMAIL || 'info@example.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://example.com'
    };

    const mailOptions = {
      from: {
        name: 'E-Store Morocco',
        address: process.env.SUPPORT_EMAIL
      },
      to: reservationData.customerInfo.email,
      subject: `Reservation Confirmation - ${reservationData.reservationId}`,
      html: getEmailTemplate('reservationConfirmation', emailData),
      attachments: []
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a notification email to the admin about a new reservation.
 * @param {object} reservationData - The reservation data.
 */
const sendAdminNotification = async (reservationData) => {
  try {
    const transporter = createTransporter();
    
    const emailData = {
      reservationId: reservationData.reservationId,
      activityName: reservationData.activity?.name || 'Activity',
      reservationDate: new Date(reservationData.reservationDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      numberOfPersons: reservationData.numberOfPersons,
      customerName: reservationData.customerInfo.name,
      customerEmail: reservationData.customerInfo.email,
      customerWhatsApp: reservationData.customerInfo.whatsapp,
      customerPhone: reservationData.customerInfo.phone || '',
      notes: reservationData.notes || '',
      totalPrice: reservationData.totalPrice
    };

    const mailOptions = {
      from: {
        name: 'E-Store System',
        address: process.env.SUPPORT_EMAIL
      },
      to: process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL,
      subject: `🚨 New Reservation Alert - ${reservationData.reservationId}`,
      html: getEmailTemplate('adminNotification', emailData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin notification sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a flight reservation confirmation email to the customer.
 * @param {object} reservation - The flight reservation data.
 */
const sendFlightReservationConfirmation = async (reservation) => {
  try {
    const transporter = createTransporter();
    
    const emailData = {
      bookingReference: reservation.bookingReference,
      firstName: reservation.customerInfo.firstName,
      lastName: reservation.customerInfo.lastName,
      departureCity: reservation.flightDetails.departure.city,
      departureCountry: reservation.flightDetails.departure.country,
      arrivalCity: reservation.flightDetails.arrival.city,
      arrivalCountry: reservation.flightDetails.arrival.country,
      tripType: reservation.flightDetails.tripType.charAt(0).toUpperCase() + reservation.flightDetails.tripType.slice(1).replace('-', ' '),
      departureAirport: reservation.flightDetails.departure.airport,
      departureDate: new Date(reservation.flightDetails.departure.date).toLocaleDateString(),
      arrivalAirport: reservation.flightDetails.arrival.airport,
      arrivalDate: new Date(reservation.flightDetails.arrival.date).toLocaleDateString(),
      adults: reservation.flightDetails.passengers.adults,
      children: reservation.flightDetails.passengers.children,
      infants: reservation.flightDetails.passengers.infants,
      class: reservation.flightDetails.class.charAt(0).toUpperCase() + reservation.flightDetails.class.slice(1).replace('-', ' '),
      currency: reservation.pricing.currency,
      basePrice: reservation.pricing.basePrice.toFixed(2),
      taxes: reservation.pricing.taxes.toFixed(2),
      fees: reservation.pricing.fees.toFixed(2),
      totalPrice: reservation.pricing.totalPrice.toFixed(2),
      specialRequests: reservation.specialRequests,
      contactPhone: process.env.CONTACT_PHONE || '+212 524-123456',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '212600000000',
      supportEmail: process.env.SUPPORT_EMAIL || 'info@example.com',
      customerEmail: reservation.customerInfo.email,
    };

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: reservation.customerInfo.email,
      subject: `Flight Reservation Confirmation - ${reservation.bookingReference}`,
      html: getEmailTemplate('flightReservationConfirmation', emailData),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Flight reservation confirmation email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending flight reservation confirmation email:', error);
    throw error;
  }
};

/**
 * Sends an order confirmation email to the customer.
 * @param {object} orderData - The order data.
 */
const sendOrderConfirmation = async (orderData) => {
  try {
    const transporter = createTransporter();
    
    const emailData = {
      orderId: orderData._id.toString(),
      customerName: orderData.user.name,
      customerEmail: orderData.user.email,
      orderItems: orderData.orderItems.map(item => `
        <div class="order-item">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-qty">Quantity: ${item.qty}</div>
            </div>
            <div class="item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
      `).join(''),
      itemsPrice: orderData.itemsPrice.toFixed(2),
      shippingPrice: orderData.shippingPrice.toFixed(2),
      taxPrice: orderData.taxPrice.toFixed(2),
      totalPrice: orderData.totalPrice.toFixed(2),
      status: orderData.status,
      isPaid: orderData.isPaid ? 'Paid' : 'Pending Payment',
      orderDate: new Date(orderData.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      shippingAddress: `
        <p><strong>${orderData.shippingAddress.fullName}</strong></p>
        <p>${orderData.shippingAddress.address}</p>
        <p>${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}</p>
        <p>${orderData.shippingAddress.country}</p>
      `,
      trackingUrl: `${process.env.FRONTEND_URL || 'https://example.com'}/orders/${orderData._id}`,
      contactPhone: process.env.BUSINESS_PHONE || '+212 524-123456',
      whatsappNumber: process.env.BUSINESS_WHATSAPP || '+212 6XX-XXXXXX',
      supportEmail: process.env.SUPPORT_EMAIL || 'info@example.com'
    };

    const mailOptions = {
      from: {
        name: 'E-Store Morocco',
        address: process.env.SUPPORT_EMAIL
      },
      to: orderData.user.email,
      subject: `Order Confirmation - ${orderData._id}`,
      html: getEmailTemplate('orderConfirmation', emailData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a notification email to the admin about a new order.
 * @param {object} orderData - The order data.
 */
const sendOrderNotification = async (orderData) => {
  try {
    const transporter = createTransporter();
    
    const emailData = {
      orderId: orderData._id.toString(),
      customerName: orderData.user.name,
      customerEmail: orderData.user.email,
      orderItems: orderData.orderItems.map(item => `
        <div class="item">
            <strong>${item.name}</strong> - Qty: ${item.qty} - $${(item.price * item.qty).toFixed(2)}
        </div>
      `).join(''),
      totalPrice: orderData.totalPrice.toFixed(2),
      paymentMethod: orderData.paymentMethod,
      orderDate: new Date(orderData.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      shippingAddress: `
        <p><strong>${orderData.shippingAddress.fullName}</strong></p>
        <p>${orderData.shippingAddress.address}</p>
        <p>${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}</p>
        <p>${orderData.shippingAddress.country}</p>
      `
    };

    const mailOptions = {
      from: {
        name: 'E-Store System',
        address: process.env.SUPPORT_EMAIL
      },
      to: process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL,
      subject: `🛒 New Order Alert - ${orderData._id}`,
      html: getEmailTemplate('orderNotification', emailData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order notification sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending order notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a test email to verify the email configuration.
 */
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SUPPORT_EMAIL,
      to: process.env.SUPPORT_EMAIL,
      subject: 'Email Configuration Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify that the email configuration is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a reservation status update email to the customer.
 * @param {object} reservationData - The reservation data.
 */
const sendReservationStatusUpdate = async (reservationData) => {
  try {
    const transporter = createTransporter();

    const emailData = {
      reservationId: reservationData.reservationId,
      activityName: reservationData.activity?.name || 'Activity',
      reservationDate: new Date(reservationData.reservationDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      numberOfPersons: reservationData.numberOfPersons,
      customerName: reservationData.customerInfo.name,
      customerEmail: reservationData.customerInfo.email,
      status: reservationData.status,
      contactPhone: process.env.BUSINESS_PHONE || '+212 524-123456',
      whatsappNumber: process.env.BUSINESS_WHATSAPP || '+212 6XX-XXXXXX',
      supportEmail: process.env.SUPPORT_EMAIL || 'info@example.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://example.com'
    };

    const mailOptions = {
      from: {
        name: 'E-Store Morocco',
        address: process.env.SUPPORT_EMAIL
      },
      to: reservationData.customerInfo.email,
      subject: `Reservation Status Update - ${reservationData.reservationId}`,
      html: getEmailTemplate('reservationStatusUpdate', emailData),
      attachments: []
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Status update email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending status update email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendReservationConfirmation,
  sendAdminNotification,
  sendFlightReservationConfirmation,
  sendOrderConfirmation,
  sendOrderNotification,
  sendReservationStatusUpdate,
  testEmailConfiguration,
  getEmailTemplate
};

