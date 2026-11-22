var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

test('invoice uses the HSN rate used for billing when gstRate is absent', function () {
  var items = [{
    id: 1,
    name: 'Rice',
    sku: 'GRN-001',
    hsn: '1006',
    price: 100,
    qty: 1
  }];
  var billed = pricing.computeTotals(items, '');
  var printed = invoice.computeInvoiceFigures({ items: items, coupon: '', total: billed.total });

  assert.deepEqual(billed, {
    subtotal: 100,
    discount: 0,
    taxable: 100,
    tax: 5,
    cgst: 2.5,
    sgst: 2.5,
    total: 105,
    lines: [{
      id: 1,
      name: 'Rice',
      hsn: '1006',
      gstPercent: 5,
      gross: 100,
      discount: 0,
      taxable: 100,
      tax: 5,
      net: 105
    }]
  });
  assert.deepEqual(printed, {
    subtotal: 100,
    discount: 0,
    tax: 5,
    cgst: 2.5,
    sgst: 2.5,
    total: 105,
    rows: [{
      name: 'Rice',
      sku: 'GRN-001',
      hsn: '1006',
      qty: 1,
      price: 100,
      gstPercent: 5,
      line: 100,
      lineTax: 5
    }]
  });
});

test('invoice applies SAVE10 before HSN GST like the billed total', function () {
  var items = [{
    id: 1,
    name: 'Rice',
    sku: 'GRN-001',
    hsn: '1006',
    price: 1000,
    qty: 1
  }];
  var billed = pricing.computeTotals(items, 'SAVE10');
  var printed = invoice.computeInvoiceFigures({
    items: items,
    coupon: 'SAVE10',
    total: billed.total
  });

  assert.deepEqual({
    discount: billed.discount,
    tax: billed.tax,
    cgst: billed.cgst,
    sgst: billed.sgst,
    total: billed.total
  }, {
    discount: 100,
    tax: 45,
    cgst: 22.5,
    sgst: 22.5,
    total: 945
  });
  assert.deepEqual({
    discount: printed.discount,
    tax: printed.tax,
    cgst: printed.cgst,
    sgst: printed.sgst,
    total: printed.total
  }, {
    discount: 100,
    tax: 45,
    cgst: 22.5,
    sgst: 22.5,
    total: 945
  });
});
