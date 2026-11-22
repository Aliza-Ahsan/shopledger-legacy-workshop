var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');

test('invoice matches the billed total and GST breakdown for an HSN-priced order', function () {
  var order = {
    id: 1001,
    coupon: '',
    subtotal: 610,
    discount: 0,
    tax: 66.9,
    total: 676.9,
    items: [{
      id: 8,
      name: 'Assam CTC Masala Chai 250g',
      sku: 'BEV-001',
      hsn: '0902',
      price: 140,
      qty: 2
    }, {
      id: 2,
      name: 'Unpolished Toor Dal 1kg',
      sku: 'GRN-002',
      hsn: '0713',
      price: 165,
      qty: 2
    }]
  };

  var figures = invoice.computeInvoiceFigures(order);

  assert.deepEqual({
    subtotal: figures.subtotal,
    discount: figures.discount,
    tax: figures.tax,
    cgst: figures.cgst,
    sgst: figures.sgst,
    total: figures.total
  }, {
    subtotal: 610,
    discount: 0,
    tax: 66.9,
    cgst: 33.45,
    sgst: 33.45,
    total: 676.9
  });
  assert.deepEqual(figures.rows.map(function (row) { return row.gstPercent; }), [18, 5]);
});
