import { useState } from 'react';

const today = new Date().toISOString().split('T')[0];

export default function InvoiceForm() {
  const [form, setForm] = useState({
    customer: '', place: '', mobile: '', gstin: '', invoice: '', transport: '',
    lrNo: '', lrDate: '', cases: '', ewayBill: '', bankName: '', bankAccount: '',
    ifsc: '', pf: '', note: '', invoiceDate: today,
  });

  const [products, setProducts] = useState([{ name: '', hsn: '', qty: '', rate: '', discount: '', gst: '', amount: 0 }]);
  const [taxRates, setTaxRates] = useState({ cgst: 9, sgst: 9 });

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTaxRateChange = (taxType, value) => {
    setTaxRates({ ...taxRates, [taxType]: parseFloat(value) || 0 });
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    const { qty, rate, discount, gst } = updated[index];
    const q = parseFloat(qty) || 0;
    const r = parseFloat(rate) || 0;
    const d = parseFloat(discount) || 0;
    const g = parseFloat(gst) || 0;
    const base = q * r * (1 - d / 100);
    updated[index].amount = parseFloat((base * (1 + g / 100)).toFixed(2));
    setProducts(updated);
  };

  const addProductRow = () => {
    if (products.length >= 17){
      alert("You can only add up to 17 products.");
      return;
    }
    setProducts([...products, { name: '', hsn: '', qty: '', rate: '', discount: '', gst: '', amount: 0 }]);
  };

  const removeProductRow = (index) => {
    if (products.length > 1) {
      const updated = products.filter((_, i) => i !== index);
      setProducts(updated);
    }
  };

  const subTotal = products.reduce((sum, p) => sum + p.amount, 0);
  const cgst = subTotal * (taxRates.cgst / 100);
  const sgst = subTotal * (taxRates.sgst / 100);
  const pfValue = parseFloat(form.pf) || 0;
  const grossTotal = subTotal + cgst + sgst + pfValue;
  const roundedGrandTotal = Math.round(grossTotal);
  const roundOff = parseFloat((roundedGrandTotal - grossTotal).toFixed(2));
  const grandTotal = roundedGrandTotal;

  const downloadInvoice = async () => {
    const payload = {
      ...form,
      products,
      subTotal: subTotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      pf: pfValue.toFixed(2),
      cgstRate: taxRates.cgst,
      sgstRate: taxRates.sgst,
      roundOff: roundOff.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };

    const response = await fetch("https://localhost:5000/api/invoice/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert("Failed to generate invoice");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-white shadow rounded">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Invoice Generator</h1>

      {/* Customer & Invoice Details */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Customer & Invoice Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter customer name" 
              name="customer" 
              value={form.customer} 
              onChange={handleFormChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter invoice number" 
              name="invoice" 
              value={form.invoice} 
              onChange={handleFormChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Place of Supply</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter place of supply" 
              name="place" 
              value={form.place} 
              onChange={handleFormChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input 
              className="border border-gray-300 p-2 w-full bg-gray-100 rounded" 
              value={form.invoiceDate} 
              readOnly 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter mobile number" 
              name="mobile" 
              value={form.mobile} 
              onChange={handleFormChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN Number</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter GSTIN number" 
              name="gstin" 
              value={form.gstin} 
              onChange={handleFormChange} 
            />
          </div>
        </div>
      </div>

      {/* Transport Details */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Transport Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transport</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter transport details" 
              name="transport" 
              value={form.transport} 
              onChange={handleFormChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">L.R. Number</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter L.R. number" 
              name="lrNo" 
              value={form.lrNo} 
              onChange={handleFormChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">L.R. Date</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              type="date" 
              name="lrDate" 
              value={form.lrDate} 
              onChange={handleFormChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Cases</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter number of cases" 
              name="cases" 
              value={form.cases} 
              onChange={handleFormChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Way Bill</label>
            <input 
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter E-Way Bill number" 
              name="ewayBill" 
              value={form.ewayBill} 
              onChange={handleFormChange} 
            />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Product Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border border-gray-300 p-3 font-semibold">Sr No</th>
                <th className="border border-gray-300 p-3 font-semibold">Product Name</th>
                <th className="border border-gray-300 p-3 font-semibold">HSN/SAC</th>
                <th className="border border-gray-300 p-3 font-semibold">Quantity</th>
                <th className="border border-gray-300 p-3 font-semibold">Rate (₹)</th>
                <th className="border border-gray-300 p-3 font-semibold">Discount %</th>
                <th className="border border-gray-300 p-3 font-semibold">GST %</th>
                <th className="border border-gray-300 p-3 font-semibold">Amount (₹)</th>
                <th className="border border-gray-300 p-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i} className="even:bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 p-2 text-center font-medium">{i + 1}</td>
                  <td className="border border-gray-300 p-2">
                    <input 
                      value={p.name} 
                      onChange={e => handleProductChange(i, 'name', e.target.value)} 
                      className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 rounded"
                      placeholder="Product name" 
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input 
                      value={p.hsn} 
                      onChange={e => handleProductChange(i, 'hsn', e.target.value)} 
                      className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 rounded"
                      placeholder="HSN/SAC" 
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input 
                      value={p.qty} 
                      onChange={e => handleProductChange(i, 'qty', e.target.value)} 
                      className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 rounded"
                      placeholder="Qty" 
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input 
                      value={p.rate} 
                      onChange={e => handleProductChange(i, 'rate', e.target.value)} 
                      className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 rounded"
                      placeholder="Rate" 
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input 
                      value={p.discount} 
                      onChange={e => handleProductChange(i, 'discount', e.target.value)} 
                      className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 rounded"
                      placeholder="Disc%" 
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input 
                      value={p.gst} 
                      onChange={e => handleProductChange(i, 'gst', e.target.value)} 
                      className="w-full p-1 border-0 focus:ring-1 focus:ring-blue-500 rounded"
                      placeholder="GST%" 
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-semibold">₹ {p.amount.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => removeProductRow(i)}
                      disabled={products.length === 1}
                      className={`px-2 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                        products.length === 1 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                      title={products.length === 1 ? 'Cannot remove the last product' : 'Remove this product'}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button 
          onClick={addProductRow} 
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
        >
          + Add Product Row
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bank Details */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Bank Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input 
                className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter bank name" 
                name="bankName" 
                value={form.bankName} 
                onChange={handleFormChange} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
              <input 
                className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter account number" 
                name="bankAccount" 
                value={form.bankAccount} 
                onChange={handleFormChange} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RTGS/IFSC Code</label>
              <input 
                className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter IFSC code" 
                name="ifsc" 
                value={form.ifsc} 
                onChange={handleFormChange} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">P & F (Packing & Forwarding)</label>
              <input 
                className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter P&F charges" 
                name="pf" 
                value={form.pf} 
                onChange={handleFormChange} 
              />
            </div>
          </div>
        </div>

        {/* Tax Calculation */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Tax Calculation</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded border">
              <span className="font-medium">Taxable Amount:</span>
              <span className="float-right font-semibold">₹ {subTotal.toFixed(2)}</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <div className="flex items-center justify-between">
                <label className="font-medium">CGST Rate (%):</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={taxRates.cgst}
                    onChange={(e) => handleTaxRateChange('cgst', e.target.value)}
                    className="w-16 p-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.25"
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="mt-1">
                <span className="text-sm text-gray-600">CGST Amount:</span>
                <span className="float-right font-semibold">₹ {cgst.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <div className="flex items-center justify-between">
                <label className="font-medium">SGST Rate (%):</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={taxRates.sgst}
                    onChange={(e) => handleTaxRateChange('sgst', e.target.value)}
                    className="w-16 p-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.25"
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="mt-1">
                <span className="text-sm text-gray-600">SGST Amount:</span>
                <span className="float-right font-semibold">₹ {sgst.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <span className="font-medium">Round Off:</span>
              <span className="float-right font-semibold">₹ 0.00</span>
            </div>
            
            <div className="bg-green-100 p-4 rounded border-2 border-green-300">
              <span className="font-bold text-lg">Grand Total:</span>
              <span className="float-right font-bold text-lg text-green-700">₹ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mt-8">
        <label className="block text-lg font-semibold text-gray-700 mb-2">Notes / Terms & Conditions</label>
        <textarea 
          className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          placeholder="Enter any additional notes, terms, or conditions..." 
          rows={4} 
          name="note" 
          value={form.note} 
          onChange={handleFormChange} 
        />
      </div>

      {/* Generate Button */}
      <div className="mt-8 text-center">
        <button
          onClick={downloadInvoice}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          📄 Generate & Download Invoice PDF
        </button>
      </div>
    </div>
  );
}