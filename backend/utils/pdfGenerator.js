const PDFDocument = require('pdfkit');

const generateInvoicePdf = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });

    // Header
    doc
      .fontSize(20)
      .text('Invoice', { align: 'center' });

    // Info
    doc
      .fontSize(12)
      .text(`Invoice Number: ${order.orderNumber || order._id}`, 50, 100)
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 120)
      .text(`Total Paid: $${order.totalPrice.toFixed(2)}`, 50, 140);

    // Customer
    doc.text('Bill to:', 300, 100);
    if (order.reservation && order.reservation.customerInfo) {
      const customerInfo = order.reservation.customerInfo;
      doc.text(customerInfo.name, 300, 120);
      doc.text(customerInfo.email, 300, 140);
      if (customerInfo.phone) {
        doc.text(customerInfo.phone, 300, 160);
      }
    } else {
      doc
        .text(order.shippingAddress.fullName, 300, 120)
        .text(order.shippingAddress.address, 300, 140)
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 300, 160);
    }

    // Table Header
    doc
      .moveTo(50, 200)
      .lineTo(550, 200)
      .stroke()
      .fontSize(10)
      .text('Description', 50, 210)
      .text('Quantity', 250, 210, { width: 100, align: 'right' })
      .text('Unit Price', 350, 210, { width: 100, align: 'right' })
      .text('Total', 450, 210, { width: 100, align: 'right' });

    // Table Rows
    let y = 230;
    order.orderItems.forEach(item => {
      doc
        .fontSize(10)
        .text(item.name, 50, y)
        .text(item.qty, 250, y, { width: 100, align: 'right' })
        .text(`$${item.price.toFixed(2)}`, 350, y, { width: 100, align: 'right' })
        .text(`$${(item.price * item.qty).toFixed(2)}`, 450, y, { width: 100, align: 'right' });
      y += 20;
    });

    // Table Footer
    doc
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();

    let footerY = y + 10;
    doc
      .fontSize(10)
      .text(`Subtotal: $${order.itemsPrice.toFixed(2)}`, 450, footerY, { align: 'right' });
    footerY += 20;

    if (order.taxPrice > 0) {
      doc.text(`Tax: $${order.taxPrice.toFixed(2)}`, 450, footerY, { align: 'right' });
      footerY += 20;
    }

    if (order.shippingPrice > 0) {
      doc.text(`Service/Shipping Fee: $${order.shippingPrice.toFixed(2)}`, 450, footerY, { align: 'right' });
      footerY += 20;
    }

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`Total: $${order.totalPrice.toFixed(2)}`, 450, y + 70, { align: 'right' });

    doc.end();
  });
};

module.exports = { generateInvoicePdf };
