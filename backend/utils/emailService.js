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
const { generateInvoicePdf } = require('./pdfGenerator');

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

    // Handle conditional blocks
    template = template.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, key, content) => {
      return data[key] ? content : '';
    });

    // Replace provided data
    // First, handle triple braces for HTML content
    for (const key in data) {
      const regex = new RegExp(`{{{${key}}}}`, 'g');
      template = template.replace(regex, data[key] || '');
    }
    // Then, handle double braces for plain text
    for (const key in data) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, data[key] || '');
    }

    // Remove any remaining single placeholders
    template = template.replace(/{{[a-zA-Z0-9_]+}}/g, '');

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
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || process.env.SMTP_SERVER,
      port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'),
      secure: (process.env.EMAIL_PORT || process.env.SMTP_PORT) === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || process.env.SMTP_USERNAME,
        pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter configuration error:', error);
      } else {
        console.log('Email transporter is ready to send emails');
      }
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
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
      status: reservationData.status,
      contactPhone: process.env.BUSINESS_PHONE || '+212 708040530',
      whatsappNumber: process.env.BUSINESS_WHATSAPP || '+212 708040530',
      supportEmail: process.env.SUPPORT_EMAIL || 'Hello@Marrakech.Reviews',
      websiteUrl: process.env.WEBSITE_URL || 'https://Marrakech.Reviews'
    };

    const mailOptions = {
      from: {
        name: 'MARRAKECH REVIEWS',
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
        name: 'MARRAKECH REVIEWS System',
        address: process.env.SUPPORT_EMAIL
      },
      to: process.env.ADMIN_EMAIL || 'hello@marrakech.reviews',
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
      reservationId: orderData._id.toString(), // Map orderId to reservationId
      activityName: orderData.orderItems.map(item => `${item.name} (Qty: ${item.qty})`).join('<br>'), // Format order items
      reservationDate: new Date(orderData.createdAt).toLocaleDateString('en-US', { // Use order date
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      numberOfPersons: orderData.orderItems.reduce((sum, item) => sum + item.qty, 0), // Summarize quantity
      customerName: orderData.user.name,
      customerEmail: orderData.user.email,
      customerWhatsApp: orderData.shippingAddress.phone || '', // Assuming phone can be used as whatsapp
      customerPhone: orderData.shippingAddress.phone || '', // Use phone from shipping
      notes: orderData.notes || '', // Assuming there might be notes in the order
      totalPrice: orderData.totalPrice.toFixed(2),
      status: orderData.status,
      shippingAddress: `
        <p><strong>${orderData.shippingAddress.fullName}</strong></p>
        <p>${orderData.shippingAddress.address}</p>
        <p>${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}</p>
        <p>${orderData.shippingAddress.country}</p>
      `,
      contactPhone: process.env.BUSINESS_PHONE || '+212 708040530',
      whatsappNumber: process.env.BUSINESS_WHATSAPP || '+212 708040530',
      supportEmail: process.env.SUPPORT_EMAIL || 'Hello@Marrakech.Reviews',
      websiteUrl: process.env.WEBSITE_URL || 'https://Marrakech.Reviews'
    };

    const mailOptions = {
      from: {
        name: 'MARRAKECH REVIEWS',
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
        name: 'MARRAKECH REVIEWS System',
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
        name: 'MARRAKECH REVIEWS',
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

/**
 * Sends a notification email to the admin about a new contact form submission.
 * @param {object} contactData - The contact form submission data.
 */
const sendContactAdminNotification = async (contactData) => {
  try {
    const transporter = createTransporter();

    const emailData = {
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      category: contactData.category,
      message: contactData.message,
      date: new Date(contactData.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    };

    const adminEmail = 'hello@marrakech.reviews';
    const mailOptions = {
      from: {
        name: 'Marrakech Reviews System',
        address: process.env.SUPPORT_EMAIL
      },
      to: adminEmail,
      subject: `New Contact Inquiry: ${contactData.subject}`,
      html: getEmailTemplate('contactAdminNotification', emailData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Contact admin notification sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending contact admin notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a confirmation email to the user after submitting the contact form.
 * @param {object} contactData - The contact form submission data.
 */
const sendContactConfirmation = async (contactData) => {
  try {
    const transporter = createTransporter();

    const emailData = {
      name: contactData.name,
      subject: contactData.subject,
      category: contactData.category,
      date: new Date(contactData.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      websiteUrl: process.env.WEBSITE_URL || 'https://example.com'
    };

    const mailOptions = {
      from: {
        name: 'Marrakech Reviews',
        address: process.env.SUPPORT_EMAIL
      },
      to: contactData.email,
      subject: 'Thank you for contacting us!',
      html: getEmailTemplate('contactConfirmation', emailData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Contact confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending contact confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a travel reservation confirmation email to the customer.
 * @param {object} reservationData - The travel reservation data.
 */
const sendTravelReservationConfirmation = async (reservationData) => {
  try {
    const transporter = createTransporter();
    
    const emailData = {
      reservationId: reservationData.reservationId,
      programName: reservationData.programId?.title || 'Organized Travel',
      destination: reservationData.destination,
      preferredDate: new Date(reservationData.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      numberOfTravelers: reservationData.numberOfTravelers,
      firstName: reservationData.firstName,
      lastName: reservationData.lastName,
      email: reservationData.email,
      phone: reservationData.phone,
      specialRequests: reservationData.specialRequests || '',
      totalPrice: reservationData.totalPrice,
      status: reservationData.status,
      contactPhone: process.env.BUSINESS_PHONE || '+212 524-123456',
      whatsappNumber: process.env.BUSINESS_WHATSAPP || '+212 6XX-XXXXXX',
      supportEmail: process.env.SUPPORT_EMAIL || 'info@example.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://example.com'
    };

    const mailOptions = {
      from: {
        name: 'MARRAKECH REVIEWS',
        address: process.env.SUPPORT_EMAIL
      },
      to: reservationData.email,
      subject: `Travel Reservation Confirmation - ${reservationData.reservationId}`,
      html: getEmailTemplate('travelReservationConfirmation', emailData),
      attachments: []
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Travel confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending travel confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a notification email to the admin about a new travel reservation.
 * @param {object} reservationData - The travel reservation data.
 */
const sendTravelAdminNotification = async (reservationData) => {
  try {
    const transporter = createTransporter();
    
    const emailData = {
      reservationId: reservationData.reservationId,
      programName: reservationData.programId?.title || 'Organized Travel',
      destination: reservationData.destination,
      preferredDate: new Date(reservationData.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      numberOfTravelers: reservationData.numberOfTravelers,
      firstName: reservationData.firstName,
      lastName: reservationData.lastName,
      email: reservationData.email,
      phone: reservationData.phone,
      specialRequests: reservationData.specialRequests || '',
      totalPrice: reservationData.totalPrice,
      submittedDate: new Date(reservationData.createdAt).toLocaleString('en-US', { timeZone: 'UTC' })
    };

    const mailOptions = {
      from: {
        name: 'MARRAKECH REVIEWS System',
        address: process.env.SUPPORT_EMAIL
      },
      to: process.env.ADMIN_EMAIL || 'hello@marrakech.reviews',
      subject: `🚨 New Travel Reservation Alert - ${reservationData.reservationId}`,
      html: getEmailTemplate('travelAdminNotification', emailData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Travel admin notification sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending travel admin notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a generic reservation update notification.
 * This can be used for any change: status, payment, details, etc.
 * @param {object} reservationData - The full reservation object (Activity or Travel).
 */
const sendReservationUpdateNotification = async (reservationData) => {
  try {
    const transporter = createTransporter();
    
    const isActivity = !!reservationData.activity;
    const customerEmail = isActivity ? reservationData.customerInfo.email : reservationData.email;
    const customerName = isActivity ? reservationData.customerInfo.name : `${reservationData.firstName} ${reservationData.lastName}`;

    const emailData = {
      isActivity,
      customerName,
      reservationId: reservationData.reservationId || reservationData._id.toString(),
      bookingName: isActivity ? reservationData.activity?.name : reservationData.programId?.title,
      bookingDate: new Date(isActivity ? reservationData.reservationDate : reservationData.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }),
      numberOfGuests: isActivity ? reservationData.numberOfPersons : reservationData.numberOfTravelers,
      status: reservationData.status,
      paymentStatus: reservationData.paymentStatus,
      totalPrice: reservationData.totalPrice,
      notes: reservationData.notes || reservationData.adminNotes || '',
      whatsappNumber: process.env.BUSINESS_WHATSAPP || '+212 6XX-XXXXXX',
      supportEmail: process.env.SUPPORT_EMAIL || 'info@example.com',
    };

    // Send to customer
    const customerMailOptions = {
      from: { name: 'MARRAKECH REVIEWS', address: process.env.SUPPORT_EMAIL },
      to: customerEmail,
      subject: `Update on your reservation - ${emailData.reservationId}`,
      html: getEmailTemplate('reservationUpdateNotification', emailData),
      text: getEmailTemplate('reservationUpdateNotification.txt', emailData)
    };
    await transporter.sendMail(customerMailOptions);
    console.log(`Update notification sent to customer ${customerEmail}`);

    // Send to admin
    const adminMailOptions = {
      from: { name: 'MARRAKECH REVIEWS System', address: process.env.SUPPORT_EMAIL },
      to: process.env.ADMIN_EMAIL || 'hello@marrakech.reviews',
      subject: `[Admin] Reservation Updated - ${emailData.reservationId}`,
      html: getEmailTemplate('reservationUpdateNotification', emailData), // Can reuse or create an admin-specific one
      text: getEmailTemplate('reservationUpdateNotification.txt', emailData)
    };
    await transporter.sendMail(adminMailOptions);
    console.log(`Update notification sent to admin`);

    return { success: true };

  } catch (error) {
    console.error('Error sending reservation update notification:', error);
    return { success: false, error: error.message };
  }
};


const sendReservationPendingEmail = async (reservationData) => {
  try {
    const transporter = createTransporter();
    const paymentLink = `${process.env.WEBSITE_URL}/payment/reservation/${reservationData.paymentToken}`;

    const emailData = {
      customerName: reservationData.customerInfo.name,
      activityName: reservationData.activity.name,
      reservationId: reservationData.reservationId,
      reservationDate: new Date(reservationData.reservationDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      numberOfPersons: reservationData.numberOfPersons,
      totalPrice: reservationData.totalPrice,
      paymentLink,
    };

    const mailOptions = {
      from: {
        name: 'MARRAKECH REVIEWS',
        address: process.env.SUPPORT_EMAIL
      },
      to: reservationData.customerInfo.email,
      subject: `Your Reservation is Pending Payment - ${reservationData.reservationId}`,
      html: getEmailTemplate('reservationPending', emailData),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Reservation pending email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending reservation pending email:', error);
    return { success: false, error: error.message };
  }
};

const sendReservationConfirmationWithInvoice = async (order, reservation) => {
  try {
    const transporter = createTransporter();
    const pdfBuffer = await generateInvoicePdf(order);

    const emailData = {
      customerName: reservation.customerInfo.name,
      activityName: reservation.activity.name,
      reservationId: reservation.reservationId,
      reservationDate: new Date(reservation.reservationDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      numberOfPersons: reservation.numberOfPersons,
      totalPrice: reservation.totalPrice,
    };

    const mailOptions = {
      from: {
        name: 'MARRAKECH REVIEWS',
        address: process.env.SUPPORT_EMAIL
      },
      to: reservation.customerInfo.email,
      subject: `Reservation Confirmed - ${reservation.reservationId}`,
      html: getEmailTemplate('reservationConfirmation', emailData),
      attachments: [
        {
          filename: `invoice-${reservation.reservationId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Reservation confirmation with invoice email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending reservation confirmation with invoice email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends an order status update email to the customer.
 * @param {object} orderData - The order data.
 */
const sendOrderStatusUpdate = async (orderData) => {
  try {
    const transporter = createTransporter();

    const emailData = {
      orderId: orderData._id.toString(),
      customerName: orderData.user.name,
      status: orderData.status,
      trackingNumber: orderData.trackingNumber,
      websiteUrl: process.env.WEBSITE_URL || 'https://Marrakech.Reviews'
    };

    const mailOptions = {
      from: {
        name: 'MARRAKECH REVIEWS',
        address: process.env.SUPPORT_EMAIL
      },
      to: orderData.user.email,
      subject: `Your Order Status has been Updated - ${orderData._id}`,
      html: getEmailTemplate('orderStatusUpdate', emailData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending order status update email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a payment reminder email to the customer.
 * @param {object} orderData - The order data.
 * @param {string} paymentLink - The link for the customer to pay.
 */
const sendPaymentReminder = async (orderData, paymentLink) => {
  try {
    const transporter = createTransporter();

    const emailData = {
      orderId: orderData._id.toString(),
      customerName: orderData.user.name,
      totalPrice: orderData.totalPrice.toFixed(2),
      paymentLink: paymentLink
    };

    const mailOptions = {
      from: {
        name: 'MARRAKECH REVIEWS',
        address: process.env.SUPPORT_EMAIL
      },
      to: orderData.user.email,
      subject: `Action Required: Payment for Your Order ${orderData._id}`,
      html: getEmailTemplate('paymentReminder', emailData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment reminder email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending payment reminder email:', error);
    return { success: false, error: error.message };
  }
};

const sendFreeReservationStatusUpdate = async (reservationData) => {
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
      reservationType: reservationData.reservationType,
      contactPhone: process.env.BUSINESS_PHONE || '+212 524-123456',
      whatsappNumber: process.env.BUSINESS_WHATSAPP || '+212 6XX-XXXXXX',
      supportEmail: process.env.SUPPORT_EMAIL || 'info@example.com',
      websiteUrl: process.env.WEBSITE_URL || 'https://example.com'
    };

    const mailOptions = {
      from: {
        name: 'MARRAKECH REVIEWS',
        address: process.env.SUPPORT_EMAIL
      },
      to: reservationData.customerInfo.email,
      subject: `Free Reservation Status Update - ${reservationData.reservationId}`,
      html: getEmailTemplate('freeReservationStatusUpdate', emailData),
      attachments: []
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Free reservation status update email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending free reservation status update email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPaymentReminder,
  sendOrderStatusUpdate,
  sendReservationConfirmationWithInvoice,
  sendReservationPendingEmail,
  sendReservationConfirmation,
  sendAdminNotification,
  sendFlightReservationConfirmation,
  sendOrderConfirmation,
  sendOrderNotification,
  sendReservationStatusUpdate,
  sendReservationUpdateNotification,
  testEmailConfiguration,
  getEmailTemplate,
  sendContactAdminNotification,
  sendContactConfirmation,
  sendTravelReservationConfirmation,
  sendTravelAdminNotification,
  sendFreeReservationStatusUpdate
};
