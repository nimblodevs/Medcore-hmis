import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

/**
 * Generate a PDF receipt for pharmacy sales
 * @param {Object} sale - The pharmacy sale data
 * @param {Array} items - Sale items
 * @returns {Buffer} PDF buffer
 */
export const generatePharmacyReceiptPDF = (sale, items) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 50, right: 50 } 
      });
      
      const chunks = [];
      const stream = new PassThrough();
      
      doc.pipe(stream);
      
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('PHARMACY RECEIPT', { align: 'center' });
      doc.moveDown(0.5);
      
      // Receipt Info
      doc.fontSize(10).font('Helvetica');
      doc.text(`Receipt Number: ${sale.saleNumber || 'N/A'}`, { align: 'left' });
      doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`, { align: 'left' });
      doc.text(`Patient Name: ${sale.patientName || 'N/A'}`, { align: 'left' });
      if (sale.patientNumber) {
        doc.text(`Patient Number: ${sale.patientNumber}`, { align: 'left' });
      }
      doc.text(`Payer Type: ${sale.payerType}`, { align: 'left' });
      doc.moveDown(1);
      
      // Items Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .text('Item', 50, tableTop, { width: 200, align: 'left' })
         .text('Qty', 260, tableTop, { width: 50, align: 'right' })
         .text('Unit Price', 320, tableTop, { width: 100, align: 'right' })
         .text('Total', 430, tableTop, { width: 100, align: 'right' });
      
      // Table line
      doc.moveTo(50, tableTop + 15)
         .lineTo(530, tableTop + 15)
         .stroke();
      
      // Items
      let y = tableTop + 25;
      doc.font('Helvetica').fontSize(9);
      
      items.forEach((item) => {
        const itemName = item.pharmacyItem?.name || 'Unknown Item';
        const truncatedName = itemName.length > 45 ? itemName.substring(0, 42) + '...' : itemName;
        
        doc.text(truncatedName, 50, y, { width: 200, align: 'left' })
           .text(item.quantity.toString(), 260, y, { width: 50, align: 'right' })
           .text(formatCurrency(item.unitPrice), 320, y, { width: 100, align: 'right' })
           .text(formatCurrency(item.totalAmount), 430, y, { width: 100, align: 'right' });
        
        y += 20;
        
        // Add page break if needed
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
      });
      
      // Total line
      const totalY = y + 10;
      doc.moveTo(50, totalY).lineTo(530, totalY).stroke();
      
      // Totals
      doc.font('Helvetica-Bold').fontSize(10);
      const totalsY = totalY + 15;
      doc.text('Gross Amount:', 330, totalsY, { width: 100, align: 'right' })
         .text(formatCurrency(sale.grossAmount), 430, totalsY, { width: 100, align: 'right' });
      
      if (sale.discountAmount && sale.discountAmount > 0) {
        doc.text('Discount:', 330, totalsY + 15, { width: 100, align: 'right' })
           .text(formatCurrency(sale.discountAmount), 430, totalsY + 15, { width: 100, align: 'right' });
      }
      
      doc.fontSize(12)
         .text('Net Amount:', 330, totalsY + 35, { width: 100, align: 'right' })
         .text(formatCurrency(sale.netAmount), 430, totalsY + 35, { width: 100, align: 'right' });
      
      if (sale.paidAmount) {
        doc.fontSize(10)
           .text('Paid Amount:', 330, totalsY + 55, { width: 100, align: 'right' })
           .text(formatCurrency(sale.paidAmount), 430, totalsY + 55, { width: 100, align: 'right' });
      }
      
      if (sale.outstandingAmount) {
        doc.fontSize(10)
           .text('Outstanding:', 330, totalsY + 70, { width: 100, align: 'right' })
           .text(formatCurrency(sale.outstandingAmount), 430, totalsY + 70, { width: 100, align: 'right' });
      }
      
      // Payment Status
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text(`Payment Status: ${sale.paymentStatus}`, 50, totalsY + 90, { align: 'left' })
         .text(`Sale Status: ${sale.saleStatus}`, 50, totalsY + 105, { align: 'left' });
      
      // Footer
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .text('Thank you for choosing our pharmacy services.', 50, 750, { align: 'center', width: 480 });
      doc.text('This is a computer-generated receipt.', 50, 765, { align: 'center', width: 480 });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a PDF report for pharmacy sales summary
 * @param {Object} params - Report parameters
 * @param {Array} sales - Sales data
 * @returns {Buffer} PDF buffer
 */
export const generateSalesReportPDF = (params, sales) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 40, right: 40 } 
      });
      
      const chunks = [];
      const stream = new PassThrough();
      
      doc.pipe(stream);
      
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      // Title
      doc.fontSize(18).font('Helvetica-Bold').text('PHARMACY SALES REPORT', { align: 'center' });
      doc.moveDown(0.5);
      
      // Report Parameters
      doc.fontSize(10).font('Helvetica');
      if (params.startDate) {
        doc.text(`From: ${new Date(params.startDate).toLocaleDateString()}`, { align: 'left' });
      }
      if (params.endDate) {
        doc.text(`To: ${new Date(params.endDate).toLocaleDateString()}`, { align: 'left' });
      }
      if (params.payerType) {
        doc.text(`Payer Type: ${params.payerType}`, { align: 'left' });
      }
      doc.moveDown(0.5);
      
      // Summary Statistics
      const totalSales = sales.length;
      const totalGross = sales.reduce((sum, s) => sum + Number(s.grossAmount || 0), 0);
      const totalNet = sales.reduce((sum, s) => sum + Number(s.netAmount || 0), 0);
      const totalPaid = sales.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
      
      doc.font('Helvetica-Bold').text('Summary:', { underline: true });
      doc.font('Helvetica')
         .text(`Total Transactions: ${totalSales}`)
         .text(`Total Gross Amount: ${formatCurrency(totalGross)}`)
         .text(`Total Net Amount: ${formatCurrency(totalNet)}`)
         .text(`Total Paid Amount: ${formatCurrency(totalPaid)}`);
      doc.moveDown(1);
      
      // Sales Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold')
         .fontSize(9)
         .text('Sale No.', 40, tableTop, { width: 100, align: 'left' })
         .text('Date', 145, tableTop, { width: 80, align: 'left' })
         .text('Patient', 230, tableTop, { width: 120, align: 'left' })
         .text('Payer', 355, tableTop, { width: 70, align: 'left' })
         .text('Net Amount', 430, tableTop, { width: 80, align: 'right' })
         .text('Status', 515, tableTop, { width: 60, align: 'left' });
      
      // Table line
      doc.moveTo(40, tableTop + 12)
         .lineTo(580, tableTop + 12)
         .stroke();
      
      // Sales rows
      let y = tableTop + 20;
      doc.font('Helvetica').fontSize(8);
      
      sales.forEach((sale) => {
        const dateStr = new Date(sale.createdAt).toLocaleDateString();
        const patientName = sale.patientName || 'N/A';
        const truncatedName = patientName.length > 28 ? patientName.substring(0, 25) + '...' : patientName;
        
        doc.text(sale.saleNumber || 'N/A', 40, y, { width: 100, align: 'left' })
           .text(dateStr, 145, y, { width: 80, align: 'left' })
           .text(truncatedName, 230, y, { width: 120, align: 'left' })
           .text(sale.payerType || 'N/A', 355, y, { width: 70, align: 'left' })
           .text(formatCurrency(sale.netAmount), 430, y, { width: 80, align: 'right' })
           .text(sale.saleStatus || 'N/A', 515, y, { width: 60, align: 'left' });
        
        y += 15;
        
        // Add page break if needed
        if (y > 720) {
          doc.addPage();
          y = 50;
          
          // Re-print table header on new page
          doc.font('Helvetica-Bold')
             .fontSize(9)
             .text('Sale No.', 40, y, { width: 100, align: 'left' })
             .text('Date', 145, y, { width: 80, align: 'left' })
             .text('Patient', 230, y, { width: 120, align: 'left' })
             .text('Payer', 355, y, { width: 70, align: 'left' })
             .text('Net Amount', 430, y, { width: 80, align: 'right' })
             .text('Status', 515, y, { width: 60, align: 'left' });
          
          doc.moveTo(40, y + 12).lineTo(580, y + 12).stroke();
          y += 20;
          doc.font('Helvetica').fontSize(8);
        }
      });
      
      // Footer
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .text(`Generated on: ${new Date().toLocaleString()}`, 40, 760, { align: 'center', width: 540 });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Format currency value
 * @param {number|string} value - Value to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString('en-KE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

/**
 * Generate CSV data for pharmacy reports
 * @param {Array} data - Array of objects
 * @param {Array} fields - Field names to include
 * @returns {string} CSV string
 */
export const generateCSV = (data, fields) => {
  if (!data || data.length === 0) {
    return '';
  }
  
  // Header row
  const header = fields.join(',');
  
  // Data rows
  const rows = data.map(row => {
    return fields.map(field => {
      const value = row[field];
      // Handle strings with commas or quotes
      if (typeof value === 'string') {
        const escaped = value.replace(/"/g, '""');
        return `"${escaped}"`;
      }
      if (value instanceof Date) {
        return `"${value.toISOString()}"`;
      }
      return value !== null && value !== undefined ? String(value) : '';
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};
