const fs = require('fs');
const path = require('path');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.generateInvoicePDF = async (req, res) => {
  const data = req.body;

  try {
    let html = fs.readFileSync(path.join(__dirname, '../templates/invoiceTemplate.html'), 'utf8');

    // Replace placeholders
    html = html.replace('{{customer}}', data.customer || '');
    html = html.replace('{{invoice}}', data.invoice || '');
    html = html.replace('{{date}}', data.invoiceDate || '');
    html = html.replace('{{place}}', data.place || '');
    html = html.replace('{{mobile}}', data.mobile || '');
    html = html.replace('{{gstin}}', data.gstin || '');
    html = html.replace('{{transport}}', data.transport || '');
    html = html.replace('{{lrNo}}', data.lrNo || '');
    html = html.replace('{{lrDate}}', data.lrDate || '');
    html = html.replace('{{cases}}', data.cases || '');
    html = html.replace('{{ewayBill}}', data.ewayBill || '');
    html = html.replace('{{bankName}}', data.bankName || '');
    html = html.replace('{{bankAccount}}', data.bankAccount || '');
    html = html.replace('{{ifsc}}', data.ifsc || '');
    html = html.replace('{{pf}}', data.pf || '');
    html = html.replace('{{subTotal}}', data.subTotal || '0.00');
    html = html.replace('{{cgst}}', data.cgst || '0.00');
    html = html.replace('{{sgst}}', data.sgst || '0.00');
    html = html.replace('{{cgstRate}}', data.cgstRate || '0.00');
    html = html.replace('{{sgstRate}}', data.sgstRate || '0.00');
    html = html.replace('{{mygst}}', '3456789098765');
    html = html.replace('{{roundOff}}', data.roundOff || '0.00');
    html = html.replace('{{totalGst}}', (parseFloat(data.cgst || 0) + parseFloat(data.sgst || 0)).toFixed(2));
    html = html.replace('{{grandTotal}}', data.grandTotal || '0.00');
    html = html.replace('{{note}}', data.note || '');

    const productRows = data.products.map((p, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${p.name}</td>
        <td>${p.hsn}</td>
        <td>${p.qty}</td>
        <td>${p.rate}</td>
        <td>${p.discount}</td>
        <td>${p.gst}</td>
        <td>${p.amount}</td>
      </tr>
    `).join('');

    html = html.replace(/{{#each products}}([\s\S]*?){{\/each}}/, productRows);

    // ✅ Launch browser with chrome-aws-lambda
    const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath || '/usr/bin/chromium-browser',
  headless: chromium.headless,
});

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
    });

    res.send(pdf);
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).send('PDF generation failed');
  }
};
