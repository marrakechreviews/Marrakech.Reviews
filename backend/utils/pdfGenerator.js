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
    doc
      .text('Bill to:', 300, 100)
      .text(order.shippingAddress.fullName, 300, 120)
      .text(order.shippingAddress.address, 300, 140)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 300, 160);

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

    doc
      .fontSize(10)
      .text(`Subtotal: $${order.itemsPrice.toFixed(2)}`, 450, y + 10, { align: 'right' })
      .text(`Tax: $${order.taxPrice.toFixed(2)}`, 450, y + 30, { align: 'right' })
      .text(`Shipping: $${order.shippingPrice.toFixed(2)}`, 450, y + 50, { align: 'right' });

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`Total: $${order.totalPrice.toFixed(2)}`, 450, y + 70, { align: 'right' });

    doc.end();
  });
};

module.exports = { generateInvoicePdf };
