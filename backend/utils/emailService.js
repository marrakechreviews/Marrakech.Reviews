const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Email templates
const getEmailTemplate = (templateName, data) => {
  const templates = {
    reservationConfirmation: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .title {
            color: #28a745;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .reservation-id {
            background-color: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .details-section {
            margin: 25px 0;
        }
        .section-title {
            color: #007bff;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 5px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f8f9fa;
        }
        .detail-label {
            font-weight: 600;
            color: #6c757d;
        }
        .detail-value {
            font-weight: 500;
        }
        .price-total {
            background-color: #007bff;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
        }
        .status-badge {
            display: inline-block;
            background-color: #ffc107;
            color: #212529;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
        }
        .next-steps {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin: 25px 0;
        }
        .step {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }
        .step::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
        }
        .contact-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 25px 0;
        }
        .contact-item {
            margin: 8px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 10px 5px;
        }
        .button-secondary {
            background-color: #007bff;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
            }
            .detail-label {
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">E-Store Morocco</div>
            <h1 class="title">Reservation Confirmation</h1>
            <p>Thank you for choosing our services!</p>
        </div>

        <div class="reservation-id">
            Reservation ID: ${data.reservationId}
        </div>

        <div class="details-section">
            <h2 class="section-title">Reservation Details</h2>
            <div class="detail-row">
                <span class="detail-label">Activity:</span>
                <span class="detail-value">${data.activityName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${data.reservationDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Number of Persons:</span>
                <span class="detail-value">${data.numberOfPersons}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge">Pending Confirmation</span></span>
            </div>
        </div>

        <div class="details-section">
            <h2 class="section-title">Customer Information</h2>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${data.customerName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${data.customerEmail}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">WhatsApp:</span>
                <span class="detail-value">${data.customerWhatsApp}</span>
            </div>
            ${data.customerPhone ? `
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${data.customerPhone}</span>
            </div>
            ` : ''}
        </div>

        ${data.notes ? `
        <div class="details-section">
            <h2 class="section-title">Special Requests</h2>
            <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; font-style: italic;">
                "${data.notes}"
            </p>
        </div>
        ` : ''}

        <div class="price-total">
            Total Amount: $${data.totalPrice}
        </div>

        <div class="next-steps">
            <h3 style="color: #007bff; margin-top: 0;">What Happens Next?</h3>
            <div class="step">Our team will contact you within 2 hours to confirm availability</div>
            <div class="step">You'll receive payment instructions via WhatsApp or email</div>
            <div class="step">Complete payment to secure your reservation</div>
            <div class="step">Receive final confirmation with meeting point details</div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/${data.whatsappNumber}" class="button button-secondary">Contact via WhatsApp</a>
            <a href="mailto:${data.supportEmail}" class="button">Email Support</a>
        </div>

        <div class="contact-info">
            <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
            <div class="contact-item"><strong>Phone:</strong> ${data.contactPhone}</div>
            <div class="contact-item"><strong>WhatsApp:</strong> ${data.whatsappNumber}</div>
            <div class="contact-item"><strong>Email:</strong> ${data.supportEmail}</div>
            <div class="contact-item"><strong>Website:</strong> ${data.websiteUrl}</div>
        </div>

        <div class="footer">
            <p><strong>Important:</strong> This reservation is not confirmed until you receive our personal contact and complete the payment process.</p>
            <p>Please keep this email for your records and have it available when our team contacts you.</p>
            <hr style="margin: 20px 0;">
            <p>&copy; 2024 E-Store Morocco. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
    </div>
</body>
</html>
    `,

    adminNotification: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Reservation Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            border-left: 5px solid #dc3545;
        }
        .header {
            color: #dc3545;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .alert-badge {
            background-color: #dc3545;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
            border-radius: 5px;
            overflow: hidden;
        }
        .detail-table th,
        .detail-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-table th {
            background-color: #007bff;
            color: white;
            font-weight: bold;
        }
        .action-required {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .action-required h4 {
            color: #856404;
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert-badge">URGENT</div>
        <h1 class="header">🚨 New Reservation Alert</h1>
        
        <p><strong>A new reservation has been submitted and requires immediate attention!</strong></p>
        
        <table class="detail-table">
            <tr>
                <th>Reservation ID</th>
                <td>${data.reservationId}</td>
            </tr>
            <tr>
                <th>Activity</th>
                <td>${data.activityName}</td>
            </tr>
            <tr>
                <th>Customer</th>
                <td>${data.customerName}</td>
            </tr>
            <tr>
                <th>Email</th>
                <td>${data.customerEmail}</td>
            </tr>
            <tr>
                <th>WhatsApp</th>
                <td>${data.customerWhatsApp}</td>
            </tr>
            <tr>
                <th>Date</th>
                <td>${data.reservationDate}</td>
            </tr>
            <tr>
                <th>Persons</th>
                <td>${data.numberOfPersons}</td>
            </tr>
            <tr>
                <th>Total Amount</th>
                <td><strong>$${data.totalPrice}</strong></td>
            </tr>
            <tr>
                <th>Submitted</th>
                <td>${new Date().toLocaleString()}</td>
            </tr>
        </table>

        ${data.notes ? `
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4>Special Requests:</h4>
            <p style="font-style: italic;">"${data.notes}"</p>
        </div>
        ` : ''}

        <div class="action-required">
            <h4>⚡ Action Required</h4>
            <ul>
                <li>Contact customer within 2 hours via WhatsApp: ${data.customerWhatsApp}</li>
                <li>Confirm activity availability for ${data.reservationDate}</li>
                <li>Send payment instructions</li>
                <li>Update reservation status in admin panel</li>
            </ul>
        </div>

        <p><strong>Customer Contact Priority:</strong></p>
        <ol>
            <li>WhatsApp: ${data.customerWhatsApp}</li>
            <li>Email: ${data.customerEmail}</li>
            ${data.customerPhone ? `<li>Phone: ${data.customerPhone}</li>` : ''}
        </ol>

        <hr>
        <p style="font-size: 12px; color: #6c757d;">
            This is an automated notification from the E-Store reservation system.
            Please respond promptly to maintain customer satisfaction.
        </p>
    </div>
</body>
</html>
    `
  };

  return templates[templateName] || '';
};

// Create SMTP transporter
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

// Send reservation confirmation email to customer
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

// Send admin notification email
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

    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',');

    const mailOptions = {
      from: {
        name: 'E-Store Reservation System',
        address: process.env.SUPPORT_EMAIL
      },
      to: adminEmails,
      subject: `🚨 New Reservation Alert - ${reservationData.reservationId}`,
      html: getEmailTemplate('adminNotification', emailData),
      priority: 'high'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin notification sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('SMTP configuration is valid');
    return { success: true, message: 'SMTP configuration is valid' };
  } catch (error) {
    console.error('SMTP configuration error:', error);
    return { success: false, error: error.message };
  }
};

const sendFlightReservationConfirmation = async (reservation) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: reservation.customerInfo.email,
      subject: `Flight Reservation Confirmation - ${reservation.bookingReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Flight Reservation Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .flight-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .price-summary { background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .total-price { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .route { font-size: 18px; font-weight: bold; color: #667eea; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ Flight Reservation Confirmed!</h1>
              <p>Booking Reference: <strong>${reservation.bookingReference}</strong></p>
            </div>
            
            <div class="content">
              <h2>Dear ${reservation.customerInfo.firstName} ${reservation.customerInfo.lastName},</h2>
              <p>Thank you for choosing us for your travel needs! Your flight reservation has been successfully submitted and is currently being processed.</p>
              
              <div class="flight-details">
                <h3>Flight Details</h3>
                <div class="route">
                  ${reservation.flightDetails.departure.city}, ${reservation.flightDetails.departure.country} 
                  → ${reservation.flightDetails.arrival.city}, ${reservation.flightDetails.arrival.country}
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Trip Type:</span>
                  <span class="detail-value">${reservation.flightDetails.tripType.charAt(0).toUpperCase() + reservation.flightDetails.tripType.slice(1).replace('-', ' ')}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Departure:</span>
                  <span class="detail-value">${reservation.flightDetails.departure.airport} - ${new Date(reservation.flightDetails.departure.date).toLocaleDateString()}</span>
                </div>
                
                ${reservation.flightDetails.tripType === 'round-trip' ? `
                <div class="detail-row">
                  <span class="detail-label">Return:</span>
                  <span class="detail-value">${reservation.flightDetails.arrival.airport} - ${new Date(reservation.flightDetails.arrival.date).toLocaleDateString()}</span>
                </div>
                ` : ''}
                
                <div class="detail-row">
                  <span class="detail-label">Passengers:</span>
                  <span class="detail-value">
                    ${reservation.flightDetails.passengers.adults} Adult(s)
                    ${reservation.flightDetails.passengers.children > 0 ? `, ${reservation.flightDetails.passengers.children} Child(ren)` : ''}
                    ${reservation.flightDetails.passengers.infants > 0 ? `, ${reservation.flightDetails.passengers.infants} Infant(s)` : ''}
                  </span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Class:</span>
                  <span class="detail-value">${reservation.flightDetails.class.charAt(0).toUpperCase() + reservation.flightDetails.class.slice(1).replace('-', ' ')}</span>
                </div>
              </div>
              
              <div class="price-summary">
                <h3>Price Summary</h3>
                <div class="detail-row">
                  <span class="detail-label">Base Price:</span>
                  <span class="detail-value">${reservation.pricing.currency} ${reservation.pricing.basePrice.toFixed(2)}</span>
                </div>
                ${reservation.pricing.taxes > 0 ? `
                <div class="detail-row">
                  <span class="detail-label">Taxes:</span>
                  <span class="detail-value">${reservation.pricing.currency} ${reservation.pricing.taxes.toFixed(2)}</span>
                </div>
                ` : ''}
                ${reservation.pricing.fees > 0 ? `
                <div class="detail-row">
                  <span class="detail-label">Fees:</span>
                  <span class="detail-value">${reservation.pricing.currency} ${reservation.pricing.fees.toFixed(2)}</span>
                </div>
                ` : ''}
                <hr>
                <div class="total-price">
                  Total: ${reservation.pricing.currency} ${reservation.pricing.totalPrice.toFixed(2)}
                </div>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important Information</h4>
                <ul style="margin: 0; padding-left: 20px; color: #856404;">
                  <li>This is a reservation confirmation, not a ticket</li>
                  <li>Our team will contact you within 24 hours to finalize your booking</li>
                  <li>Please ensure your passport is valid for at least 6 months</li>
                  <li>Check visa requirements for your destination</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="tel:${process.env.CONTACT_PHONE || '+212 524-123456'}" class="btn">📞 Call Us</a>
                <a href="https://wa.me/${process.env.WHATSAPP_NUMBER || '212600000000'}" class="btn">💬 WhatsApp</a>
              </div>
              
              ${reservation.specialRequests ? `
              <div class="flight-details">
                <h4>Special Requests:</h4>
                <p>${reservation.specialRequests}</p>
              </div>
              ` : ''}
              
              <p>If you have any questions or need to make changes to your reservation, please contact us using the booking reference above.</p>
              
              <p>Thank you for choosing us for your travel needs!</p>
              
              <p>Best regards,<br>
              <strong>The Travel Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${reservation.customerInfo.email}</p>
              <p>© 2024 Your Travel Company. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Flight reservation confirmation email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending flight reservation confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendReservationConfirmation,
  sendAdminNotification,
  sendFlightReservationConfirmation,
  sendOrderConfirmation,
  sendOrderNotification,
  testEmailConfiguration,
  getEmailTemplate
};
